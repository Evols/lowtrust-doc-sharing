
import { randomBytes, secretbox } from 'tweetnacl';
import { IChallenge } from 'ltds_common/dist/schemas';
import { decodeBase64, encodeBase64, decodeUTF8 } from 'tweetnacl-util';
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
  }).parse(JSON.stringify(docRaw.content));

  const docBuffer = secretbox.open(decodeBase64(docRawParsed.box), decodeBase64(docRawParsed.nonce), masterSecretKey);
  if (docBuffer === null) {
    return undefined;
  }

  return docBuffer;
}

export async function createRecordWithSecretKey(url: string, masterSecretKey: Uint8Array, content: string) {

  const challenges: IChallenge[] = [
    await buildSecretBasedChallenge(masterSecretKey),
  ];

  const nonce = randomBytes(secretbox.nonceLength);

  const directoryDocId = await postRecord(
    url,
    {
      content: JSON.stringify({
        nonce: encodeBase64(nonce),
        box: encodeBase64(secretbox(decodeUTF8(content), nonce, masterSecretKey)),
      }),
      hash: '',
      readChallenges: challenges,
      writeChallenges: challenges,
    },
  );

  return directoryDocId;
}

export async function updateRecordWithSecretKey(url: string, masterSecretKey: Uint8Array, id: string, content: string, hash: string) {
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

  await putRecord(
    url,
    id,
    {
      content,
      hash,
      ...challenges,
    },
    challengeSolutions,
  );
}
