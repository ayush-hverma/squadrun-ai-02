
/**
 * Language-specific refactoring functions
 */

import { generateConstantName } from './baseRefactor';

/**
 * Refactors JavaScript/TypeScript code to follow modern best practices
 * @param code - The original JavaScript/TypeScript code
 * @returns Refactored code with improved practices
 */
export const refactorJavaScript = (code: string): string => {
  let refactored = code;
  
  // Add strict mode directive if not present
  if (!refactored.includes('"use strict"') && !refactored.includes("'use strict'")) {
    refactored = '"use strict";\n\n' + refactored;
  }
  
  // Replace var with const/let
  refactored = refactored.replace(/var\s+([a-zA-Z0-9_]+)\s*=\s*([^;]+);/g, (match, varName, value) => {
    // Use let for variables that are reassigned later in the code
    if (code.includes(`${varName} =`) && !match.includes(`${varName} =`)) {
      return `let ${varName} = ${value};`;
    }
    return `const ${varName} = ${value};`;
  });
  
  // Convert traditional functions to arrow functions
  refactored = refactored.replace(
    /function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s*{([\s\S]*?)return\s+([^;]*);([\s\S]*?)}/g,
    'const $1 = ($2) => {$3return $4;$5}'
  );
  
  // Replace traditional anonymous functions with arrow functions
  refactored = refactored.replace(
    /function\s*\(([^)]*)\)\s*{([\s\S]*?)}/g,
    '($1) => {$2}'
  );
  
  // Replace string concatenation with template literals
  refactored = refactored.replace(
    /(["'])(.+?)\1\s*\+\s*([a-zA-Z0-9_]+)\s*\+\s*(["'])(.+?)\4/g,
    '`$2${$3}$5`'
  );
  refactored = refactored.replace(
    /([a-zA-Z0-9_]+)\s*\+\s*(["'])(.+?)\2/g,
    '`${$1}$3`'
  );
  refactored = refactored.replace(
    /(["'])(.+?)\1\s*\+\s*([a-zA-Z0-9_]+)/g,
    '`$2${$3}`'
  );
  
  // Replace basic for loops with array methods
  refactored = refactored.replace(
    /const\s+([a-zA-Z0-9_]+)\s*=\s*\[\];\s*for\s*\(\s*(?:var|let|const)\s+([a-zA-Z0-9_]+)\s*=\s*0;\s*\2\s*<\s*([a-zA-Z0-9_]+)\.length;\s*\2\+\+\s*\)\s*{\s*\1\.push\(([^;]+)\);\s*}/g,
    'const $1 = $3.map((item, index) => $4);'
  );
  
  // Replace push in loops with map
  refactored = refactored.replace(
    /for\s*\(\s*(?:var|let|const)\s+([a-zA-Z0-9_]+)\s*=\s*0;\s*\1\s*<\s*([a-zA-Z0-9_]+)\.length;\s*\1\+\+\s*\)\s*{\s*([a-zA-Z0-9_]+)\.push\(([^;]+)\);\s*}/g,
    'const $3 = $2.map((item, index) => $4);'
  );
  
  // Replace for loops with forEach for side effects
  refactored = refactored.replace(
    /for\s*\(\s*(?:var|let|const)\s+([a-zA-Z0-9_]+)\s*=\s*0;\s*\1\s*<\s*([a-zA-Z0-9_]+)\.length;\s*\1\+\+\s*\)\s*{\s*console\.log\(([^;]+)\);\s*}/g,
    '$2.forEach((item, index) => {\n  console.log($3);\n});'
  );
  
  // Replace console.log with more descriptive logging
  refactored = refactored.replace(
    /console\.log\(([^)]+)\);/g,
    'console.log(\'Debug info:\', $1);'
  );
  
  // Convert promise chains to async/await
  refactored = refactored.replace(
    /function\s+fetchData\(\)\s*{\s*return\s+fetch\(([^)]+)\)\s*\.then\(([^=>{]+)=>\s*{\s*return\s+([^;]+);\s*}\)\s*\.catch\(([^=>{]+)=>\s*{\s*([^}]+)\s*}\);\s*}/g,
    'async function fetchData() {\n  try {\n    const response = await fetch($1);\n    return $3;\n  } catch (error) {\n    $5\n  }\n}'
  );
  
  // Convert basic fetch promises to async/await
  refactored = refactored.replace(
    /fetch\(([^)]+)\)\.then\(([^=>{]+)=>\s*([^)]+)\)/g,
    'const response = await fetch($1);\n$3'
  );

  // Extract repeated values to constants
  const numberMatches = refactored.match(/\b(\d+)\b/g);
  if (numberMatches) {
    const counts: Record<string, number> = {};
    numberMatches.forEach(num => {
      counts[num] = (counts[num] || 0) + 1;
    });
    
    for (const [num, count] of Object.entries(counts)) {
      if (count > 2 && !refactored.includes(`const ${num}_`)) {
        const constName = generateConstantName(num);
        // Only replace literals, not array indices or parts of other expressions
        refactored = refactored.replace(new RegExp(`\\b${num}\\b(?!\\s*=|\\]|\\.|\\(|\\))`, 'g'), constName);
        // Add the constant declaration at the top
        refactored = `const ${constName} = ${num};\n\n${refactored}`;
      }
    }
  }
  
  // Replace main function with modern module pattern
  refactored = refactored.replace(
    /function\s+main\(\)\s*{([\s\S]*?)}\s*\n*\s*main\(\);/g,
    '// Entry point\n(async () => {$1})();'
  );

  // Apply additional improvements
  refactored = applyAdvancedJavaScriptRefactoring(refactored);
  
  return refactored;
};

/**
 * Apply advanced JavaScript refactoring techniques
 */
function applyAdvancedJavaScriptRefactoring(code: string): string {
  let refactored = code;
  
  // Convert objects to use shorthand syntax
  refactored = refactored.replace(
    /{\s*([a-zA-Z0-9_]+)\s*:\s*\1\s*}/g,
    '{ $1 }'
  );
  
  // Add null checks where appropriate
  refactored = refactored.replace(
    /const\s+([a-zA-Z0-9_]+)\s*=\s*([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+);/g,
    'const $1 = $2 && $2.$3;'
  );
  
  // Update null comparisons to use strict equality
  refactored = refactored.replace(/([a-zA-Z0-9_]+)\s*==\s*null/g, '$1 === null');
  refactored = refactored.replace(/([a-zA-Z0-9_]+)\s*!=\s*null/g, '$1 !== null');
  
  // Add proper JSDoc comments to functions
  refactored = refactored.replace(
    /const\s+([a-zA-Z0-9_]+)\s*=\s*\(([^)]*)\)\s*=>\s*{/g,
    '/**\n * $1 function\n * @param {$2} Parameters\n * @returns The processed result\n */\nconst $1 = ($2) => {'
  );

  // Use destructuring for objects and arrays
  refactored = refactored.replace(
    /const\s+([a-zA-Z0-9_]+)\s*=\s*([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+);\s*const\s+([a-zA-Z0-9_]+)\s*=\s*\2\.([a-zA-Z0-9_]+);/g,
    'const { $3: $1, $5: $4 } = $2;'
  );
  
  refactored = refactored.replace(
    /const\s+([a-zA-Z0-9_]+)\s*=\s*([a-zA-Z0-9_]+)\[0\];\s*const\s+([a-zA-Z0-9_]+)\s*=\s*\2\[1\];/g,
    'const [$1, $3] = $2;'
  );
  
  // Use optional chaining
  refactored = refactored.replace(
    /if\s*\(([a-zA-Z0-9_]+)\s*&&\s*\1\.([a-zA-Z0-9_]+)\)\s*{/g,
    'if ($1?.$2) {'
  );
  
  // Convert object.assign to spread syntax
  refactored = refactored.replace(
    /Object\.assign\({},\s*([^,}]+),\s*([^)]+)\)/g,
    '{ ...$1, ...$2 }'
  );
  
  return refactored;
}

/**
 * Refactors Python code to follow modern best practices
 * @param code - The original Python code
 * @returns Refactored code with improved practices
 */
export const refactorPython = (code: string): string => {
  let refactored = code;
  
  // Add module docstring if missing
  if (!refactored.match(/^(["']{3}|#)/)) {
    refactored = '"""\nModule for data processing and manipulation.\n\nThis module follows PEP 8 style guidelines and implements best practices for Python.\n"""\n\n' + refactored;
  }
  
  // Add common imports for better code
  if (!refactored.includes('from typing import')) {
    refactored = 'from typing import Any, Dict, List, Optional, Union, Callable, TypeVar\n\n' + refactored;
  }
  
  // Replace old-style string formatting with f-strings
  refactored = refactored.replace(
    /["']([^"']*?)["']\s*%\s*\(([^)]+)\)/g, 
    'f"$1".format($2)'
  );
  
  // Convert format() to f-strings
  refactored = refactored.replace(
    /["']([^"']*?)["']\.format\(([^)]+)\)/g, 
    'f"$1"'
  );
  
  // Convert string concatenation to f-strings
  refactored = refactored.replace(
    /["']([^"']*?)["']\s*\+\s*str\(([^)]+)\)\s*\+\s*["']([^"']*?)["']/g,
    'f"$1{$2}$3"'
  );
  
  // Convert traditional for loops to list comprehensions
  refactored = refactored.replace(
    /([a-zA-Z0-9_]+)\s*=\s*\[\]\s*\n\s*for\s+([a-zA-Z0-9_]+)\s+in\s+([^:]+):\s*\n\s+([a-zA-Z0-9_]+)\.append\(([^)]+)\)/g,
    '$1 = [$5 for $2 in $3]'
  );
  
  // Use with statement for file operations
  refactored = refactored.replace(
    /([a-zA-Z0-9_]+)\s*=\s*open\(([^)]+)\)\s*\n([^]*?)([a-zA-Z0-9_]+)\.close\(\)/g,
    'with open($2) as $1:\n$3'
  );
  
  // Convert range(len(list)) to enumerate
  refactored = refactored.replace(
    /for\s+([a-zA-Z0-9_]+)\s+in\s+range\(len\(([a-zA-Z0-9_]+)\)\):/g,
    'for $1, item in enumerate($2):'
  );
  
  // Add type hints and other Python-specific improvements
  refactored = applyAdvancedPythonRefactoring(refactored);
  
  return refactored;
};

/**
 * Apply advanced Python refactoring techniques
 */
function applyAdvancedPythonRefactoring(code: string): string {
  let refactored = code;
  
  // Add type hints using type annotations
  refactored = refactored.replace(
    /def\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\):/g,
    (match, funcName, params) => {
      if (!params.includes(':')) {
        const typedParams = params.split(',').map(param => {
          const trimmedParam = param.trim();
          if (!trimmedParam) return trimmedParam;
          
          // Extract the parameter name before any default value
          const paramName = trimmedParam.includes('=') 
            ? trimmedParam.split('=')[0].trim() 
            : trimmedParam;
          
          if (trimmedParam.includes('=')) {
            const defaultValue = trimmedParam.split('=')[1].trim();
            if (defaultValue === '[]') return `${paramName}: List[Any] = []`;
            if (defaultValue === '{}') return `${paramName}: Dict[str, Any] = {}`;
            if (defaultValue === 'None') return `${paramName}: Optional[Any] = None`;
            if (defaultValue === 'True' || defaultValue === 'False') return `${paramName}: bool = ${defaultValue}`;
            if (!isNaN(Number(defaultValue))) return `${paramName}: int = ${defaultValue}`;
            return `${paramName}: Any = ${defaultValue}`;
          }
          
          return `${paramName}: Any`;
        }).join(', ');
        
        return `def ${funcName}(${typedParams}) -> Any:`;
      }
      return match;
    }
  );
  
  // Add proper function docstrings
  refactored = refactored.replace(
    /def\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)(\s*->\s*[^:]+)?:/g,
    (match, funcName, params, returnType) => {
      // If function already has docstring, don't add another
      const nextLines = code.substring(code.indexOf(match) + match.length).trim();
      if (nextLines.startsWith('"""') || nextLines.startsWith("'''")) {
        return match;
      }
      
      const paramsList = params.split(',').map(p => p.trim()).filter(Boolean);
      const paramsDoc = paramsList.map(p => {
        let paramName = p;
        if (p.includes(':')) paramName = p.split(':')[0].trim();
        if (p.includes('=')) paramName = p.split('=')[0].trim();
        return `    Args:\n        ${paramName}: Parameter description`;
      }).join('\n');
      
      const returnTypeStr = returnType ? returnType.replace('-> ', '') : 'None';
      
      return `def ${funcName}(${params})${returnType || ''}:\n    """\n    ${funcName.charAt(0).toUpperCase() + funcName.slice(1)} function.\n    \n${paramsDoc}\n    \n    Returns:\n        ${returnTypeStr}: Return value description\n    """\n`;
    }
  );
  
  // Replace old-style exception handling
  refactored = refactored.replace(
    /except\s+([a-zA-Z0-9_]+),\s+([a-zA-Z0-9_]+):/g,
    'except $1 as $2:'
  );
  
  return refactored;
}

