
import lowdb from 'lowdb';
import { randomUUID } from 'crypto';
import { IDocument, IUser } from 'ltds_common/schemas';

interface IDbData {
  documents: IDocument[],
  users: IUser[],
}

const adapter = new lowdb.JSONFile<IDbData>('db.json');
const db = new lowdb.Low<IDbData>(adapter);

db.data ??= {
  documents: [],
  users: [],
};

export async function getDocument(id: string): Promise<IDocument | undefined> {
  await db.read();
  return db.data?.documents.find(
    doc => doc.id === id
  );
}

export async function createDocument(doc: Omit<IDocument, 'id'>): Promise<string> {
  await db.read();
  const docWithId = {
    ...doc,
    id: randomUUID(),
  };
  db.data!.documents.push(docWithId);
  await db.write();
  return docWithId.id;
}

export async function updateDocument(doc: IDocument): Promise<void> {
  await db.read();
  const foundIdx = db.data?.documents.findIndex(
    dbDoc => dbDoc.id === doc.id
  );
  if (foundIdx !== -1 && foundIdx !== undefined) {
    db.data!.documents[foundIdx] = doc;
    await db.write();
  }
}

export async function getUser(email: string): Promise<IUser | undefined> {
  await db.read();
  return db.data?.users.find(
    dbUser => dbUser.email === email
  );
}

export async function createUser(user: Omit<IUser, 'id'>): Promise<void> {
  await db.read();
  const userWithId = {
    ...user,
    id: randomUUID(),
  };
  db.data!.users.push(userWithId);
  await db.write();
}
