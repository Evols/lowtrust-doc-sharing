
import { useState } from 'react';
import { createContainer } from 'unstated-next';
import { getDirectory, getDocument, IDocument, postDocument } from '../crypto/documents';
import { useAsyncEffect } from '../utils/hooks';
import { KeyStore } from './KeyStore';

function useDocuments() {

  const { masterSecretKey, directoryDocId, url, isLoggedIn } = KeyStore.useContainer();
  const [documents, setDocuments] = useState<(IDocument & { id: string })[] | undefined>(undefined);

  async function createDocument(document: IDocument) {
    if (documents === undefined || masterSecretKey === undefined || directoryDocId === undefined) {
      return false;
    }
    const id = await postDocument(url, masterSecretKey, directoryDocId, document);
    setDocuments([ ...documents, { ...document, id, }]);
  }

  useAsyncEffect(async () => {
    if (isLoggedIn) {
      const docIds = await getDirectory(url, directoryDocId!, masterSecretKey!);
      if (docIds !== undefined) {
        const docs = (await Promise.all(docIds.map(
          async docId => {
            const doc = await getDocument(url, docId, masterSecretKey!);
            return doc === undefined ? [] : [{ ...doc, id: docId }];
          }
        ))).flat();
        setDocuments(docs);
      }
    }
  }, [isLoggedIn]);

  return {
    documents,
    createDocument,
  };
}

export const Documents = createContainer(useDocuments);
