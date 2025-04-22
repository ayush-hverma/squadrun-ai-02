
import { FunctionTest, TestCase } from '@/types/testTypes';

const languagePatterns: Record<string, RegExp> = {
  'python': /def\s+([a-zA-Z0-9_]+)\s*\(/g,
  'javascript': /function\s+([a-zA-Z0-9_]+)\s*\(|const\s+([a-zA-Z0-9_]+)\s*=\s*(\([^)]*\)|)\s*=>/g,
  'typescript': /function\s+([a-zA-Z0-9_]+)\s*\(|const\s+([a-zA-Z0-9_]+)\s*=\s*(\([^)]*\)|)\s*=>/g,
  'java': /(?:public|private|protected|static|\s) +[\w\<\>\[\]]+\s+([a-zA-Z0-9_]+)\s*\(/g,
  'cpp': /[\w\<\>\[\]]+\s+([a-zA-Z0-9_]+)\s*\(/g,
  'c': /[\w\<\>\[\]]+\s+([a-zA-Z0-9_]+)\s*\(/g,
  'csharp': /(?:public|private|protected|static|\s) +[\w\<\>\[\]]+\s+([a-zA-Z0-9_]+)\s*\(/g,
  'go': /func\s+([a-zA-Z0-9_]+)\s*\(/g,
  'ruby': /def\s+([a-zA-Z0-9_]+)\s*(\(|$)/g,
  'rust': /fn\s+([a-zA-Z0-9_]+)\s*\(/g,
  'php': /function\s+([a-zA-Z0-9_]+)\s*\(/g
};

export const extractFunctionNames = (code: string, language: string): string[] => {
  const pattern = languagePatterns[language] || languagePatterns['python'];
  const functionNames = [];
  let match;
  
  while ((match = pattern.exec(code)) !== null) {
    const name = match[1] || match[2] || 'main';
    if (name && !functionNames.includes(name)) {
      functionNames.push(name);
    }
  }
  
  if (functionNames.length === 0) {
    const fileClassName = 'main';
    functionNames.push(fileClassName);
  }
  
  return functionNames;
};

export const getFileLanguage = (fileName: string | null): string => {
  if (!fileName) return 'python';
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  const extensionMap: Record<string, string> = {
    'py': 'python',
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
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
    'html': 'html',
    'css': 'css'
  };
  return extensionMap[extension] || 'python';
};

