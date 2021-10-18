
import { decodeUTF8, encodeUTF8 } from 'tweetnacl-util';
import { z } from 'zod';
import { createRecordWithSecretKey, getRecordWithSecretKey } from './records';

// Directory

export async function createDirectory(url: string, masterSecretKey: Uint8Array, docIds: string[]) {
  return await createRecordWithSecretKey(url, masterSecretKey, JSON.stringify(docIds));
}

// Returns the ids of the documents
export async function getDirectory(url: string, id: string, masterSecretKey: Uint8Array) {
  const docContent = await getRecordWithSecretKey(url, id, masterSecretKey);
  if (docContent === undefined) {
    return undefined;
  }
  return z.array(z.string()).parse(JSON.parse(encodeUTF8(docContent)));
}


// Document

export const Document = z.object({
  name: z.string(),
  mimeType: z.string(),
  content: z.string(),
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

// export async function postDocument(doc: IDocument) {
//   const docCiphered = decodeUTF8(JSON.stringify(doc));
//   const docId = await createRecordWithSecretKey(url, masterSecretKey!, );

//   const oldDirectoryDocString = await getRecordWithSecretKey(url, directoryDocId!, masterSecretKey!);
//   const oldDirectoryDocIds = z.array(z.string()).parse(JSON.parse(oldDirectoryDocString ?? 'null'));
//   const newDirectoryDocIds = [ ...oldDirectoryDocIds, docId ];

//   // TODO: update directory
// }
