
import { refactorJavaScript, refactorPython, refactorCPP, refactorJava, refactorGeneric } from "@/utils/qualityUtils/codeRefactorer";

/**
 * Refactor code based on programming language and user instructions
 */
export const refactorCode = (code: string, language: string, instructions?: string): string => {
  let refactored = "";

  // Apply language-specific refactoring
  switch(language) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      refactored = refactorJavaScript(code);
      break;
    case 'py':
      refactored = refactorPython(code);
      break;
    case 'cpp':
    case 'c':
    case 'h':
      refactored = refactorCPP(code);
      break;
    case 'java':
      refactored = refactorJava(code);
      break;
    default:
      refactored = refactorGeneric(code);
  }

  // Apply common refactoring improvements and user instructions
  refactored = applyCommonRefactoring(refactored, instructions);

  return refactored;
};

/**
 * Apply common refactoring improvements across all languages
 */
const applyCommonRefactoring = (code: string, instructions?: string): string => {
  let refactored = code;

  // Extract constants from hardcoded values
  refactored = extractConstants(refactored);
  
  // Add meaningful variable names
  refactored = improveVariableNames(refactored);
  
  // Apply function modularization
  refactored = modularizeFunctions(refactored);
  
  // Improve error handling
  refactored = enhanceErrorHandling(refactored);
  
  // Remove unnecessary comments
  refactored = refactored.replace(/\/\/\s*TODO:.*\n/g, '');
  
  // Remove consecutive blank lines
  refactored = refactored.replace(/\n\s*\n\s*\n+/g, '\n\n');
  
  // Add consistent spacing around operators if not language-specific
  refactored = refactored.replace(/([a-zA-Z0-9_])([+\-*/%&|^<>=!])(=?)([a-zA-Z0-9_])/g, '$1 $2$3 $4');
  
  // Apply user instructions if provided
  if (instructions && instructions.trim().length > 0) {
    // Basic instruction parsing
    if (instructions.toLowerCase().includes('remove comments')) {
      refactored = removeAllComments(refactored);
    }
    
    if (instructions.toLowerCase().includes('add type hints') || 
        instructions.toLowerCase().includes('add types')) {
      refactored = addSimpleTypeHints(refactored);
    }
    
    if (instructions.toLowerCase().includes('extract constants')) {
      refactored = extractConstants(refactored);
    }
    
    if (instructions.toLowerCase().includes('modularize') || 
        instructions.toLowerCase().includes('break down functions')) {
      refactored = modularizeFunctions(refactored);
    }
  }
  
  return refactored;
};

/**
 * Extract magic numbers and string literals into named constants
 */
const extractConstants = (code: string): string => {
  let refactored = code;
  
  // Extract numeric literals that appear multiple times
  const numberRegex = /\b(\d+(\.\d+)?)\b/g;
  const numbers = new Map();
  
  let match;
  while ((match = numberRegex.exec(code)) !== null) {
    const num = match[0];
    numbers.set(num, (numbers.get(num) || 0) + 1);
  }
  
  // Extract frequently used numbers (appearing more than twice)
  numbers.forEach((count, num) => {
    if (count > 2) {
      // Don't extract common numbers like 0, 1
      if (num !== '0' && num !== '1' && num !== '2') {
        const constName = `CONSTANT_${num.replace('.', '_')}`;
        
        // Add constant definition at the top of the file
        if (!refactored.includes(`const ${constName} =`)) {
          // For Python
          if (refactored.includes('import ') || refactored.startsWith('#')) {
            const importEnd = refactored.lastIndexOf('import ');
            const nextLineAfterImports = refactored.indexOf('\n', importEnd) + 1;
            refactored = refactored.slice(0, nextLineAfterImports) + 
                        `\n${constName} = ${num}\n` + 
                        refactored.slice(nextLineAfterImports);
          } 
          // For JavaScript/TypeScript
          else if (refactored.includes('const ') || refactored.includes('let ')) {
            refactored = `const ${constName} = ${num};\n\n` + refactored;
          }
        }
        
        // Replace occurrences with the constant name
        refactored = refactored.replace(new RegExp(`\\b${num}\\b`, 'g'), constName);
      }
    }
  });
  
  return refactored;
};

/**
 * Improve variable names to be more descriptive
 */
const improveVariableNames = (code: string): string => {
  let refactored = code;
  
  // Replace short variable names with more descriptive ones
  const singleCharVars = [
    { from: /\bi\b/g, to: 'index' },
    { from: /\bn\b/g, to: 'count' },
    { from: /\bs\b/g, to: 'string' },
    { from: /\ba\b/g, to: 'array' },
    { from: /\bo\b/g, to: 'object' },
    { from: /\bf\b/g, to: 'function' },
    { from: /\be\b/g, to: 'error' },
    { from: /\br\b/g, to: 'result' },
    { from: /\bv\b/g, to: 'value' },
    { from: /\bk\b/g, to: 'key' },
    { from: /\bx\b/g, to: 'xCoordinate' },
    { from: /\by\b/g, to: 'yCoordinate' },
  ];
  
  // Only replace isolated occurrences (not parts of larger names)
  singleCharVars.forEach(({ from, to }) => {
    refactored = refactored.replace(from, to);
  });
  
  return refactored;
};

