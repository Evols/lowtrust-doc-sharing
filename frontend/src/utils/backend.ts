
import axios from 'axios';
import { Challenge, Document, IChallenge, IDocument, IUser, User } from 'ltds_common/dist/schemas';
import { z } from 'zod';

// Returns the id of the document
export async function postDocument(url: string, doc: Omit<IDocument, 'id'>): Promise<string> {
  const res = await axios.post(
    `${url}/document`,
    doc,
  );
  
  const resData = z.object({
    id: z.string(),
  }).parse(res.data);

  return resData.id;
}

export async function getDocument(url: string, id: string, challengeSolutions: string[]): Promise<IDocument> {
  // TODO: handle errors
  const res = await axios.get(
    `${url}/document/${id}`,
    {
      headers: {
        Authorization: `Challenges ${challengeSolutions.join(' ')}`,
      },
    },
  );
  const doc = Document.parse(res.data);
  return doc;
}

export async function getDocumentChallenges(url: string, id: string): Promise<{ readChallenges: IChallenge[], writeChallenges: IChallenge[] }> {
  const res = await axios.get(`${url}/document/challenges/${id}`);
  return z.object({
    readChallenges: z.array(Challenge),
    writeChallenges: z.array(Challenge),
  }).parse(res.data);
}

export async function postUser(url: string, doc: Omit<IUser, 'id'>): Promise<void> {
  await axios.post(
    `${url}/user`,
    doc,
  );
}

export async function getUser(url: string, email: string): Promise<IUser | undefined> {

  const res = await axios.get(
    `${url}/user?email=${email}`,
    { validateStatus: status => status === 200 || status === 404 },
  );

  if (res.status === 404) {
    return undefined;
  }

  return User.parse(res.data);
}
