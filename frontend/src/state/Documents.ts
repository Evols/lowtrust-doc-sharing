
import { useState } from 'react';
import { createContainer } from 'unstated-next';
import { z } from 'zod';
import { createDocumentWithSecretKey, getDocumentWithSecretKey } from '../crypto/highLevel';
import { useAsyncEffect } from '../utils/hooks';
import { KeyStore } from './KeyStore';

const Document = z.object({
  name: z.string(),
  mimeType: z.string(),
  content: z.string(),
});
type IDocument = z.infer<typeof Document>;

function useDocuments() {

  const { masterSecretKey, directoryDocId, url, isLoggedIn } = KeyStore.useContainer();
  const [documents, setDocuments] = useState<IDocument[] | undefined>(undefined);

  useAsyncEffect(async () => {
    if (isLoggedIn) {
      const directoryDocString = await getDocumentWithSecretKey(url, directoryDocId!, masterSecretKey!);
      const docIds = z.array(z.string()).parse(JSON.parse(directoryDocString ?? 'null'));
      const docs = await Promise.all(docIds.map(async docId => {
        const docString = await getDocumentWithSecretKey(url, docId, masterSecretKey!);
        const doc = Document.parse(JSON.parse(docString ?? 'null'));  
        return doc;
      }));
      setDocuments(docs);
    }
  }, [isLoggedIn]);

  async function postDocument(doc: IDocument) {
    const docId = await createDocumentWithSecretKey(url, masterSecretKey!, JSON.stringify(doc));
    
    const directoryDocString = await getDocumentWithSecretKey(url, directoryDocId!, masterSecretKey!);
    const docIds = z.array(z.string()).parse(JSON.parse(directoryDocString ?? 'null'));

    // TODO: update directory
  }

  return {
    documents,
  };
}

export const Documents = createContainer(useDocuments);
