import { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import * as Diff from 'diff';

interface HighlightedCodeCompareProps {
  originalCode: string;
  refactoredCode: string;
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

export default function HighlightedCodeCompare({ originalCode, refactoredCode, language }: HighlightedCodeCompareProps) {
  const [highlightLanguage, setHighlightLanguage] = useState<string>('javascript');
  const [originalHighlightedLines, setOriginalHighlightedLines] = useState<number[]>([]);
  const [refactoredHighlightedLines, setRefactoredHighlightedLines] = useState<number[]>([]);
  
  // Process the code to find which lines were modified
  useEffect(() => {
    // Determine the language for syntax highlighting
    if (language) {
      const lang = languageMap[language.toLowerCase()] || 'javascript';
      setHighlightLanguage(lang);
    }

    // Calculate which lines were changed
    const originalLines = originalCode.split('\n');
    const refactoredLines = refactoredCode.split('\n');
    
    // Use Diff to find changes between the two files
    const diff = Diff.diffLines(originalCode, refactoredCode);
    
    const changedOriginalLines: number[] = [];
    const changedRefactoredLines: number[] = [];
    
    let originalLineNumber = 0;
    let refactoredLineNumber = 0;
    
    diff.forEach(part => {
      if (part.removed) {
        // This part was in the original but removed in the refactored
        part.value.split('\n').forEach((_, i) => {
          if (part.value.split('\n')[i] !== '') {
            changedOriginalLines.push(originalLineNumber + i);
          }
        });
        originalLineNumber += part.count || 0;
      } else if (part.added) {
        // This part was added in the refactored
        part.value.split('\n').forEach((_, i) => {
          if (part.value.split('\n')[i] !== '') {
            changedRefactoredLines.push(refactoredLineNumber + i);
          }
        });
        refactoredLineNumber += part.count || 0;
      } else {
        // This part is unchanged
        originalLineNumber += part.count || 0;
        refactoredLineNumber += part.count || 0;
      }
    });
    
    setOriginalHighlightedLines(changedOriginalLines);
    setRefactoredHighlightedLines(changedRefactoredLines);
  }, [originalCode, refactoredCode, language]);

  return (
    <div className="grid grid-cols-2 gap-4 h-full">
      <div className="h-full flex flex-col">
        <h4 className="text-squadrun-gray mb-2 text-sm font-medium">Original Code</h4>
        <div className="flex-1 overflow-hidden">
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
              lineProps={(lineNumber) => {
                const style = originalHighlightedLines.includes(lineNumber - 1) 
                  ? { backgroundColor: 'rgba(255, 70, 70, 0.2)', display: 'block', width: '100%' } 
                  : { display: 'block' };
                return { style };
              }}
            >
              {originalCode}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>
      
      <div className="h-full flex flex-col">
        <h4 className="text-squadrun-gray mb-2 text-sm font-medium">Refactored Code</h4>
        <div className="flex-1 overflow-hidden">
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
              lineProps={(lineNumber) => {
                const style = refactoredHighlightedLines.includes(lineNumber - 1)
                  ? { backgroundColor: 'rgba(70, 255, 70, 0.2)', display: 'block', width: '100%' }
                  : { display: 'block' };
                return { style };
              }}
            >
              {refactoredCode}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>
    </div>
  );
}
