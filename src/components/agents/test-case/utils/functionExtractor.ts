export const extractFunctionNames = (code: string, language: string): string[] => {
  const patterns: Record<string, RegExp> = {
    'python': /def\s+([a-zA-Z0-9_]+)\s*\(/g,
    'ipynb': /def\s+([a-zA-Z0-9_]+)\s*\(/g,
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

  // Strip Jupyter cell formatting (if JSON-style code is passed)
  if (language === 'ipynb') {
    try {
      const parsed = JSON.parse(code);
      if (Array.isArray(parsed.cells)) {
        code = parsed.cells
          .filter(cell => cell.cell_type === 'code')
          .map(cell => cell.source.join(''))
          .join('\n');
      }
    } catch (e) {
      // Fall back if it's not valid JSON
    }
  }

  const pattern = patterns[language] || patterns['python'];
  const functionNames: string[] = [];
  let match;
  while ((match = pattern.exec(code)) !== null) {
    const name = match[1] || match[2] || 'main';
    if (name && !functionNames.includes(name)) {
      functionNames.push(name);
    }
  }

  if (functionNames.length === 0) {
    const fileClassName = fileName?.split('.')[0] || 'main';
    functionNames.push(fileClassName);
  }

  return functionNames;
};

// Dummy global variable to avoid TS error (to be handled in main component)
let fileName: string | null = null;
