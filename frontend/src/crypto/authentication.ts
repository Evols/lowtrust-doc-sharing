
import { randomBytes, secretbox, box, sign } from 'tweetnacl';
import { IChallenge } from 'ltds_common/dist/schemas';
import { encodeBase64, decodeUTF8, decodeBase64, encodeUTF8 } from 'tweetnacl-util';
import { z } from 'zod';
import { getUser, postRecord, postUser, getRecordChallenges, getRecord } from '../utils/backend';
import { buildSecretBasedChallenge, buildSecretBasedSolution } from './challenges';
import { createDirectory } from './documents';
import { passwordToSecretKey, genKeyVault, IKeyVault, KeyVault, KeyVaultContent } from './vault';

// Returns the master keys
export async function registerWithPassword(url: string, email: string, password: string) {

  const existingUser = await getUser(url, email);
  if (existingUser !== undefined) {
    return false;
  }

  const masterSecretKey = randomBytes(secretbox.keyLength);
  const masterBoxKeyPair = box.keyPair();
  const masterSignKeyPair = sign.keyPair();

  const directoryDocId = await createDirectory(url, masterSecretKey, []);

  const failsafeSecretKey = randomBytes(secretbox.keyLength);
  const passwordSalt = randomBytes(secretbox.keyLength);
  const loginSecretKey = await passwordToSecretKey(password, passwordSalt);

  const failsafeVault = genKeyVault(masterSecretKey, masterBoxKeyPair.secretKey, masterSignKeyPair.secretKey, directoryDocId, failsafeSecretKey, { type: 'failsafe' });
  const passwordVault = genKeyVault(masterSecretKey, masterBoxKeyPair.secretKey, masterSignKeyPair.secretKey, directoryDocId, loginSecretKey, { type: 'password', salt: encodeBase64(passwordSalt) });
  const vaults: IKeyVault[] = [ failsafeVault, passwordVault ];

  const vaultsChallenges: IChallenge[] = [
    await buildSecretBasedChallenge(failsafeSecretKey),
    await buildSecretBasedChallenge(decodeUTF8(password)),
  ];

  // The idea is that these records can be viewed and edited by the owner only
  const vaultsDocId = await postRecord(
    url,
    {
      content: JSON.stringify({ vaults }),
      hash: '', // N/A
      readChallenges: vaultsChallenges,
      writeChallenges: vaultsChallenges,
    },
  );

  await postUser(
    url,
    {
      email,
      initialDocId: vaultsDocId,
    },
  );

  return {
    masterSecretKey,
    masterBoxKeyPair,
    masterSignKeyPair,
    directoryDocId,
    failsafeSecretKey,
  };
}

// Returns the master keys
export async function loginWithPassword(url: string, email: string, password: string) {

  const existingUser = await getUser(url, email);
  if (existingUser === undefined) {
    return false;
  }

  const challenges = (await getRecordChallenges(url, existingUser.initialDocId)).readChallenges.filter(
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

  const doc = await getRecord(url, existingUser.initialDocId, challengeSolutions);

  const vaults = z.object({
    vaults: z.array(KeyVault),
  }).parse(JSON.parse(doc.content)).vaults;
  const usingPasswordVault = vaults.find(vault => vault.metadata.type === 'password');

  if (usingPasswordVault === undefined || usingPasswordVault.metadata.type !== 'password') {
    return false;
  }

  const loginSecretKey = await passwordToSecretKey(password, decodeBase64(usingPasswordVault.metadata.salt));
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
    directoryDocId: decipheredVault.directoryId,
  };
}
