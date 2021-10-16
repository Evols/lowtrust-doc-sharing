
import { randomBytes, secretbox, box } from 'tweetnacl';
import { decodeUTF8, encodeBase64 } from 'tweetnacl-util';
import { IChallenge } from 'ltds_common/dist/schemas';
import { getDocument, getDocumentChallenges, getUser, postDocument, postUser } from '../utils/backend';
import { buildSecretBasedChallenge, buildSecretBasedSolution } from './challenges';
import { passwordToSymKey, genKeyVault, TKeyVault } from './vault';

// Returns the master sym key
export async function registerWithPassword(url: string, email: string, password: string): Promise<Uint8Array | false> {

  const existingUser = await getUser(url, email);
  if (existingUser !== undefined) {
    return false;
  }

  const masterSymKey = randomBytes(secretbox.keyLength);
  const masterAsymKeyPair = box.keyPair();
  const failsafeSymKey = randomBytes(secretbox.keyLength);
  const passwordSalt = randomBytes(secretbox.keyLength);
  const loginSymKey = await passwordToSymKey(password, passwordSalt);

  const failsafeVault = genKeyVault(masterSymKey, masterAsymKeyPair.secretKey, failsafeSymKey, { type: 'failsafe' });
  const passwordVault = genKeyVault(masterSymKey, masterAsymKeyPair.secretKey, loginSymKey, { type: 'password', salt: encodeBase64(passwordSalt) });
  const vaults: TKeyVault<any>[] = [ failsafeVault, passwordVault ];

  const challenges: IChallenge[] = [
    await buildSecretBasedChallenge(failsafeSymKey),
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

  return masterSymKey;
}

// Returns the master sym key
export async function loginWithPassword(url: string, email: string, password: string): Promise<Uint8Array | false> {

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
  console.log('doc:', doc);

  return undefined as unknown as Uint8Array;

}
