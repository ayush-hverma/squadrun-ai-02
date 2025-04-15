
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
