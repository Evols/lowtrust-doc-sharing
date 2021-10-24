
import React from 'react';
import { decodeBase64, decodeUTF8, encodeUTF8 } from 'tweetnacl-util';
import { IDocument } from '../crypto/documents';

export interface IProps {
  document: IDocument,
}

export function DocumentViewer({ document }: IProps) {
  switch (document.mimeType) {
    case 'text/plain': {
      return <pre>{encodeUTF8(decodeBase64(document.content))}</pre>
      break;
    }
  }
  return <></>;
}