/**
 * Refactors C++ code to follow modern best practices
 * @param code - The original C++ code
 * @returns Refactored code with improved practices
 */
export const refactorCPP = (code: string): string => {
  let refactored = code;
  
  // Add pragma once to header files if missing
  if ((code.includes('.h') || code.includes('.hpp')) && 
      !code.includes('#pragma once') && !code.includes('#ifndef')) {
    refactored = '#pragma once\n\n' + refactored;
  }
  
  // Replace NULL with nullptr (C++11 and later)
  refactored = refactored.replace(/\bNULL\b/g, 'nullptr');
  
  // Use auto for variable declarations with complex types
  refactored = refactored.replace(
    /std::([a-zA-Z0-9_]+)<([^>]+)>\s+([a-zA-Z0-9_]+)\s*=\s*/g,
    'auto $3 = '
  );
  
  // Replace raw for loops with range-based for loops
  refactored = refactored.replace(
    /for\s*\(\s*(?:int|size_t)\s+([a-zA-Z0-9_]+)\s*=\s*0\s*;\s*\1\s*<\s*([a-zA-Z0-9_]+)\.size\(\)\s*;\s*\1\+\+\s*\)/g,
    'for (const auto& element : $2)'
  );
  
  // Convert raw pointers to smart pointers
  refactored = refactored.replace(
    /([a-zA-Z0-9_:]+)\s*\*\s*([a-zA-Z0-9_]+)\s*=\s*new\s+([a-zA-Z0-9_:]+)(\(.*\))?;/g,
    'std::unique_ptr<$1> $2 = std::make_unique<$3>$4;'
  );
  
  // Apply additional C++ specific improvements
  refactored = applyAdvancedCppRefactoring(refactored);
  
  return refactored;
};

