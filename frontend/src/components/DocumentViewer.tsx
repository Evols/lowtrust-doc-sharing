
import React from 'react';
import { decodeBase64, encodeUTF8 } from 'tweetnacl-util';
import { IDocument } from '../crypto/documents';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeReact from 'rehype-react';
import rehypeHighlight from 'rehype-highlight';
import './DocumentViewer.css';

export interface IProps {
  document: IDocument,
}

const processor = unified()
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypeHighlight)
  .use(rehypeReact, { createElement: React.createElement });

export function DocumentViewer({ document }: IProps) {
  switch (document.mimeType) {
    case 'text/plain': {
      return <pre>{encodeUTF8(decodeBase64(document.content))}</pre>
    }
    case 'text/markdown': {
      const text = encodeUTF8(decodeBase64(document.content));
      return <div className="markdown-rendered">{processor.processSync(text).result}</div>;
    }
  }
  return <></>;
}
