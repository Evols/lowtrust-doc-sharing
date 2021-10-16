
import axios from 'axios';
import { IDocument, IUser } from 'ltds_common/dist/schemas';
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

export async function postUser(url: string, doc: Omit<IUser, 'id'>): Promise<void> {
  await axios.post(
    `${url}/user`,
    doc,
  );
}
