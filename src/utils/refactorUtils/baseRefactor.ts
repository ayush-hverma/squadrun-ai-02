
/**
 * Base refactoring functions that work across multiple languages
 */

/**
 * Apply generic refactoring improvements that work for most programming languages
 * @param code - The original code
 * @returns Refactored code with basic improvements
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

/**
 * Generates a meaningful constant name based on a numeric value
 */
export function generateConstantName(value: string): string {
  const num = parseInt(value, 10);
  
  // Special case for common values
  if (num === 0) return 'ZERO';
  if (num === 1) return 'ONE';
  if (num === 60) return 'SECONDS_IN_MINUTE';
  if (num === 24) return 'HOURS_IN_DAY';
  if (num === 7) return 'DAYS_IN_WEEK';
  if (num === 100) return 'HUNDRED';
  if (num === 1000) return 'THOUSAND';
  if (num === 365) return 'DAYS_IN_YEAR';
  if (num === 12) return 'MONTHS_IN_YEAR';
  if (num === 30) return 'DAYS_IN_MONTH';
  
  // Default case
  return `CONSTANT_${value}`;
}
