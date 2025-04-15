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
  
  // Add strict mode directive
  if (!refactored.includes('"use strict"') && !refactored.includes("'use strict'")) {
    refactored = '"use strict";\n\n' + refactored;
  }
  
  // Replace var with const/let (prefer const for immutable variables)
  refactored = refactored.replace(/var\s+([a-zA-Z0-9_]+)\s*=\s*([^;]+);/g, 'const $1 = $2;');
  
  // Convert traditional functions to arrow functions where appropriate (not methods or constructors)
  refactored = refactored.replace(
    /function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s*{(?!\s*this)/g, 
    'const $1 = ($2) => {'
  );
  
  // Replace traditional callback functions with arrow functions
  refactored = refactored.replace(
    /function\s*\(([^)]*)\)\s*{([^}]*)}/g,
    '($1) => {$2}'
  );
  
  // Replace for loops with array methods (forEach, map, filter, reduce)
  // forEach for side effects
  refactored = refactored.replace(
    /for\s*\(\s*let\s+([a-zA-Z0-9_]+)\s*=\s*0;\s*\1\s*<\s*([a-zA-Z0-9_]+)\.length;\s*\1\+\+\s*\)\s*{\s*([^}]*?console\.log|[^}]*?=\s*[^}]*)\s*}/g,
    '$2.forEach((item, index) => {$3});'
  );
  
  // map for transformations
  refactored = refactored.replace(
    /const\s+([a-zA-Z0-9_]+)\s*=\s*\[\];\s*for\s*\(\s*let\s+([a-zA-Z0-9_]+)\s*=\s*0;\s*\2\s*<\s*([a-zA-Z0-9_]+)\.length;\s*\2\+\+\s*\)\s*{\s*([a-zA-Z0-9_]+)\.push\(([^;]+)\);\s*}/g,
    'const $1 = $3.map((item, index) => $5);'
  );
  
  // filter for conditionals
  refactored = refactored.replace(
    /const\s+([a-zA-Z0-9_]+)\s*=\s*\[\];\s*for\s*\(\s*let\s+([a-zA-Z0-9_]+)\s*=\s*0;\s*\2\s*<\s*([a-zA-Z0-9_]+)\.length;\s*\2\+\+\s*\)\s*{\s*if\s*\(([^}]+)\)\s*{\s*([a-zA-Z0-9_]+)\.push\(([a-zA-Z0-9_\[\]\.]+)\);\s*}\s*}/g,
    'const $1 = $3.filter((item, index) => $4);'
  );
  
  // Convert traditional promise chains to async/await
  refactored = refactored.replace(
    /([a-zA-Z0-9_]+)\.then\(\s*(?:function\s*\(([^)]*)\)|(?:\(([^)]*)\)\s*=>))\s*{\s*([^}]*)\s*}\s*\)\.catch\(\s*(?:function\s*\(([^)]*)\)|(?:\(([^)]*)\)\s*=>))\s*{\s*([^}]*)\s*}\s*\)/g,
    'try {\n  const $2$3 = await $1;\n  $4\n} catch (error) {\n  $7\n}'
  );
  
  // Simplify basic promise chains to async/await
  refactored = refactored.replace(
    /([a-zA-Z0-9_]+)\s*\.\s*then\s*\(\s*(?:function\s*\(([^)]*)\)|(?:\(([^)]*)\)\s*=>))\s*{([^}]*)}\s*\)/g, 
    'const $2$3 = await $1;\n$4'
  );
  
  // Replace string concatenation with template literals
  refactored = refactored.replace(/(['"])([^'"]*)\1\s*\+\s*([a-zA-Z0-9_\[\]\(\)\.]+)/g, '`$2${$3}`');
  refactored = refactored.replace(/([a-zA-Z0-9_\[\]\(\)\.]+)\s*\+\s*(['"])([^'"]*)\2/g, '`${$1}$3`');
  refactored = refactored.replace(/(['"])([^'"]*)\1\s*\+\s*(['"])([^'"]*)\3/g, '$1$2$4$3');
  
  // Remove unnecessary console.logs (only keep if they contain important keywords)
  refactored = refactored.replace(/console\.log\((?!.*error|.*warning|.*important)([^)]*)\);(\s*\n)/g, '$2');
  
  // Replace traditional conditionals with ternary operators for simple cases
  refactored = refactored.replace(
    /if\s*\(([^)]+)\)\s*{\s*return\s+([^;]+);\s*}\s*else\s*{\s*return\s+([^;]+);\s*}/g,
    'return $1 ? $2 : $3;'
  );
  
  // Use destructuring for object properties
  refactored = refactored.replace(
    /const\s+([a-zA-Z0-9_]+)\s*=\s*([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+);\s*const\s+([a-zA-Z0-9_]+)\s*=\s*\2\.([a-zA-Z0-9_]+);/g,
    'const { $3: $1, $5: $4 } = $2;'
  );
  
  // Use object shorthand notation
  refactored = refactored.replace(/{\s*([a-zA-Z0-9_]+)\s*:\s*([a-zA-Z0-9_]+)\s*}/g, (match, p1, p2) => {
    if (p1 === p2) {
      return `{ ${p1} }`;
    }
    return match;
  });
  
  // Add missing semicolons at end of statements
  refactored = refactored.replace(/([^;\s{}\[\]])\s*\n\s*(?![)}\],;])/g, '$1;\n');
  
  // Convert require to ES6 import/export syntax
  refactored = refactored.replace(/const\s+([a-zA-Z0-9_]+)\s*=\s*require\(['"]([^'"]+)['"]\);/g, 'import $1 from "$2";');
  refactored = refactored.replace(/const\s*{\s*([^}]+)\s*}\s*=\s*require\(['"]([^'"]+)['"]\);/g, 'import { $1 } from "$2";');
  refactored = refactored.replace(/module\.exports\s*=\s*([a-zA-Z0-9_]+);/g, 'export default $1;');
  refactored = refactored.replace(/exports\.([a-zA-Z0-9_]+)\s*=\s*([a-zA-Z0-9_]+);/g, 'export const $1 = $2;');
  
  // Add JSDoc comments for functions
  refactored = refactored.replace(
    /const\s+([a-zA-Z0-9_]+)\s*=\s*(\(.*?\))\s*=>\s*{/g,
    '/**\n * $1 function\n * @param {Object} params - Function parameters\n */\nconst $1 = $2 => {'
  );
  
  // Spread operator for array concatenation
  refactored = refactored.replace(
    /const\s+([a-zA-Z0-9_]+)\s*=\s*([a-zA-Z0-9_]+)\.concat\(([a-zA-Z0-9_]+)\);/g,
    'const $1 = [...$2, ...$3];'
  );
  
  // Use optional chaining for nested properties
  refactored = refactored.replace(
    /if\s*\(([a-zA-Z0-9_]+)\s*&&\s*\1\.([a-zA-Z0-9_]+)\)\s*{\s*([^}]*\1\.\2[^}]*)\s*}/g,
    '$3'.replace(new RegExp(`${RegExp.$1}\\.${RegExp.$2}`, 'g'), `${RegExp.$1}?.${RegExp.$2}`)
  );
  
  return refactored;
};

/**
 * Refactors Python code to follow modern best practices
 * @param code - The original Python code
 * @returns Refactored code with improved practices
 */
export const refactorPython = (code: string): string => {
  let refactored = code;
  
  // Add docstrings to modules
  if (!refactored.match(/^(["']{3}|#)/)) {
    refactored = '"""\nPython module for handling business logic.\n\nThis module follows PEP 8 style guidelines.\n"""\n\n' + refactored;
  }
  
  // Replace old-style string formatting with f-strings
  refactored = refactored.replace(/"([^"]*)"%\s*\(([^)]*)\)/g, 'f"$1{$2}"');
  refactored = refactored.replace(/'([^']*)'\s*%\s*\(([^)]*)\)/g, "f'$1{$2}'");
  refactored = refactored.replace(/\.format\((.*?)\)/g, (match, args) => {
    // Convert .format() to f-string
    let formatStr = match.split('.format(')[0];
    formatStr = formatStr.replace(/^["']/, '').replace(/["']$/, '');
    
    // Replace {0}, {1}, etc. with corresponding arguments
    const argsList = args.split(',').map(arg => arg.trim());
    let fString = formatStr;
    
    for (let i = 0; i < argsList.length; i++) {
      fString = fString.replace(new RegExp(`\\{${i}\\}`, 'g'), `{${argsList[i]}}`);
    }
    
    return `f"${fString}"`;
  });
  
  // Convert traditional for loops to list comprehensions
  refactored = refactored.replace(
    /([a-zA-Z0-9_]+)\s*=\s*\[\]\s*\n\s*for\s+([a-zA-Z0-9_]+)\s+in\s+([^:]+):\s*\n\s+([a-zA-Z0-9_]+)\.append\(([^)]+)\)/g, 
    '$1 = [$5 for $2 in $3]'
  );
  
  // Convert conditional list comprehensions
  refactored = refactored.replace(
    /([a-zA-Z0-9_]+)\s*=\s*\[\]\s*\n\s*for\s+([a-zA-Z0-9_]+)\s+in\s+([^:]+):\s*\n\s+if\s+([^:]+):\s*\n\s+([a-zA-Z0-9_]+)\.append\(([^)]+)\)/g, 
    '$1 = [$6 for $2 in $3 if $4]'
  );
  
  // Use enumerate instead of manual indexing
  refactored = refactored.replace(
    /for\s+i\s+in\s+range\(len\(([a-zA-Z0-9_]+)\)\):/g,
    'for i, item in enumerate($1):'
  );
  
  // Replace if x == True/False with if x/if not x
  refactored = refactored.replace(/if\s+([a-zA-Z0-9_]+)\s*==\s*True/g, 'if $1');
  refactored = refactored.replace(/if\s+([a-zA-Z0-9_]+)\s*==\s*False/g, 'if not $1');
  
  // Use context managers (with statements) for file operations
  refactored = refactored.replace(
    /([a-zA-Z0-9_]+)\s*=\s*open\(([^)]+)\)\s*\n([^]*?)([a-zA-Z0-9_]+)\.close\(\)/gs,
    'with open($2) as $1:\n$3'
  );
  
  // Use join method for string concatenation in loops
  refactored = refactored.replace(
    /([a-zA-Z0-9_]+)\s*=\s*['"]{2}\s*\n\s*for\s+([a-zA-Z0-9_]+)\s+in\s+([^:]+):\s*\n\s+\1\s*\+=\s*([^\n]+)/g,
    '$1 = "".join([$4 for $2 in $3])'
  );
  
  // Add type hints to functions
  refactored = refactored.replace(/def\s+([a-zA-Z0-9_]+)\s*\(([^):\n]*)\):/g, (match, funcName, params) => {
    if (!params.includes(':')) {
      const paramsList = params.split(',').map(p => {
        const trimmed = p.trim();
        if (trimmed.includes('=')) {
          // Handle default parameters
          const [paramName, defaultValue] = trimmed.split('=').map(p => p.trim());
          if (defaultValue.match(/^[0-9]+$/)) return `${paramName}: int = ${defaultValue}`;
          if (defaultValue.match(/^[0-9]*\.[0-9]+$/)) return `${paramName}: float = ${defaultValue}`;
          if (defaultValue === 'True' || defaultValue === 'False') return `${paramName}: bool = ${defaultValue}`;
          if (defaultValue === '[]') return `${paramName}: List = ${defaultValue}`;
          if (defaultValue === '{}') return `${paramName}: Dict = ${defaultValue}`;
          if (defaultValue === 'None') return `${paramName}: Optional[Any] = ${defaultValue}`;
          return `${paramName}: Any = ${defaultValue}`;
        }
        return trimmed ? `${trimmed}: Any` : '';
      }).filter(Boolean);
      
      return `def ${funcName}(${paramsList.join(', ')}) -> Any:`;
    }
    return match;
  });
  
  // Add type hints imports if they're used
  if (refactored.includes(': List') || refactored.includes(': Dict') || refactored.includes('Optional[')) {
    refactored = 'from typing import Any, Dict, List, Optional, Union\n\n' + refactored;
  } else if (refactored.includes(': Any')) {
    refactored = 'from typing import Any\n\n' + refactored;
  }
  
  // Replace mutable default arguments
  refactored = refactored.replace(
    /def\s+([a-zA-Z0-9_]+)\s*\(([^)]*),\s*([a-zA-Z0-9_]+)=\[\]/g, 
    'def $1($2, $3=None):\n    if $3 is None:\n        $3 = []'
  );
  
  // Add docstrings to functions
  refactored = refactored.replace(
    /def\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)(\s*->[\s\w\[\],]*)?\s*:/g,
    (match, funcName, params, returnType) => {
      const returnTypeStr = returnType ? returnType.replace('-> ', '') : 'Any';
      const paramsList = params.split(',').map(p => p.trim()).filter(Boolean);
      const paramDocs = paramsList.map(p => {
        const paramName = p.split(':')[0].split('=')[0].trim();
        return `        ${paramName}: Parameter description`;
      }).join('\n');
      
      return `def ${funcName}(${params})${returnType || ''}:\n    """\n    ${funcName} function.\n    \n    Args:\n${paramDocs}\n    \n    Returns:\n        ${returnTypeStr}: Return value description\n    """\n`;
    }
  );
  
  // Use pathlib instead of os.path for file operations
  if (refactored.includes('os.path.join') || refactored.includes('os.path.exists')) {
    refactored = refactored.replace(/import os/g, 'import os\nfrom pathlib import Path');
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
  
  // Add header guard or '#pragma once' if it's a header file and doesn't have it
  if ((refactored.includes('.h') || refactored.includes('.hpp')) && 
      !refactored.includes('#ifndef') && !refactored.includes('#pragma once')) {
    refactored = '#pragma once\n\n' + refactored;
  }
  
  // Replace NULL with nullptr
  refactored = refactored.replace(/\bNULL\b/g, 'nullptr');
  
  // Use auto for variable declarations where type is obvious
  refactored = refactored.replace(/(std::)?([a-zA-Z0-9_:]+)<[^>]+>\s+([a-zA-Z0-9_]+)\s*=\s*/g, 'auto $3 = ');
  
  // Replace raw loops with range-based for loops
  refactored = refactored.replace(
    /for\s*\(\s*(?:int|size_t)\s+([a-zA-Z0-9_]+)\s*=\s*0\s*;\s*\1\s*<\s*([a-zA-Z0-9_]+)\.size\(\)\s*;\s*\1\+\+\s*\)/g, 
    'for (const auto& element : $2)'
  );
  
  // Use structured bindings for pairs and tuples
  refactored = refactored.replace(
    /auto\s+([a-zA-Z0-9_]+)\s*=\s*([a-zA-Z0-9_]+)\.(\w+)\(\);\s*auto\s+([a-zA-Z0-9_]+)\s*=\s*\2\.(\w+)\(\);/g,
    'auto [$1, $4] = std::make_pair($2.$3(), $2.$5());'
  );
  
  // Convert raw pointers to smart pointers
  refactored = refactored.replace(
    /([a-zA-Z0-9_]+)\s*\*\s*([a-zA-Z0-9_]+)\s*=\s*new\s+([a-zA-Z0-9_<>]+)(\(.*\))?;/g,
    'std::unique_ptr<$1> $2 = std::make_unique<$3>$4;'
  );
  
  // Remove raw delete calls (assuming smart pointers are used)
  refactored = refactored.replace(/delete\s+([a-zA-Z0-9_]+);/g, '// Smart pointer will handle memory');
  refactored = refactored.replace(/delete\[\]\s+([a-zA-Z0-9_]+);/g, '// Smart pointer will handle array memory');
  
  // Replace C-style casts with C++ static_cast
  refactored = refactored.replace(/\(([a-zA-Z0-9_]+)\)\s*([a-zA-Z0-9_().]+)/g, 'static_cast<$1>($2)');
  
  // Replace C-style arrays with std::array or std::vector
  refactored = refactored.replace(
    /([a-zA-Z0-9_]+)\s+([a-zA-Z0-9_]+)\[([0-9]+)\];/g,
    'std::array<$1, $3> $2;'
  );
  
  // Add const correctness to function parameters
  refactored = refactored.replace(
    /void\s+([a-zA-Z0-9_]+)\s*\(\s*([a-zA-Z0-9_:]+)(?!\s*&|\s*\*)\s+([a-zA-Z0-9_]+)\s*\)/g,
    'void $1(const $2& $3)'
  );
  
  // Add comprehensive error handling with try-catch blocks
  refactored = refactored.replace(
    /try\s*{([^}]*)}(\s*)catch\s*\(([^)]*)\)\s*{([^}]*)}/g,
    'try {\n$1\n}$2catch (const $3& e) {\n    std::cerr << "Error: " << e.what() << std::endl;\n$4\n}'
  );
  
  // Add function comments
  refactored = refactored.replace(
    /(void|int|bool|double|float|auto|std::[a-zA-Z0-9_:<>]+)\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/g,
    '/**\n * $2 function\n *\n * @param $3\n * @return $1\n */\n$1 $2($3)'
  );
  
  // Ensure standard namespace is properly qualified
  refactored = refactored.replace(/\bvector\b(?!\s*<)/g, 'std::vector');
  refactored = refactored.replace(/\bstring\b(?!\s*<)/g, 'std::string');
  refactored = refactored.replace(/\bmap\b(?!\s*<)/g, 'std::map');
  refactored = refactored.replace(/\bset\b(?!\s*<)/g, 'std::set');
  refactored = refactored.replace(/\bqueue\b(?!\s*<)/g, 'std::queue');
  refactored = refactored.replace(/\bstack\b(?!\s*<)/g, 'std::stack');
  refactored = refactored.replace(/\barray\b(?!\s*<)/g, 'std::array');
  
  // Add include directives if needed
  if (refactored.includes('unique_ptr') && !refactored.includes('#include <memory>')) {
    refactored = '#include <memory>\n' + refactored;
  }
  if (refactored.includes('std::array') && !refactored.includes('#include <array>')) {
    refactored = '#include <array>\n' + refactored;
  }
  if (refactored.includes('std::vector') && !refactored.includes('#include <vector>')) {
    refactored = '#include <vector>\n' + refactored;
  }
  if (refactored.includes('std::string') && !refactored.includes('#include <string>')) {
    refactored = '#include <string>\n' + refactored;
  }
  if (refactored.includes('std::cerr') && !refactored.includes('#include <iostream>')) {
    refactored = '#include <iostream>\n' + refactored;
  }
  
  return refactored;
};

