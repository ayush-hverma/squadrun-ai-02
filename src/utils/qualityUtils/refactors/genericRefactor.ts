
/**
 * Refactor generic code (for unsupported languages)
 */
export const refactorGeneric = (code: string): string => {
  let refactored = code;
  
  // Remove multiple blank lines
  refactored = refactored.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  // Add consistent spacing around operators
  refactored = refactored.replace(/([a-zA-Z0-9_])([\+\-\*\/=])/g, '$1 $2');
  refactored = refactored.replace(/([\+\-\*\/=])([a-zA-Z0-9_])/g, '$1 $2');
  
  // Add consistent indentation
  const lines = refactored.split('\n');
  let indentLevel = 0;
  refactored = lines.map(line => {
    // Decrease indent for closing brackets
    if (line.trim().startsWith('}') || line.trim().startsWith(')')) {
      indentLevel = Math.max(0, indentLevel - 1);
    }
    
    const indentedLine = ' '.repeat(indentLevel * 2) + line.trim();
    
    // Increase indent after opening brackets
    if (line.includes('{') || line.endsWith('(')) {
      indentLevel += 1;
    }
    
    return indentedLine;
  }).join('\n');
  
  return refactored;
};
