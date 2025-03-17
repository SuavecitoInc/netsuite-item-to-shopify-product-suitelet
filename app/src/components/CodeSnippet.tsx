import React from 'react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import js from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';

import {
  solarizedlight,
  // tomorrow,
  // okaidia,
  // coy,
} from 'react-syntax-highlighter/dist/esm/styles/prism';

SyntaxHighlighter.registerLanguage('javascript', js);

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