/**
 * Apply advanced C++ refactoring techniques
 */
function applyAdvancedCppRefactoring(code: string): string {
  let refactored = code;
  
  // Add function documentation
  refactored = refactored.replace(
    /(void|int|bool|auto|std::[a-zA-Z0-9_:]+)\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/g,
    '/**\n * $2 function\n *\n * @param $3\n * @return $1\n */\n$1 $2($3)'
  );
  
  // Add structured bindings for pairs and tuples (C++17)
  refactored = refactored.replace(
    /auto\s+([a-zA-Z0-9_]+)\s*=\s*([a-zA-Z0-9_]+)\.first;\s*auto\s+([a-zA-Z0-9_]+)\s*=\s*\2\.second;/g,
    'auto [$1, $3] = $2;'
  );
  
  // Use emplace_back instead of push_back for better performance
  refactored = refactored.replace(
    /([a-zA-Z0-9_]+)\.push_back\(([^)]+)\)/g,
    '$1.emplace_back($2)'
  );
  
  return refactored;
}

/**
 * Refactors Java code to follow modern best practices
 * @param code - The original Java code
 * @returns Refactored code with improved practices
 */
export const refactorJava = (code: string): string => {
  let refactored = code;
  
  // Add package declaration if missing
  if (!refactored.includes('package ')) {
    refactored = 'package com.example;\n\n' + refactored;
  }
  
  // Update raw types to use generics
  refactored = refactored.replace(/\bArrayList(?!\s*<)/g, 'ArrayList<Object>');
  refactored = refactored.replace(/\bHashMap(?!\s*<)/g, 'HashMap<String, Object>');
  refactored = refactored.replace(/\bLinkedList(?!\s*<)/g, 'LinkedList<Object>');
  
  // Replace for loops with enhanced for loops where possible
  refactored = refactored.replace(
    /for\s*\(\s*int\s+([a-zA-Z0-9_]+)\s*=\s*0\s*;\s*\1\s*<\s*([a-zA-Z0-9_]+)\.(?:size|length)\(\)\s*;\s*\1\+\+\s*\)/g,
    'for (var item : $2)'
  );
  
  // Use Java 10+ 'var' for local variables with obvious types
  refactored = refactored.replace(
    /([A-Za-z][A-Za-z0-9_.<>]+)\s+([a-zA-Z0-9_]+)\s*=\s*new\s+\1/g,
    'var $2 = new $1'
  );
  
  // Apply additional Java-specific improvements
  refactored = applyAdvancedJavaRefactoring(refactored);
  
  return refactored;
};

/**
 * Apply advanced Java refactoring techniques
 */
function applyAdvancedJavaRefactoring(code: string): string {
  let refactored = code;
  
  // Add proper JavaDoc comments to methods
  refactored = refactored.replace(
    /public\s+([A-Za-z0-9_<>]+)\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/g,
    '/**\n * $2 method.\n *\n * @param $3\n * @return $1 description\n */\npublic $1 $2($3)'
  );
  
  // Add @Override annotations where appropriate
  refactored = refactored.replace(
    /public\s+(boolean|int|String)\s+(equals|hashCode|toString)\s*\(/g,
    '@Override\npublic $1 $2('
  );
  
  // Replace string concatenation with String.format
  refactored = refactored.replace(
    /("[^"]*")\s*\+\s*([a-zA-Z0-9_]+)\s*\+\s*("[^"]*")/g,
    'String.format($1 + "%s" + $3, $2)'
  );
  
  return refactored;
}
