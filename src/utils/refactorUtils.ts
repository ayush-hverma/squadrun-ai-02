
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

  // Apply common refactoring improvements
  refactored = applyCommonRefactoring(refactored, instructions);

  return refactored;
};

/**
 * Apply common refactoring improvements across all languages
 */
const applyCommonRefactoring = (code: string, instructions?: string): string => {
  let refactored = code;

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
  }
  
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
