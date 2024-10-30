import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
  solarizedlight,
  // tomorrow,
  // okaidia,
  // coy,
} from 'react-syntax-highlighter/dist/esm/styles/prism';

type Props = {
  snippet: string;
};

const CodeSnippet = ({ snippet }: Props) => {
  return (
    <SyntaxHighlighter language="javascript" style={solarizedlight}>
      {`${JSON.stringify(snippet, null, 2)}`}
    </SyntaxHighlighter>
  );
};

export default CodeSnippet;