/**
 * Refactors Java code to follow modern best practices
 * @param code - The original Java code
 * @returns Refactored code with improved practices
 */
export const refactorJava = (code: string): string => {
  let refactored = code;
  
  // Add package declaration if missing (assuming default package)
  if (!refactored.match(/^package\s+[a-z][a-z0-9_]*(?:\.[a-z0-9_]+)*;/)) {
    // Only add if it appears to be a Java class file with a class definition
    if (refactored.match(/\s*public\s+class\s+[A-Z][a-zA-Z0-9_]*/)) {
      refactored = 'package com.example;\n\n' + refactored;
    }
  }
  
  // Update Java raw types to use Generics
  refactored = refactored.replace(/\bArrayList(?!\s*<)/g, 'ArrayList<>');
  refactored = refactored.replace(/\bHashMap(?!\s*<)/g, 'HashMap<>');
  refactored = refactored.replace(/\bHashSet(?!\s*<)/g, 'HashSet<>');
  
  // Replace raw loops with enhanced for loops
  refactored = refactored.replace(
    /for\s*\(\s*int\s+([a-zA-Z0-9_]+)\s*=\s*0\s*;\s*\1\s*<\s*([a-zA-Z0-9_]+)\.size\(\)\s*;\s*\1\+\+\s*\)/g, 
    'for (var item : $2)'
  );
  
  // Use var instead of explicit types where possible (Java 10+)
  refactored = refactored.replace(/([A-Z][a-zA-Z0-9_<>]+(?:<[^>]+>)?)\s+([a-zA-Z0-9_]+)\s*=\s*new\s+\1/g, 'var $2 = new $1');
  
  // Use streams for filtering and mapping collections
  refactored = refactored.replace(
    /List<([a-zA-Z0-9_]+)>\s+([a-zA-Z0-9_]+)\s*=\s*new\s+ArrayList<>\(\);[\s\n]*for\s*\(([a-zA-Z0-9_<>]+)\s+([a-zA-Z0-9_]+)\s*:\s*([a-zA-Z0-9_]+)\)\s*{\s*if\s*\(([^}]*)\)\s*{\s*([a-zA-Z0-9_]+)\.add\(([^;]*)\);\s*}\s*}/g,
    'List<$1> $2 = $5.stream()\n  .filter($4 -> $6)\n  .map($4 -> $8)\n  .collect(Collectors.toList());'
  );
  
  // Add streams import if used
  if (refactored.includes('.stream()')  && !refactored.includes('import java.util.stream')) {
    const importIndex = refactored.indexOf('import ');
    if (importIndex >= 0) {
      // Add after existing imports
      const importSection = refactored.substring(importIndex, refactored.indexOf(';', importIndex) + 1);
      const afterImport = refactored.substring(importIndex + importSection.length);
      refactored = refactored.substring(0, importIndex + importSection.length) + 
                  '\nimport java.util.stream.*;\nimport java.util.function.*;\nimport java.util.Collectors;' + 
                  afterImport;
    } else {
      // No imports yet, add to top (after package if present)
      const packageEnd = refactored.indexOf('package ') >= 0 ? refactored.indexOf(';', refactored.indexOf('package ')) + 1 : 0;
      refactored = refactored.substring(0, packageEnd) + 
                  (packageEnd > 0 ? '\n\n' : '') + 
                  'import java.util.stream.*;\nimport java.util.function.*;\nimport java.util.Collectors;\n\n' + 
                  refactored.substring(packageEnd);
    }
  }
  
  // Use String.format instead of concatenation for complex strings
  refactored = refactored.replace(/(".*?")\s*\+\s*([a-zA-Z0-9_]+)\s*\+\s*(".*?")/g, 'String.format($1 + "%s" + $3, $2)');
  
  // Try-with-resources for closeable resources
  refactored = refactored.replace(
    /([a-zA-Z0-9_<>]+)\s+([a-zA-Z0-9_]+)\s*=\s*new\s+([a-zA-Z0-9_<>]+)\(([^)]*)\);[\s\n]*try\s*{([^}]*)}\s*finally\s*{\s*([a-zA-Z0-9_]+)\.close\(\);\s*}/g,
    'try ($1 $2 = new $3($4)) {$5}'
  );
  
  // Use Optional for nullable returns
  refactored = refactored.replace(
    /public\s+([A-Za-z0-9_<>]+)\s+([a-zA-Z0-9_]+)\(([^)]*)\)\s*{[\s\n]*if\s*\(([^}]*)\)\s*{\s*return\s+null;\s*}([\s\S]*?)return\s+([^;]+);/g,
    'public Optional<$1> $2($3) {\n    if ($4) {\n        return Optional.empty();\n    }$5return Optional.of($6);'
  );
  
  // Add Optional import if used
  if (refactored.includes('Optional.') && !refactored.includes('import java.util.Optional;')) {
    const importIndex = refactored.indexOf('import ');
    if (importIndex >= 0) {
      // Add after existing imports
      const importSection = refactored.substring(importIndex, refactored.indexOf(';', importIndex) + 1);
      const afterImport = refactored.substring(importIndex + importSection.length);
      refactored = refactored.substring(0, importIndex + importSection.length) + 
                  '\nimport java.util.Optional;' + 
                  afterImport;
    } else {
      // No imports yet, add to top (after package if present)
      const packageEnd = refactored.indexOf('package ') >= 0 ? refactored.indexOf(';', refactored.indexOf('package ')) + 1 : 0;
      refactored = refactored.substring(0, packageEnd) + 
                  (packageEnd > 0 ? '\n\n' : '') + 
                  'import java.util.Optional;\n\n' + 
                  refactored.substring(packageEnd);
    }
  }
  
  // Add comprehensive Javadoc comments
  refactored = refactored.replace(
    /public\s+([a-zA-Z0-9_<>]+)\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/g,
    '/**\n * $2 method\n *\n * @param $3\n * @return $1\n */\npublic $1 $2($3)'
  );
  
  // Add @Override annotation where appropriate
  refactored = refactored.replace(
    /public\s+([a-zA-Z0-9_<>]+)\s+(equals|hashCode|toString|compareTo)\s*\(/g,
    '@Override\npublic $1 $2('
  );
  
  // Fix equals method implementations
  refactored = refactored.replace(
    /public\s+boolean\s+equals\s*\(\s*Object\s+([a-zA-Z0-9_]+)\s*\)\s*{[\s\n]*if\s*\(\s*\1\s*==\s*this\s*\)\s*{\s*return\s+true;\s*}[\s\n]*if\s*\(\s*\1\s*==\s*null\s*\)\s*{\s*return\s+false;\s*}[\s\n]*if\s*\(\s*\1\s*instanceof\s+([a-zA-Z0-9_]+)\s*\)\s*{[\s\n]*/g,
    '@Override\npublic boolean equals(Object $1) {\n    if ($1 == this) return true;\n    if ($1 == null || getClass() != $1.getClass()) return false;\n    $2 other = ($2) $1;\n    '
  );
