
import { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeDisplayProps {
  code: string;
  language: string;
}

// Map file extensions to SyntaxHighlighter language support
const languageMap: Record<string, string> = {
  'py': 'python',
  'js': 'javascript',
  'ts': 'typescript',
  'jsx': 'jsx',
  'tsx': 'tsx',
  'html': 'html',
  'css': 'css',
  'java': 'java',
  'cpp': 'cpp',
  'c': 'c',
  'cs': 'csharp',
  'go': 'go',
  'rb': 'ruby',
  'rs': 'rust',
  'php': 'php',
  'sh': 'bash',
  'sql': 'sql',
  'json': 'json',
  'md': 'markdown',
  'xml': 'xml',
  'yaml': 'yaml',
  'yml': 'yaml',
};

export default function CodeDisplay({ code, language }: CodeDisplayProps) {
  const [highlightLanguage, setHighlightLanguage] = useState<string>('javascript');

  useEffect(() => {
    // Determine the language for syntax highlighting
    if (language) {
      const lang = languageMap[language.toLowerCase()] || 'javascript';
      setHighlightLanguage(lang);
    }
  }, [language]);

  return (
    <div className="w-full h-full overflow-auto bg-[#1E1E1E] rounded-md">
      <SyntaxHighlighter
        language={highlightLanguage}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: '16px',
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
          lineHeight: '1.5rem',
          height: '100%',
          background: '#1E1E1E',
        }}
        showLineNumbers
        wrapLongLines
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
