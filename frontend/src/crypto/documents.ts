
import { decodeUTF8, encodeUTF8 } from 'tweetnacl-util';
import { z } from 'zod';
import { createRecordWithSecretKey, getRecordWithSecretKey, updateRecordWithSecretKey } from './records';

// Directory

export async function createDirectory(url: string, masterSecretKey: Uint8Array, docIds: string[]) {
  return await createRecordWithSecretKey(url, masterSecretKey, JSON.stringify(docIds));
}

// Returns the ids of the documents
export async function getDirectory(url: string, directoryDocId: string, masterSecretKey: Uint8Array) {
  const docContent = await getRecordWithSecretKey(url, directoryDocId, masterSecretKey);
  if (docContent === undefined) {
    return undefined;
  }
  return z.array(z.string()).parse(JSON.parse(encodeUTF8(docContent)));
}

export async function updateDirectory(url: string, masterSecretKey: Uint8Array, directoryDocId: string, docIds: string[]) {
  return await updateRecordWithSecretKey(url, masterSecretKey, directoryDocId, JSON.stringify(docIds));
}


// Document

export const Document = z.object({
  name: z.string(),
  mimeType: z.string(),
  content: z.string(), // TODO: binary instead
});
export type IDocument = z.infer<typeof Document>;

// Returns the ids of the documents
export async function getDocument(url: string, id: string, masterSecretKey: Uint8Array) {
  const docContent = await getRecordWithSecretKey(url, id, masterSecretKey);
  if (docContent === undefined) {
    return undefined;
  }
  return Document.parse(JSON.parse(encodeUTF8(docContent)));
}

export async function postDocument(url: string, masterSecretKey: Uint8Array, directoryDocId: string, doc: IDocument) {
  const docId = await createRecordWithSecretKey(url, masterSecretKey, JSON.stringify(doc));

  const oldDirectoryDocIds = await getDirectory(url, directoryDocId!, masterSecretKey!);
  const newDirectoryDocIds = [ ...oldDirectoryDocIds!, docId ];
  await updateDirectory(url, masterSecretKey, directoryDocId, newDirectoryDocIds);

  return docId;
}
