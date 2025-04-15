
/**
 * Refactor code based on the programming language
 */
export const refactorCode = (code: string, language: string): string => {
  switch(language) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      return refactorJavaScript(code);
    case 'py':
      return refactorPython(code);
    case 'cpp':
    case 'c':
    case 'h':
      return refactorCPP(code);
    case 'java':
      return refactorJava(code);
    default:
      return refactorGeneric(code);
  }
};

/**
 * Refactor JavaScript/TypeScript code
 */
export const refactorJavaScript = (code: string): string => {
  let refactored = code;
  
  // Replace var with const/let
  refactored = refactored.replace(/var\s+([a-zA-Z0-9_]+)\s*=\s*([^;]+);/g, 'const $1 = $2;');
  
  // Convert function declarations to arrow functions where appropriate
  refactored = refactored.replace(/function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s*{/g, 'const $1 = ($2) => {');
  
  // Replace for loops with array methods where possible
  refactored = refactored.replace(
    /for\s*\(\s*let\s+([a-zA-Z0-9_]+)\s*=\s*0;\s*\1\s*<\s*([a-zA-Z0-9_]+)\.length;\s*\1\+\+\s*\)\s*{\s*([^}]*)\s*}/g,
    '$2.forEach((item, index) => {$3})'
  );
  
  // Convert callbacks to async/await style
  refactored = refactored.replace(
    /([a-zA-Z0-9_]+)\s*\.\s*then\s*\(\s*(?:function\s*\(([^)]*)\)|(?:\(([^)]*)\)\s*=>))\s*{([^}]*)}\s*\)/g, 
    'const $2 = await $1'
  );
  
  // Replace string concatenation with template literals
  refactored = refactored.replace(/(['"])([^'"]*)\1\s*\+\s*([a-zA-Z0-9_]+)/g, '`$2${$3}`');
  refactored = refactored.replace(/([a-zA-Z0-9_]+)\s*\+\s*(['"])([^'"]*)\2/g, '`${$1}$3`');
  
  // Remove unnecessary console.logs
  refactored = refactored.replace(/console\.log\([^)]*\);(\s*\n)/g, '$1');
  
  // Replace traditional conditionals with ternary where appropriate
  refactored = refactored.replace(
    /if\s*\(([^)]+)\)\s*{\s*return\s+([^;]+);\s*}\s*else\s*{\s*return\s+([^;]+);\s*}/g,
    'return $1 ? $2 : $3;'
  );
  
  // Use object shorthand notation
  refactored = refactored.replace(/{\s*([a-zA-Z0-9_]+)\s*:\s*([a-zA-Z0-9_]+)\s*}/g, (match, p1, p2) => {
    if (p1 === p2) {
      return `{ ${p1} }`;
    }
    return match;
  });
  
  // Add proper semicolons
  refactored = refactored.replace(/([^;\s{}])\s*\n\s*(?![)}\],;])/g, '$1;\n');
  
  // Convert to ES6 import/export syntax
  refactored = refactored.replace(/const\s+([a-zA-Z0-9_]+)\s*=\s*require\(['"]([^'"]+)['"]\);/g, 'import $1 from "$2";');
  refactored = refactored.replace(/module\.exports\s*=\s*([a-zA-Z0-9_]+);/g, 'export default $1;');
  
  // Add useful comments and docstrings
  refactored = refactored.replace(
    /function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/g, 
    '/**\n * $1 function\n * @param {$2} - Function parameters\n */\nfunction $1($2)'
  );
  
  return refactored;
};

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

/**
 * Refactor C/C++ code
 */
export const refactorCPP = (code: string): string => {
  let refactored = code;
  
  // Replace NULL with nullptr
  refactored = refactored.replace(/\bNULL\b/g, 'nullptr');
  
  // Use auto for variable declarations where type is obvious
  refactored = refactored.replace(/(std::)?([a-zA-Z0-9_:]+)<[^>]+>\s+([a-zA-Z0-9_]+)\s*=\s*/g, 'auto $3 = ');
  
  // Replace raw loops with range-based for loops
  refactored = refactored.replace(
    /for\s*\(\s*int\s+([a-zA-Z0-9_]+)\s*=\s*0\s*;\s*\1\s*<\s*([a-zA-Z0-9_]+)\.size\(\)\s*;\s*\1\+\+\s*\)/g, 
    'for (const auto& element : $2)'
  );
  
  // Convert raw pointers to smart pointers
  refactored = refactored.replace(
    /([a-zA-Z0-9_]+)\s*\*\s*([a-zA-Z0-9_]+)\s*=\s*new\s+([a-zA-Z0-9_]+)/g,
    'std::unique_ptr<$1> $2 = std::make_unique<$3>'
  );
  
  // Add comprehensive error handling
  refactored = refactored.replace(
    /try\s*{([^}]*)}(\s*)catch\s*\(([^)]*)\)\s*{([^}]*)}/g,
    'try {\n$1\n}$2catch (const $3& e) {\n    std::cerr << "Error: " << e.what() << std::endl;\n$4\n}'
  );
  
  return refactored;
};

/**
 * Refactor Java code
 */
export const refactorJava = (code: string): string => {
  let refactored = code;
  
  // Replace raw loops with enhanced for loops
  refactored = refactored.replace(
    /for\s*\(\s*int\s+([a-zA-Z0-9_]+)\s*=\s*0\s*;\s*\1\s*<\s*([a-zA-Z0-9_]+)\.size\(\)\s*;\s*\1\+\+\s*\)/g, 
    'for (var item : $2)'
  );
  
  // Use var instead of explicit types where possible
  refactored = refactored.replace(/([A-Z][a-zA-Z0-9_<>]+)\s+([a-zA-Z0-9_]+)\s*=\s*new\s+\1/g, 'var $2 = new $1');
  
  // Use streams for filtering and mapping
  refactored = refactored.replace(
    /List<([a-zA-Z0-9_]+)>\s+([a-zA-Z0-9_]+)\s*=\s*new\s+ArrayList<>\(\);[\s\n]*for\s*\(([a-zA-Z0-9_]+)\s+([a-zA-Z0-9_]+)\s*:\s*([a-zA-Z0-9_]+)\)\s*{\s*if\s*\(([^}]*)\)\s*{\s*([a-zA-Z0-9_]+)\.add\(([^;]*)\);\s*}\s*}/g,
    'List<$1> $2 = $5.stream()\n  .filter($4 -> $6)\n  .map($4 -> $8)\n  .collect(Collectors.toList());'
  );
  
  // Add robust javadoc
  refactored = refactored.replace(
    /public\s+([a-zA-Z0-9_<>]+)\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/g,
    '/**\n * $2 method\n *\n * @param $3\n * @return $1\n */\npublic $1 $2($3)'
  );
  
  return refactored;
};

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
