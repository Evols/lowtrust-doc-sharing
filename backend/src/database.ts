
import { randomUUID } from 'crypto';
import { readFile, writeFile } from 'fs/promises';
import { Record, IRecord, IUser, User } from 'ltds_common/dist/schemas';
import { z } from 'zod';

const DbData = z.object({
  records: z.array(Record),
  users: z.array(User),
});
type IDbData = z.infer<typeof DbData>;

const dbPath = './db.json';

const db = {
  data: {
    records: [],
    users: [],
  } as IDbData,
  read: async function() {
    this.data = DbData.parse(JSON.parse(await readFile(dbPath, 'utf-8')));
  },
  write: async function() {
    await writeFile(dbPath, JSON.stringify(DbData.parse(this.data), null, 2), { encoding: 'utf-8' });
  },
};

export async function getRecord(id: string): Promise<IRecord | undefined> {
  await db.read();
  return db.data.records.find(
    doc => doc.id === id
  );
}

export async function createRecord(doc: Omit<IRecord, 'id'>): Promise<string> {
  await db.read();
  const docWithId = {
    ...doc,
    id: randomUUID(),
  };
  db.data.records.push(docWithId);
  await db.write();
  return docWithId.id;
}

export async function updateRecord(doc: IRecord): Promise<void> {
  await db.read();
  const foundIdx = db.data.records.findIndex(
    dbDoc => dbDoc.id === doc.id
  );
  if (foundIdx !== -1 && foundIdx !== undefined) {
    db.data.records[foundIdx] = doc;
    await db.write();
  }
}

export async function getUser(email: string): Promise<IUser | undefined> {
  await db.read();
  return db.data.users.find(
    dbUser => dbUser.email === email
  );
}

export async function createUser(user: Omit<IUser, 'id'>): Promise<void> {
  await db.read();
  const userWithId = {
    ...user,
    id: randomUUID(),
  };
  db.data.users.push(userWithId);
  await db.write();
}
