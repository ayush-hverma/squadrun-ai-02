
import { RefactoringOptions } from './index';

/**
 * Refactor Python code to follow best practices
 * with enhanced security and code smell detection
 */
export const refactorPython = (code: string, options?: RefactoringOptions): string => {
  // Check if this is a Jupyter Notebook file (JSON format)
  if (code.trim().startsWith('{') && code.includes('"cell_type"') && code.includes('"source"')) {
    return refactorJupyterNotebook(code, options);
  }
  
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

  // Security: Add sanitization for database queries
  refactored = refactored.replace(
    /cursor\.execute\s*\(\s*["'`]([^"'`]+)["'`]\s*(?:,\s*\(([^)]+)\))?\s*\)/g,
    'cursor.execute(sql_sanitize("$1"), ($2))'
  );

  // Security: Add HTML escaping for web output
  refactored = refactored.replace(
    /render_template\s*\(\s*["'`]([^"'`]+)["'`]\s*,([^)]+)\)/g,
    'render_template("$1", **html_escape_dict($2))'
  );

  // Security: Add CSRF protection
  if (refactored.includes('flask') && !refactored.includes('CSRFProtect')) {
    refactored = refactored.replace(
      /(from\s+flask\s+import\s+[^)]+)/g,
      '$1\nfrom flask_wtf.csrf import CSRFProtect\n\ncsrf = CSRFProtect()'
    );
    refactored = refactored.replace(
      /(app\s*=\s*Flask\s*\([^)]+\))/g,
      '$1\ncsrf.init_app(app)'
    );
  }
  
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

  // Code Smell: Improve variable naming
  refactored = refactored.replace(/\b([a-z])\b(?!\s*=)/g, (match, variable) => {
    if (variable === 'i' || variable === 'j' || variable === 'k') {
      return variable; // Common loop variables, leave as is
    }
    const betterNames: Record<string, string> = {
      'a': 'array_val',
      'b': 'boolean_val',
      'c': 'count',
      'd': 'data',
      'e': 'element',
      'f': 'file_obj',
      'l': 'list_val',
      'm': 'map_val',
      'n': 'number',
      'o': 'object',
      'p': 'param',
      'q': 'queue',
      'r': 'result',
      's': 'string',
      't': 'temp',
      'u': 'user',
      'v': 'value',
      'x': 'x_coord',
      'y': 'y_coord',
      'z': 'z_coord'
    };
    return betterNames[variable] || variable;
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
  
  // Maintainability: Replace old-style string formatting with f-strings
  refactored = refactored.replace(/(['"])([^'"]*?)%\s*(\([^)]+\))/g, 'f$1$2$3');
  refactored = refactored.replace(/(['"])([^'"]*?)%\s*([a-zA-Z0-9_]+)/g, 'f$1$2{$3}$1');
  
  // Maintainability: Convert string concatenation to f-strings
  refactored = refactored.replace(/(['"])([^'"]*)\1\s*\+\s*str\(([^)]+)\)(?:\s*\+\s*(['"])([^'"]*)\4)?/g, 'f$1$2{$3}$5$1');
  
  // Maintainability: Convert traditional for loops to list comprehensions or generators when suitable
  refactored = refactored.replace(
    /([a-zA-Z0-9_]+)\s*=\s*\[\]\s*\n\s*for\s+([a-zA-Z0-9_]+)\s+in\s+([^:]+):\s*\n\s+([a-zA-Z0-9_]+)\.append\(([^)]+)\)/g, 
    '$1 = [$5 for $2 in $3]'
  );
  
  // Performance: Use enumerate instead of manual indexing
  refactored = refactored.replace(
    /for\s+i\s+in\s+range\(len\(([a-zA-Z0-9_]+)\)\):/g,
    'for i, item in enumerate($1):'
  );
  
  // Code Smell: Replace if x == True/False with better syntax
  refactored = refactored.replace(/if\s+([a-zA-Z0-9_]+)\s*==\s*True/g, 'if $1');
  refactored = refactored.replace(/if\s+([a-zA-Z0-9_]+)\s*==\s*False/g, 'if not $1');
  
  // Security: Use context managers (with statements) for file operations
  refactored = refactored.replace(
    /([a-zA-Z0-9_]+)\s*=\s*open\(([^)]+)\)\s*\n([^]*?)([a-zA-Z0-9_]+)\.close\(\)/gs,
    'with open($2) as $1:\n$3'
  );
  
  // Performance: Replace traditional index loops with for-each loops when possible
  refactored = refactored.replace(
    /for\s+i\s+in\s+range\(len\(([a-zA-Z0-9_]+)\)\):\s*\n\s+([a-zA-Z0-9_]+)\s*=\s*\1\[i\]/g,
    'for $2 in $1:'
  );
  
  // Maintainability: Use list comprehensions for filtering
  refactored = refactored.replace(
    /([a-zA-Z0-9_]+)\s*=\s*\[\]\s*\n\s*for\s+([a-zA-Z0-9_]+)\s+in\s+([^:]+):\s*\n\s+if\s+([^:]+):\s*\n\s+([a-zA-Z0-9_]+)\.append\(([^)]+)\)/g,
    '$1 = [$6 for $2 in $3 if $4]'
  );
  
  // Maintainability: Use dictionary comprehensions
  refactored = refactored.replace(
    /([a-zA-Z0-9_]+)\s*=\s*{}\s*\n\s*for\s+([a-zA-Z0-9_]+)\s+in\s+([^:]+):\s*\n\s+([a-zA-Z0-9_]+)\[([^]]+)\]\s*=\s*([^#\n]+)/g,
    '$1 = {$5: $6 for $2 in $3}'
  );
  
  // Performance: Replace range(len()) with direct enumeration
  refactored = refactored.replace(
    /for\s+([a-zA-Z0-9_]+)\s+in\s+range\(len\(([a-zA-Z0-9_]+)\)\):/g,
    'for $1, item in enumerate($2):'
  );
  
  // Maintainability: Add type hints (for Python 3.6+)
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
  
  // Security: Add error handling where appropriate
  refactored = refactored.replace(
    /([a-zA-Z0-9_]+)\s*=\s*json\.loads\(([^)]+)\)/g,
    'try:\n    $1 = json.loads($2)\nexcept json.JSONDecodeError as e:\n    print(f"Error decoding JSON: {e}")\n    $1 = {}'
  );
  
  // Security: Add input validation function if not present
  if (refactored.includes('validate_input(') && !refactored.includes('def validate_input(')) {
    refactored = `def validate_input(input_data):\n    """Validate and sanitize user input.\n    \n    Args:\n        input_data: The input string to validate\n        \n    Returns:\n        Sanitized input string\n    """\n    if isinstance(input_data, str):\n        # Remove potential XSS/command injection characters\n        sanitized = input_data.replace('<', '').replace('>', '').replace(';', '')\n        # Limit input length for DoS protection\n        return sanitized[:1000]\n    return str(input_data)[:1000]\n\n${refactored}`;
  }
  
  // Security: Add SQL sanitization function if not present
  if (refactored.includes('sql_sanitize(') && !refactored.includes('def sql_sanitize(')) {
    refactored = `def sql_sanitize(sql_query):\n    """Sanitize SQL queries to prevent SQL injection.\n    \n    Args:\n        sql_query: The SQL query string\n        \n    Returns:\n        Sanitized SQL query\n    """\n    # Simple sanitization - in real code, use parameterized queries instead\n    return sql_query.replace("'", "''").replace(";", "")\n\n${refactored}`;
  }
  
  // Security: Add HTML escaping function if not present
  if (refactored.includes('html_escape_dict(') && !refactored.includes('def html_escape_dict(')) {
    refactored = `import html\n\ndef html_escape_dict(data_dict):\n    """Escape HTML characters in all string values of a dictionary.\n    \n    Args:\n        data_dict: Dictionary with values to escape\n        \n    Returns:\n        Dictionary with escaped values\n    """\n    result = {}\n    for key, value in data_dict.items():\n        if isinstance(value, str):\n            result[key] = html.escape(value)\n        else:\n            result[key] = value\n    return result\n\n${refactored}`;
  }
  
  // Security: Add missing import for ast module if literal_eval is used
  if (refactored.includes('ast.literal_eval') && !refactored.includes('import ast')) {
    refactored = `import ast\n${refactored}`;
  }

  // Maintainability: Add missing typing import if type hints are used
  if ((refactored.includes(': str') || refactored.includes(': int') || 
       refactored.includes(': list') || refactored.includes(': dict') || 
       refactored.includes('-> ')) && !refactored.includes('from typing import')) {
    refactored = `from typing import Any, Dict, List, Optional, Union, Tuple\n${refactored}`;
  }
  
  return refactored;
};

/**
 * Refactor Python code in Jupyter Notebook (.ipynb) files
 * 
 * @param code The JSON content of the notebook file
 * @param options Refactoring options
 * @returns The refactored notebook as a JSON string
 */
const refactorJupyterNotebook = (code: string, options?: RefactoringOptions): string => {
  try {
    // Parse the notebook JSON
    const notebook = JSON.parse(code);
    
    // Check if this is a valid notebook structure
    if (!Array.isArray(notebook.cells)) {
      return code; // Not a valid notebook, return as is
    }
    
    // Process only code cells
    notebook.cells = notebook.cells.map((cell: any) => {
      if (cell.cell_type === 'code') {
        // Join the source lines to form a complete code block
        const cellCode = Array.isArray(cell.source) ? cell.source.join('') : cell.source;
        
        // Apply Python refactoring to the code
        const refactoredCode = refactorPythonCellContent(cellCode, options);
        
        // Split the refactored code back into lines
        cell.source = refactoredCode.split('\n').map((line: string, i: number, arr: string[]) => 
          i < arr.length - 1 ? line + '\n' : line
        );
      }
      return cell;
    });
    
    // Convert back to JSON string with proper formatting
    return JSON.stringify(notebook, null, 2);
  } catch (error) {
    console.error('Error refactoring Jupyter notebook:', error);
    return code; // Return original on error
  }
};

/**
 * Refactor Python code in a Jupyter cell
 * This is a specialized version that handles Jupyter-specific patterns
 */
const refactorPythonCellContent = (code: string, options?: RefactoringOptions): string => {
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
  
  // Jupyter Notebook specific: Handle magic commands properly
  // Don't refactor IPython magic commands (starting with %)
  const lines = refactored.split('\n');
  const refactoredLines = lines.map(line => {
    if (line.trim().startsWith('%') || line.trim().startsWith('!')) {
      return line; // Don't refactor magic commands or shell commands
    }
    
    // Apply refactoring to normal Python code
    let refactoredLine = line;
    
    // Code Smell: Replace magic numbers with named constants
    refactoredLine = refactoredLine.replace(/\b(\d{3,})\b/g, match => {
      // Skip common numbers in Jupyter contexts like matplotlib figure sizes
      if (match === '100' || match === '1000' || 
          line.includes('figsize') || line.includes('dpi=')) {
        return match;
      }
      return `CONSTANT_${match}`;
    });
    
    // Maintainability: Replace old-style string formatting with f-strings
    if (!refactoredLine.trim().startsWith('%')) {
      refactoredLine = refactoredLine.replace(/(['"])([^'"]*?)%\s*(\([^)]+\))/g, 'f$1$2$3');
      refactoredLine = refactoredLine.replace(/(['"])([^'"]*?)%\s*([a-zA-Z0-9_]+)/g, 'f$1$2{$3}$1');
    }
    
    // Don't add docstrings inside cells - too verbose for notebooks
    
    return refactoredLine;
  });
  
  refactored = refactoredLines.join('\n');
  
  // Add helper functions at the top of the notebook if they're needed
  const helperFunctions = [];
  
  if (refactored.includes('validate_input(') && !refactored.includes('def validate_input(')) {
    helperFunctions.push(`def validate_input(input_data):
    """Validate and sanitize user input."""
    if isinstance(input_data, str):
        # Remove potential XSS/command injection characters
        sanitized = input_data.replace('<', '').replace('>', '').replace(';', '')
        # Limit input length for DoS protection
        return sanitized[:1000]
    return str(input_data)[:1000]`);
  }
  
  if (refactored.includes('ast.literal_eval') && !refactored.includes('import ast')) {
    helperFunctions.push('import ast  # For safe evaluation of expressions');
  }
  
  if (helperFunctions.length > 0) {
    refactored = `# Helper functions for security and maintainability
${helperFunctions.join('\n\n')}

${refactored}`;
  }
  
  // Define missing constants if referenced
  const constantMatches = refactored.match(/CONSTANT_\d+/g) || [];
  const constants = new Set(constantMatches);
  
  if (constants.size > 0) {
    const constantDefinitions = Array.from(constants).map(constant => {
      const value = constant.replace('CONSTANT_', '');
      return `${constant} = ${value}`;
    }).join('\n');
    
    refactored = `# Constants extracted for better maintainability
${constantDefinitions}

${refactored}`;
  }
  
  return refactored;
};

// Add necessary utility functions
const validate_input = (input: string): string => {
  if (input.length > 1000) {
    throw new Error('Input too long');
  }
  return input.replace(/[<>]/g, '').trim();
};
