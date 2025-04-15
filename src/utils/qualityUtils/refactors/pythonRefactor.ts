
/**
 * Refactor Python code to follow best practices
 */
export const refactorPython = (code: string): string => {
  let refactored = code;
  
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
