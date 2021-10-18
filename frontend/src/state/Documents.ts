
import { useState } from 'react';
import { createContainer } from 'unstated-next';
import { getDirectory, getDocument, IDocument } from '../crypto/documents';
import { useAsyncEffect } from '../utils/hooks';
import { KeyStore } from './KeyStore';

function useDocuments() {

  const { masterSecretKey, directoryDocId, url, isLoggedIn } = KeyStore.useContainer();
  const [documents, setDocuments] = useState<IDocument[] | undefined>(undefined);

  useAsyncEffect(async () => {
    if (isLoggedIn) {
      const docIds = await getDirectory(url, directoryDocId!, masterSecretKey!);
      if (docIds !== undefined) {
        const docs = (await Promise.all(docIds.map(
          async docId => {
            const doc = await getDocument(url, docId, masterSecretKey!);
            return doc === undefined ? [] : [doc];
          }
        ))).flat();
        setDocuments(docs);
      }
    }
  }, [isLoggedIn]);

  return {
    documents,
  };
}

export const Documents = createContainer(useDocuments);
