
/**
 * Code Refactoring Utilities
 * 
 * This module provides language-specific code refactoring capabilities
 * to improve code quality, readability, and adherence to best practices.
 */

import { refactorJavaScript } from './javascriptRefactor';
import { refactorPython } from './pythonRefactor';
import { refactorCPP } from './cppRefactor';
import { refactorJava } from './javaRefactor';
import { refactorGeneric } from './genericRefactor';

/**
 * Refactor code based on the programming language
 * 
 * @param code The source code to refactor
 * @param language The programming language identifier (e.g., 'js', 'py', 'cpp')
 * @returns The refactored code with improved quality
 */
export const refactorCode = (code: string, language: string): string => {
  switch(language.toLowerCase()) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
    case 'javascript':
    case 'typescript':
      return refactorJavaScript(code);
      
    case 'py':
    case 'python':
      return refactorPython(code);
      
    case 'cpp':
    case 'c':
    case 'h':
    case 'hpp':
    case 'c++':
      return refactorCPP(code);
      
    case 'java':
      return refactorJava(code);
      
    default:
      return refactorGeneric(code);
  }
};

export {
  refactorJavaScript,
  refactorPython,
  refactorCPP,
  refactorJava,
  refactorGeneric
};
