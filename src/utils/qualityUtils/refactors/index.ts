
import { refactorJavaScript } from './javascriptRefactor';
import { refactorPython } from './pythonRefactor';
import { refactorCPP } from './cppRefactor';
import { refactorJava } from './javaRefactor';
import { refactorGeneric } from './genericRefactor';

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

export {
  refactorJavaScript,
  refactorPython,
  refactorCPP,
  refactorJava,
  refactorGeneric
};