/**
 * Break down large functions into smaller, more focused ones
 */
const modularizeFunctions = (code: string): string => {
  let refactored = code;
  
  // This is a simplified approach, real modularization requires AST parsing
  // Look for large code blocks within functions
  const functionBodyRegex = /function\s+([a-zA-Z0-9_]+)\s*\([^)]*\)\s*{([^}]+)}/gs;
  const matches = code.matchAll(functionBodyRegex);
  
  for (const match of matches) {
    const functionName = match[1];
    const functionBody = match[2];
    
    // If function body is large (more than 20 lines)
    if (functionBody.split('\n').length > 20) {
      // Try to identify logical blocks by comments or blank lines
      const blocks = functionBody.split(/\n\s*\n|\n\s*\/\/\s*[-=]+\s*\n/);
      
      if (blocks.length > 1) {
        let newFunctions = '';
        let newFunctionBody = functionBody;
        
        blocks.forEach((block, index) => {
          if (block.trim().length > 5 && index > 0) { // Skip first block if it's mostly setup
            const helperName = `${functionName}Helper${index}`;
            newFunctions += `\nfunction ${helperName}() {\n${block}\n}\n\n`;
            newFunctionBody = newFunctionBody.replace(block, `${helperName}();`);
          }
        });
        
        // Replace the original function with the refactored version
        const originalFunction = match[0];
        const refactoredFunction = `function ${functionName}([^)]*) {\n${newFunctionBody}\n}\n\n${newFunctions}`;
        refactored = refactored.replace(originalFunction, refactoredFunction);
      }
    }
  }
  
  return refactored;
};

/**
 * Enhance error handling in the code
 */
const enhanceErrorHandling = (code: string): string => {
  let refactored = code;
  
  // Add try-catch blocks around risky operations (file operations, network calls)
  
  // For JavaScript/TypeScript: Add try-catch around fetch operations
  refactored = refactored.replace(
    /(const|let|var)?\s*([a-zA-Z0-9_]+)\s*=\s*await\s+fetch\(([^)]+)\);/g,
    `try {\n  $1 $2 = await fetch($3);\n} catch (error) {\n  console.error("Error fetching data:", error);\n}`
  );
  
  // For Python: Add try-except around file operations
  refactored = refactored.replace(
    /(with open\([^)]+\) as [a-zA-Z0-9_]+:)/g,
    `try:\n    $1\nexcept Exception as e:\n    print(f"Error opening file: {e}")`
  );
  
  return refactored;
};

/**
 * Remove all comments from code
 */
const removeAllComments = (code: string): string => {
  // Remove multi-line comments (/* */)
  let result = code.replace(/\/\*[\s\S]*?\*\//g, '');
  
  // Remove single-line comments (//)
  result = result.replace(/\/\/.*$/gm, '');
  
  // Remove Python-style comments (#)
  result = result.replace(/\s*#.*$/gm, '');
  
  return result;
};

/**
 * Add simple type hints to variables and function parameters
 * This is a naive implementation and would need to be improved for production
 */
const addSimpleTypeHints = (code: string): string => {
  let refactored = code;
  
  // For TypeScript/JavaScript: add simple types to variables
  refactored = refactored.replace(
    /const\s+([a-zA-Z0-9_]+)\s*=\s*(\d+);/g, 
    'const $1: number = $2;'
  );
  
  refactored = refactored.replace(
    /const\s+([a-zA-Z0-9_]+)\s*=\s*['"].*['"];/g, 
    'const $1: string = $2;'
  );
  
  refactored = refactored.replace(
    /const\s+([a-zA-Z0-9_]+)\s*=\s*\[(.*)\];/g, 
    'const $1: any[] = [$2];'
  );
  
  refactored = refactored.replace(
    /const\s+([a-zA-Z0-9_]+)\s*=\s*\{(.*)\};/g, 
    'const $1: Record<string, any> = {$2};'
  );
  
  // For function parameters in JavaScript/TypeScript
  refactored = refactored.replace(
    /function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/g,
    (match, funcName, params) => {
      // Simple parameter type inference
      const typedParams = params.split(',').map(param => {
        param = param.trim();
        if (!param) return param;
        if (param.includes(':')) return param; // Already has type
        return `${param}: any`;
      }).join(', ');
      
      return `function ${funcName}(${typedParams}): any`;
    }
  );
  
  return refactored;
};
