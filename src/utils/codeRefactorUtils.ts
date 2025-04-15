
/**
 * Code Refactoring Utility Functions
 * 
 * This module provides functions to refactor code in various programming languages
 * to follow best practices and improve code quality.
 */

/**
 * Refactors JavaScript/TypeScript code to follow modern best practices
 * @param code - The original JavaScript/TypeScript code
 * @returns Refactored code with improved practices
 */
export const refactorJavaScript = (code: string): string => {
  let refactored = code;
  
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
  
  // Replace basic for loops with forEach for side effects
  refactored = refactored.replace(
    /for\s*\(\s*(?:var|let|const)\s+([a-zA-Z0-9_]+)\s*=\s*0;\s*\1\s*<\s*([a-zA-Z0-9_]+)\.length;\s*\1\+\+\s*\)\s*{\s*console\.log\(([^;]+)\);\s*}/g,
    '$2.forEach((item, index) => {\n  console.log($3);\n});'
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
  
  // Add descriptive variable names
  refactored = refactored.replace(/const\s+i\s*=/g, 'const index =');
  refactored = refactored.replace(/const\s+e\s*=/g, 'const error =');
  refactored = refactored.replace(/const\s+r\s*=/g, 'const result =');
  refactored = refactored.replace(/const\s+a\s*=/g, 'const array =');
  refactored = refactored.replace(/const\s+o\s*=/g, 'const object =');
  
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
  
  // Add proper JSDoc comments to functions
  refactored = refactored.replace(
    /const\s+([a-zA-Z0-9_]+)\s*=\s*\(([^)]*)\)\s*=>\s*{/g,
    '/**\n * $1 function\n * @param {$2} Parameters\n * @returns The processed result\n */\nconst $1 = ($2) => {'
  );

  // Add modern error handling with try/catch blocks where appropriate
  if (refactored.includes('fetch(') && !refactored.includes('try {')) {
    refactored = refactored.replace(
      /(const\s+([a-zA-Z0-9_]+)\s*=\s*\(([^)]*)\)\s*=>\s*{)([\s\S]*?)(return fetch\(([^)]+)\))([\s\S]*?)(})/g,
      '$1$4try {\n    const response = await $5;\n    return await response.json();\n  } catch (error) {\n    console.error("Error fetching data:", error);\n    throw error;\n  }$7$8'
    );
  }
  
  // Add strict mode directive if not present
  if (!refactored.includes('"use strict"') && !refactored.includes("'use strict'")) {
    refactored = '"use strict";\n\n' + refactored;
  }
  
  return refactored;
};

/**
 * Generates a meaningful constant name based on a numeric value
 */
function generateConstantName(value: string): string {
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
  
  // Replace mutable default arguments
  refactored = refactored.replace(
    /def\s+([a-zA-Z0-9_]+)\s*\(([^)]*?),\s*([a-zA-Z0-9_]+)=\[\]/g,
    'def $1($2, $3=None):\n    if $3 is None:\n        $3 = []'
  );
  
  // Add type hints using type annotations
  refactored = refactored.replace(
    /def\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\):/g,
    (match, funcName, params) => {
      if (!params.includes(':')) {
        const typedParams = params.split(',').map(param => {
          param = param.trim();
          if (!param) return param;
          
          if (param.includes('=')) {
            const [paramName, defaultValue] = param.split('=').map(p => p.trim());
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
  
  // Add type hints imports if needed
  if (refactored.includes(': List[') || refactored.includes(': Dict[') || 
      refactored.includes('Optional[') || refactored.includes(': Any')) {
    refactored = 'from typing import Any, Dict, List, Optional, Union\n\n' + refactored;
  }
  
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
  
  // Use pathlib instead of os.path
  if (refactored.includes('os.path.join') || refactored.includes('os.path.exists')) {
    refactored = refactored.replace('import os', 'from pathlib import Path');
    refactored = refactored.replace(/os\.path\.join\(([^,]+),\s*([^)]+)\)/g, 'Path($1) / $2');
    refactored = refactored.replace(/os\.path\.exists\(([^)]+)\)/g, 'Path($1).exists()');
  }
  
  return refactored;
};

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
  
  // Add proper error handling with try-catch blocks
  if (refactored.includes('throw') && !refactored.includes('try {')) {
    refactored = refactored.replace(
      /(void|int|bool|auto|std::[a-zA-Z0-9_:]+)\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s*{([\s\S]*?)(throw [^;]+;)([\s\S]*?)}/g,
      '$1 $2($3) {\n  try {$4$6  } catch (const std::exception& e) {\n    std::cerr << "Error in $2: " << e.what() << std::endl;\n    $5\n  }\n}'
    );
  }
  
  // Add header includes if using smart pointers or other C++ features
  if (refactored.includes('unique_ptr') && !refactored.includes('#include <memory>')) {
    refactored = '#include <memory>\n' + refactored;
  }
  
  if (refactored.includes('std::cerr') && !refactored.includes('#include <iostream>')) {
    refactored = '#include <iostream>\n' + refactored;
  }
  
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
  
  return refactored;
};

/**
 * Refactors Java code to follow modern best practices
 * @param code - The original Java code
 * @returns Refactored code with improved practices
 */
export const refactorJava = (code: string): string => {
  let refactored = code;
  
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
  
  // Use streams for collection operations
  refactored = refactored.replace(
    /([A-Za-z0-9_<>]+)\s+([a-zA-Z0-9_]+)\s*=\s*new\s+ArrayList<>\(\);\s*for\s*\(([A-Za-z0-9_<>]+)\s+([a-zA-Z0-9_]+)\s*:\s*([a-zA-Z0-9_]+)\)\s*{\s*if\s*\(([^}]+)\)\s*{\s*([a-zA-Z0-9_]+)\.add\(([^;]+)\);\s*}\s*}/g,
    '$1 $2 = $5.stream()\n    .filter($4 -> $6)\n    .map($4 -> $8)\n    .collect(Collectors.toList());'
  );
  
  // Use Optional for nullable return values
  refactored = refactored.replace(
    /public\s+([A-Za-z0-9_<>]+)\s+([a-zA-Z0-9_]+)\(([^)]*)\)\s*{([\s\S]*?)if\s*\(([^{]+)\)\s*{\s*return\s+null;\s*}([\s\S]*?)return\s+([^;]+);([\s\S]*?)}/g,
    'public Optional<$1> $2($3) {$4if ($5) {\n        return Optional.empty();\n    }$6return Optional.of($7);$8}'
  );
  
  // Add imports for modern Java features if used
  if (refactored.includes('.stream()') && !refactored.includes('import java.util.stream')) {
    refactored = 'import java.util.stream.*;\n' + refactored;
  }
  
  if (refactored.includes('Collectors.') && !refactored.includes('import java.util.stream.Collectors')) {
    refactored = 'import java.util.stream.Collectors;\n' + refactored;
  }
  
  if (refactored.includes('Optional.') && !refactored.includes('import java.util.Optional')) {
    refactored = 'import java.util.Optional;\n' + refactored;
  }
  
  // Add try-with-resources for AutoCloseable resources
  refactored = refactored.replace(
    /([A-Za-z0-9_<>]+)\s+([a-zA-Z0-9_]+)\s*=\s*new\s+([A-Za-z0-9_<>]+)\(([^)]*)\);\s*try\s*{([\s\S]*?)}\s*finally\s*{\s*([a-zA-Z0-9_]+)\.close\(\);\s*}/g,
    'try ($1 $2 = new $3($4)) {$5}'
  );
  
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
  
  return refactored;
};
