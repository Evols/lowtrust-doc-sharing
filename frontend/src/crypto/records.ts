
import { randomBytes, secretbox, hash } from 'tweetnacl';
import { IChallenge } from 'ltds_common/dist/schemas';
import { decodeBase64, encodeBase64, decodeUTF8, encodeUTF8 } from 'tweetnacl-util';
import { z } from 'zod';
import { getRecordChallenges, getRecord, postRecord, putRecord } from '../utils/backend';
import { buildSecretBasedSolution, buildSecretBasedChallenge } from './challenges';

export async function getRecordWithSecretKey(url: string, docId: string, masterSecretKey: Uint8Array): Promise<Uint8Array | undefined> {
  const challenges = (await getRecordChallenges(url, docId)).readChallenges.filter(
    challenge => JSON.parse(challenge.helper).type === 'secret'
  );
  const challengeSolutions = (await Promise.all(challenges.map(
    async (challenge) => {
      const solution = await buildSecretBasedSolution(masterSecretKey, challenge.helper);
      if (solution === undefined) {
        return [];
      } else {
        return [solution];
      }
    }
  ))).flat();

  const docRaw = await getRecord(url, docId, challengeSolutions);
  const docRawParsed = z.object({
    nonce: z.string(),
    box: z.string(),
  }).parse(JSON.parse(docRaw.content));

  const docBuffer = secretbox.open(decodeBase64(docRawParsed.box), decodeBase64(docRawParsed.nonce), masterSecretKey);
  if (docBuffer === null) {
    return undefined;
  }

  return docBuffer;
}

async function buildRecordWithSecretKey(masterSecretKey: Uint8Array, contentPlaintext: string) {
  
  const challenges: IChallenge[] = [
    await buildSecretBasedChallenge(masterSecretKey),
  ];

  const nonce = randomBytes(secretbox.nonceLength);
  const contentPlaintextBytes = decodeUTF8(contentPlaintext);
  return {
    content: JSON.stringify({
      nonce: encodeBase64(nonce),
      box: encodeBase64(secretbox(contentPlaintextBytes, nonce, masterSecretKey)),
    }),
    hash: encodeBase64(hash(contentPlaintextBytes)),
    readChallenges: challenges,
    writeChallenges: challenges,
  };
}

export async function createRecordWithSecretKey(url: string, masterSecretKey: Uint8Array, contentPlaintext: string) {
  const record = await buildRecordWithSecretKey(masterSecretKey, contentPlaintext);
  return await postRecord(url, record);
}

export async function updateRecordWithSecretKey(url: string, masterSecretKey: Uint8Array, id: string, contentPlaintext: string) {
  const challenges = await getRecordChallenges(url, id)
  const writeSecretChallenges = challenges.writeChallenges.filter(
    challenge => JSON.parse(challenge.helper).type === 'secret'
  );
  const challengeSolutions = (await Promise.all(writeSecretChallenges.map(
    async (challenge) => {
      const solution = await buildSecretBasedSolution(masterSecretKey, challenge.helper);
      if (solution === undefined) {
        return [];
      } else {
        return [solution];
      }
    }
  ))).flat();

  const newRecord = await buildRecordWithSecretKey(masterSecretKey, contentPlaintext);
  await putRecord(url, id, newRecord, challengeSolutions);
}
