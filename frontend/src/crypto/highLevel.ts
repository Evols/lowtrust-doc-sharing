
import { randomBytes, secretbox, box, sign } from 'tweetnacl';
import { decodeBase64, decodeUTF8, encodeBase64, encodeUTF8 } from 'tweetnacl-util';
import { IChallenge } from 'ltds_common/dist/schemas';
import { getDocument, getDocumentChallenges, getUser, postDocument, postUser } from '../utils/backend';
import { buildSecretBasedChallenge, buildSecretBasedSolution } from './challenges';
import { passwordToSecretKey, genKeyVault, IKeyVault, KeyVault, KeyVaultContent } from './vault';
import { z } from 'zod';

// Returns the master keys
export async function registerWithPassword(url: string, email: string, password: string) {

  const existingUser = await getUser(url, email);
  if (existingUser !== undefined) {
    return false;
  }

  const masterSecretKey = randomBytes(secretbox.keyLength);
  const masterBoxKeyPair = box.keyPair();
  const masterSignKeyPair = sign.keyPair();
  const failsafeSecretKey = randomBytes(secretbox.keyLength);
  const passwordSalt = randomBytes(secretbox.keyLength);
  const loginSecretKey = await passwordToSecretKey(password, passwordSalt);

  const failsafeVault = genKeyVault(masterSecretKey, masterBoxKeyPair.secretKey, masterSignKeyPair.secretKey, failsafeSecretKey, { type: 'failsafe' });
  const passwordVault = genKeyVault(masterSecretKey, masterBoxKeyPair.secretKey, masterSignKeyPair.secretKey, loginSecretKey, { type: 'password', salt: encodeBase64(passwordSalt) });
  const vaults: IKeyVault[] = [ failsafeVault, passwordVault ];

  const challenges: IChallenge[] = [
    await buildSecretBasedChallenge(failsafeSecretKey),
    await buildSecretBasedChallenge(decodeUTF8(password)),
  ];

  // The idea is that these documents can be viewed by anyone, but edited by the owner only
  const docId = await postDocument(
    url,
    {
      cypher: JSON.stringify({ vaults }),
      hash: '', // N/A
      readChallenges: challenges,
      writeChallenges: challenges,
    },
  );

  await postUser(
    url,
    {
      email,
      initialDocId: docId,
    },
  );

  return {
    masterSecretKey,
    masterBoxKeyPair,
    masterSignKeyPair,
  };
}

// Returns the master keys
export async function loginWithPassword(url: string, email: string, password: string) {

  const existingUser = await getUser(url, email);
  if (existingUser === undefined) {
    return false;
  }

  const challenges = (await getDocumentChallenges(url, existingUser.initialDocId)).readChallenges.filter(
    challenge => JSON.parse(challenge.helper).type === 'secret'
  );
  const challengeSolutions = (await Promise.all(challenges.map(
    async challenge => {
      const solution = await buildSecretBasedSolution(decodeUTF8(password), challenge.helper);
      if (solution === undefined) {
        return [];
      } else {
        return [solution];
      }
    }
  ))).flat();

  const doc = await getDocument(url, existingUser.initialDocId, challengeSolutions);

  const vaults = z.object({
    vaults: z.array(KeyVault),
  }).parse(JSON.parse(doc.cypher)).vaults;
  const usingPasswordVault = vaults.find(vault => vault.metadata.type === 'password');

  if (usingPasswordVault === undefined || usingPasswordVault.metadata.type !== 'password') {
    return false;
  }

  const loginSecretKey = await passwordToSecretKey(password, decodeBase64(usingPasswordVault.metadata.salt));
  console.log('loginSymKey:', loginSecretKey);
  const rawDecipheredVault = secretbox.open(
    decodeBase64(usingPasswordVault.cypher),
    decodeBase64(usingPasswordVault.nonce),
    loginSecretKey,
  );

  if (rawDecipheredVault === null) {
    console.warn('Someone tampered with the vault!!!');
    return false;
  }

  const decipheredVault = KeyVaultContent.parse(JSON.parse(encodeUTF8(rawDecipheredVault)));

  return {
    masterSecretKey: decodeBase64(decipheredVault.masterSecretKey),
    masterBoxKeyPair: box.keyPair.fromSecretKey(decodeBase64(decipheredVault.masterBoxKey)),
    masterSignKeyPair: sign.keyPair.fromSecretKey(decodeBase64(decipheredVault.masterSignKey)),
  };
}
