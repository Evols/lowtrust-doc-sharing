
import axios from 'axios';
import { Challenge, IChallenge, Record, IRecord, IUser, User } from 'ltds_common/dist/schemas';
import { z } from 'zod';

// Returns the id of the record
export async function postRecord(url: string, record: Omit<IRecord, 'id'>): Promise<string> {
  const res = await axios.post(
    `${url}/record`,
    record,
  );
  
  const resData = z.object({
    id: z.string(),
  }).parse(res.data);

  return resData.id;
}

export async function getRecord(url: string, id: string, challengeSolutions: string[]): Promise<IRecord> {
  // TODO: handle errors
  const res = await axios.get(
    `${url}/record/${id}`,
    {
      headers: {
        Authorization: `Challenges ${challengeSolutions.join(' ')}`,
      },
    },
  );
  const record = Record.parse(res.data);
  return record;
}

export async function getRecordChallenges(url: string, id: string): Promise<{ readChallenges: IChallenge[], writeChallenges: IChallenge[] }> {
  const res = await axios.get(`${url}/record/challenges/${id}`);
  return z.object({
    readChallenges: z.array(Challenge),
    writeChallenges: z.array(Challenge),
  }).parse(res.data);
}

export async function postUser(url: string, user: Omit<IUser, 'id'>): Promise<void> {
  await axios.post(
    `${url}/user`,
    user,
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
