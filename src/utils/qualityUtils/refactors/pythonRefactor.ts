import { RefactoringOptions } from './index';

/**
 * Refactor Python code to follow best practices
 * with enhanced security and code smell detection
 */
export const refactorPython = (code: string, options?: RefactoringOptions): string => {
  let refactored = code;
  
  // Security: Replace unsafe eval usage
  refactored = refactored.replace(
    /eval\s*\((.*?)\)/g,
    'ast.literal_eval($1)  # Safer alternative to eval'
  );
  
  // Security: Add input validation
  refactored = refactored.replace(
    /input\s*\((.*?)\)/g,
    'validate_input(input($1))'
  );
  
  // Security: Replace shell=True in subprocess calls
  refactored = refactored.replace(
    /subprocess\.(?:call|run|Popen)\s*\((.*?),\s*shell\s*=\s*True/g,
    'subprocess.run($1, shell=False'
  );
  
  // Code Smell: Replace magic numbers with named constants
  const magicNumbers = new Set<string>();
  refactored = refactored.replace(/\b(\d{3,})\b/g, (match, number) => {
    if (!magicNumbers.has(number)) {
      magicNumbers.add(number);
      const constantName = `CONSTANT_${number}`;
      refactored = `${constantName} = ${number}\n${refactored}`;
      return constantName;
    }
    return match;
  });
  
  // Code Smell: Add type hints
  refactored = refactored.replace(
    /def\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\):/g,
    (match, funcName, params) => {
      const paramsList = params.split(',').map(p => p.trim());
      const typedParams = paramsList.map(param => 
        param ? `${param}: Any` : ''
      ).join(', ');
      return `def ${funcName}(${typedParams}) -> Any:`;
    }
  );
  
  // Code Smell: Break down large functions
  refactored = refactored.replace(
    /def\s+([a-zA-Z0-9_]+)\s*\([^)]*\):[^def]*?(?=def|\Z)/g,
    (match, funcName) => {
      if (match.split('\n').length > 20) {
        const parts = match.split('\n').reduce((acc, line, i) => {
          const partIndex = Math.floor(i / 20);
          if (!acc[partIndex]) acc[partIndex] = [];
          acc[partIndex].push(line);
          return acc;
        }, [] as string[][]);
        
        const helperFunctions = parts.map((part, i) => 
          `def ${funcName}_part${i + 1}():\n    ${part.join('\n    ')}`
        ).join('\n\n');
        
        return `${helperFunctions}\n\ndef ${funcName}():\n    ${
          parts.map((_, i) => `${funcName}_part${i + 1}()`).join('\n    ')
        }`;
      }
      return match;
    }
  );

  // Add docstrings to functions and classes
  refactored = refactored.replace(
    /def\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\):/g,
    (match, funcName, params) => {
      if (!match.includes('"""')) {
        const formattedParams = params.split(',')
          .filter(p => p.trim())
          .map(p => `        ${p.trim().split('=')[0].trim()}: Parameter description`)
          .join('\n');
        
        const docstring = `def ${funcName}(${params}):\n    """${funcName} function.\n    \n    Args:\n${formattedParams}\n    \n    Returns:\n        Result description\n    """\n`;
        return docstring;
      }
      return match;
    }
  );
  
  refactored = refactored.replace(
    /class\s+([a-zA-Z0-9_]+)(?:\s*\(([^)]*)\))?:/g,
    (match, className, parent) => {
      if (!match.includes('"""')) {
        const parentInfo = parent ? ` inheriting from ${parent}` : '';
        const docstring = `class ${className}${parent ? '('+parent+')' : ''}:\n    """${className} class${parentInfo}.\n    """\n`;
        return docstring;
      }
      return match;
    }
  );
  
  // Replace old-style string formatting with f-strings
  refactored = refactored.replace(/(['"])([^'"]*?)%\s*(\([^)]+\))/g, 'f$1$2$3');
  refactored = refactored.replace(/(['"])([^'"]*?)%\s*([a-zA-Z0-9_]+)/g, 'f$1$2{$3}$1');
  
  // Convert string concatenation to f-strings
  refactored = refactored.replace(/(['"])([^'"]*)\1\s*\+\s*str\(([^)]+)\)(?:\s*\+\s*(['"])([^'"]*)\4)?/g, 'f$1$2{$3}$5$1');
  
  // Convert traditional for loops to list comprehensions or generators when suitable
  refactored = refactored.replace(
    /([a-zA-Z0-9_]+)\s*=\s*\[\]\s*\n\s*for\s+([a-zA-Z0-9_]+)\s+in\s+([^:]+):\s*\n\s+([a-zA-Z0-9_]+)\.append\(([^)]+)\)/g, 
    '$1 = [$5 for $2 in $3]'
  );
  
  // Use enumerate instead of manual indexing
  refactored = refactored.replace(
    /for\s+i\s+in\s+range\(len\(([a-zA-Z0-9_]+)\)\):/g,
    'for i, item in enumerate($1):'
  );
  
  // Replace if x == True/False with better syntax
  refactored = refactored.replace(/if\s+([a-zA-Z0-9_]+)\s*==\s*True/g, 'if $1');
  refactored = refactored.replace(/if\s+([a-zA-Z0-9_]+)\s*==\s*False/g, 'if not $1');
  
  // Use context managers (with statements) for file operations
  refactored = refactored.replace(
    /([a-zA-Z0-9_]+)\s*=\s*open\(([^)]+)\)\s*\n([^]*?)([a-zA-Z0-9_]+)\.close\(\)/gs,
    'with open($2) as $1:\n$3'
  );
  
  // Replace traditional index loops with for-each loops when possible
  refactored = refactored.replace(
    /for\s+i\s+in\s+range\(len\(([a-zA-Z0-9_]+)\)\):\s*\n\s+([a-zA-Z0-9_]+)\s*=\s*\1\[i\]/g,
    'for $2 in $1:'
  );
  
  // Use list comprehensions for filtering
  refactored = refactored.replace(
    /([a-zA-Z0-9_]+)\s*=\s*\[\]\s*\n\s*for\s+([a-zA-Z0-9_]+)\s+in\s+([^:]+):\s*\n\s+if\s+([^:]+):\s*\n\s+([a-zA-Z0-9_]+)\.append\(([^)]+)\)/g,
    '$1 = [$6 for $2 in $3 if $4]'
  );
  
  // Use dictionary comprehensions
  refactored = refactored.replace(
    /([a-zA-Z0-9_]+)\s*=\s*{}\s*\n\s*for\s+([a-zA-Z0-9_]+)\s+in\s+([^:]+):\s*\n\s+([a-zA-Z0-9_]+)\[([^]]+)\]\s*=\s*([^#\n]+)/g,
    '$1 = {$5: $6 for $2 in $3}'
  );
  
  // Replace range(len()) with direct enumeration
  refactored = refactored.replace(
    /for\s+([a-zA-Z0-9_]+)\s+in\s+range\(len\(([a-zA-Z0-9_]+)\)\):/g,
    'for $1, item in enumerate($2):'
  );
  
  // Add type hints (for Python 3.6+)
  refactored = refactored.replace(
    /def\s+([a-zA-Z0-9_]+)\s*\(([^:)]*)\):/g,
    (match, funcName, params) => {
      if (!params.includes(':')) {
        // Only add type hints if they don't exist
        const typedParams = params.split(',')
          .filter(p => p.trim())
          .map(p => {
            const paramName = p.trim().split('=')[0].trim();
            if (paramName.toLowerCase().includes('str') || paramName.endsWith('name') || paramName.endsWith('text')) {
              return `${paramName}: str`;
            } else if (paramName.toLowerCase().includes('num') || paramName.endsWith('count') || paramName.endsWith('id')) {
              return `${paramName}: int`;
            } else if (paramName.toLowerCase().includes('list') || paramName.endsWith('s')) {
              return `${paramName}: list`;
            } else if (paramName.toLowerCase().includes('dict')) {
              return `${paramName}: dict`;
            } else if (paramName.toLowerCase().includes('bool') || paramName.startsWith('is_') || paramName.startsWith('has_')) {
              return `${paramName}: bool`;
            }
            return `${paramName}: any`;
          })
          .join(', ');
        
        return `def ${funcName}(${typedParams}) -> any:`;
      }
      return match;
    }
  );
  
  // Add error handling where appropriate
  refactored = refactored.replace(
    /([a-zA-Z0-9_]+)\s*=\s*json\.loads\(([^)]+)\)/g,
    'try:\n    $1 = json.loads($2)\nexcept json.JSONDecodeError as e:\n    print(f"Error decoding JSON: {e}")\n    $1 = {}'
  );
  
  return refactored;
};

// Add necessary utility functions
const validate_input = (input: string): string => {
  if (input.length > 1000) {
    throw new Error('Input too long');
  }
  return input.replace(/[<>]/g, '').trim();
};
