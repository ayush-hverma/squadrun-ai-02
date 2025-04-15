
/**
 * Refactor Python code
 */
export const refactorPython = (code: string): string => {
  let refactored = code;
  
  // Replace old-style string formatting with f-strings
  refactored = refactored.replace(/"([^"]*)"%\s*\(([^)]*)\)/g, 'f"$1{$2}"');
  refactored = refactored.replace(/'([^']*)'\s*%\s*\(([^)]*)\)/g, "f'$1{$2}'");
  
  // Convert traditional for loops to list comprehensions
  refactored = refactored.replace(
    /([a-zA-Z0-9_]+)\s*=\s*\[\]\s*\n\s*for\s+([a-zA-Z0-9_]+)\s+in\s+([^:]+):\s*\n\s+([a-zA-Z0-9_]+)\.append\(([^)]+)\)/g, 
    '$1 = [$5 for $2 in $3]'
  );
  
  // Use enumerate instead of manual indexing
  refactored = refactored.replace(
    /for\s+i\s+in\s+range\(len\(([a-zA-Z0-9_]+)\)\):/g,
    'for i, item in enumerate($1):'
  );
  
  // Replace if x == True/False with if x/if not x
  refactored = refactored.replace(/if\s+([a-zA-Z0-9_]+)\s*==\s*True/g, 'if $1');
  refactored = refactored.replace(/if\s+([a-zA-Z0-9_]+)\s*==\s*False/g, 'if not $1');
  
  // Use context managers (with statements)
  refactored = refactored.replace(
    /([a-zA-Z0-9_]+)\s*=\s*open\(([^)]+)\)\s*\n([^]*?)([a-zA-Z0-9_]+)\.close\(\)/gs,
    'with open($2) as $1:\n$3'
  );
  
  // Add docstrings to functions
  refactored = refactored.replace(
    /def\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\):/g,
    'def $1($2):\n    """$1 function.\n    \n    Args:\n        $2\n    """\n'
  );
  
  return refactored;
};
