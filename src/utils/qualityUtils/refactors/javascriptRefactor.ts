
import { RefactoringOptions } from './index';

/**
 * Refactor JavaScript/TypeScript code to follow best practices
 */
export const refactorJavaScript = (code: string, options?: RefactoringOptions): string => {
  let refactored = code;
  
  // Replace var with const/let
  refactored = refactored.replace(/var\s+([a-zA-Z0-9_]+)\s*=\s*([^;]+);/g, (match, varName, value) => {
    // Use const by default unless there's evidence of reassignment
    const isReassigned = new RegExp(`${varName}\\s*=\\s*`, 'g').test(code);
    return isReassigned ? `let ${varName} = ${value};` : `const ${varName} = ${value};`;
  });
  
  // Convert function declarations to arrow functions for non-method functions
  refactored = refactored.replace(
    /function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s*{(?!\s*this)/g, 
    'const $1 = ($2) => {'
  );
  
  // Replace traditional for loops with array methods where possible
  refactored = refactored.replace(
    /for\s*\(\s*(?:let|var|const)?\s+([a-zA-Z0-9_]+)\s*=\s*0;\s*\1\s*<\s*([a-zA-Z0-9_]+)\.length;\s*\1\+\+\s*\)\s*{\s*([^}]*?)([a-zA-Z0-9_]+)\.push\(([^;]*)\);\s*}/g,
    '$2.map(item => $5)'
  );
  
  refactored = refactored.replace(
    /for\s*\(\s*(?:let|var|const)?\s+([a-zA-Z0-9_]+)\s*=\s*0;\s*\1\s*<\s*([a-zA-Z0-9_]+)\.length;\s*\1\+\+\s*\)\s*{(?!\s*return)([^}]*)}/g,
    '$2.forEach((item, index) => {$3})'
  );
  
  // Replace filter operations in loops
  refactored = refactored.replace(
    /const\s+([a-zA-Z0-9_]+)\s*=\s*\[\];\s*for\s*\(\s*(?:let|var|const)?\s+([a-zA-Z0-9_]+)\s*=\s*0;\s*\2\s*<\s*([a-zA-Z0-9_]+)\.length;\s*\2\+\+\s*\)\s*{\s*if\s*\(([^}]*?)\)\s*{\s*\1\.push\(([^;]*)\);\s*}\s*}/g,
    'const $1 = $3.filter((item, index) => $4).map((item) => $5)'
  );
  
  // Convert callbacks to async/await style when possible
  refactored = refactored.replace(
    /([a-zA-Z0-9_]+)\s*\.\s*then\s*\(\s*(?:function\s*\(([^)]*)\)|(?:\(([^)]*)\)\s*=>))\s*{([^}]*)}\s*\)\.catch\s*\(\s*(?:function\s*\((?:[^)]*)\)|(?:\(([^)]*)\)\s*=>))\s*{([^}]*)}\s*\)/g,
    'try {\n  const $2$3 = await $1;\n  $4\n} catch ($5error) {\n  $6\n}'
  );
  
  // Replace string concatenation with template literals
  refactored = refactored.replace(/(['"])([^'"]*?)\1\s*\+\s*([a-zA-Z0-9_\.]+)(?!\s*\+)/g, '`$2${$3}`');
  refactored = refactored.replace(/([a-zA-Z0-9_\.]+)\s*\+\s*(['"])([^'"]*?)\2(?!\s*\+)/g, '`${$1}$3`');
  refactored = refactored.replace(/(['"])([^'"]*?)\1\s*\+\s*([a-zA-Z0-9_\.]+)\s*\+\s*(['"])([^'"]*?)\4/g, '`$2${$3}$5`');
  
  // Replace traditional conditionals with ternary and nullish coalescing where appropriate
  refactored = refactored.replace(
    /if\s*\(([^)]+)\)\s*{\s*return\s+([^;]+);\s*}\s*else\s*{\s*return\s+([^;]+);\s*}/g,
    'return $1 ? $2 : $3;'
  );
  
  refactored = refactored.replace(
    /([a-zA-Z0-9_]+)\s*=\s*(?:([a-zA-Z0-9_]+)\s*!==\s*(?:null|undefined|''|""|false|0))?\s*\?\s*\2\s*:\s*([^;]+);/g,
    '$1 = $2 ?? $3;'
  );
  
  // Use object property shorthand
  refactored = refactored.replace(/{\s*([a-zA-Z0-9_]+)\s*:\s*([a-zA-Z0-9_]+)\s*(?:,)?/g, (match, key, value) => {
    if (key === value) {
      return `{ ${key}`;
    }
    return match;
  });
  
  // Convert to ES6 import/export syntax
  refactored = refactored.replace(/const\s+([a-zA-Z0-9_]+)\s*=\s*require\(['"]([^'"]+)['"]\);/g, 'import $1 from "$2";');
  refactored = refactored.replace(/module\.exports\s*=\s*([a-zA-Z0-9_]+);/g, 'export default $1;');
  refactored = refactored.replace(/exports\.([a-zA-Z0-9_]+)\s*=\s*([a-zA-Z0-9_]+);/g, 'export const $1 = $2;');
  
  // Replace anonymous functions with named functions for better stack traces
  refactored = refactored.replace(
    /const\s+([a-zA-Z0-9_]+)\s*=\s*function\s*\(/g,
    'const $1 = function $1('
  );
  
  // Add proper JSDoc comments to functions
  refactored = refactored.replace(
    /(?:export\s+)?(?:const|function)\s+([a-zA-Z0-9_]+)\s*(?:=\s*(?:\([^)]*\)|function[^(]*)\s*=>|\([^)]*\))\s*(?:=>)?\s*[{]/g,
    (match, funcName) => {
      if (!match.includes('/**')) {
        return `/**\n * ${funcName} function\n * @returns {any} Result\n */\n${match}`;
      }
      return match;
    }
  );
  
  // Use optional chaining for nested object access
  refactored = refactored.replace(
    /if\s*\(\s*([a-zA-Z0-9_]+)(?:\.[a-zA-Z0-9_]+)+\s*(?:!==\s*(?:undefined|null)\s*)?\)\s*{/g,
    (match, objName) => {
      if (match.includes('.') && objName) {
        const chain = match.match(/([a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)+)/);
        if (chain) {
          return match.replace(chain[0], chain[0].replace(/\./g, '?.'));
        }
      }
      return match;
    }
  );
  
  // Add semicolons where missing
  refactored = refactored.replace(/([a-zA-Z0-9_\)`}])\s*\n(?!\s*[)}\],;.])/g, '$1;\n');
  
  return refactored;
};
