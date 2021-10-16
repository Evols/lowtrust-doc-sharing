
import { randomBytes, secretbox, box } from 'tweetnacl';
import { decodeUTF8, encodeBase64 } from 'tweetnacl-util';
import { IChallenge } from 'ltds_common/dist/schemas';
import { postDocument, postUser } from '../utils/backend';
import { buildSecretBasedChallenge } from './challenges';
import { passwordToSymKey, genKeyVault, TKeyVault } from './vault';

// Returns the master sym key
export async function registerWithPassword(url: string, email: string, password: string): Promise<Uint8Array> {

  const masterSymKey = randomBytes(secretbox.keyLength);
  const masterAsymKeys = box.keyPair();
  const failsafeSymKey = randomBytes(secretbox.keyLength);
  const loginSymKey = await passwordToSymKey(password);

  const failsafeVault = genKeyVault(masterSymKey, masterAsymKeys.secretKey, failsafeSymKey, { type: 'failsafe' });
  const passwordVault = genKeyVault(masterSymKey, masterAsymKeys.secretKey, loginSymKey.derivedKey, { type: 'password', salt: encodeBase64(loginSymKey.salt) });
  const vaults: TKeyVault<any>[] = [ failsafeVault, passwordVault ];

  const writeChallenges: IChallenge[] = [
    await buildSecretBasedChallenge(failsafeSymKey),
    await buildSecretBasedChallenge(decodeUTF8(password)),
  ];

  // The idea is that these documents can be viewed by anyone, but edited by the owner only
  const docId = await postDocument(
    url,
    {
      cypher: JSON.stringify({ vaults }),
      hash: '', // N/A
      readChallenges: [],
      writeChallenges,
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
