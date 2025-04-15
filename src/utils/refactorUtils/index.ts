
/**
 * Main entry point for code refactoring utilities
 */

import { RefactoringResult, SupportedLanguage } from "@/types/refactor";
import { refactorJavaScript, refactorPython, refactorCPP, refactorJava } from "./languageRefactors";
import { refactorGeneric } from "./baseRefactor";
import { calculateImprovements } from "./improvementDetection";

/**
 * Perform code refactoring based on the file type
 * @param code - Original code to refactor
 * @param language - Programming language extension
 * @returns Refactored code
 */
export const performRefactoring = (code: string, language: SupportedLanguage): string => {
  // Determine which language-specific refactoring to use
  if (language === 'js' || language === 'jsx' || language === 'ts' || language === 'tsx') {
    return refactorJavaScript(code);
  } else if (language === 'py') {
    return refactorPython(code);
  } else if (language === 'cpp' || language === 'c' || language === 'h') {
    return refactorCPP(code);
  } else if (language === 'java') {
    return refactorJava(code);
  }
  
  // If we don't have a specific refactoring for this language, apply generic improvements
  return refactorGeneric(code);
};

/**
 * Process the code refactoring and return detailed results
 * @param code - Original code to refactor
 * @param language - Programming language extension
 * @returns Detailed refactoring results including improvements
 */
export const processCodeRefactoring = (code: string, language: SupportedLanguage): RefactoringResult => {
  // Apply the refactoring
  const refactoredCode = performRefactoring(code, language);
  
  // Calculate improvements made
  const improvementDetails = calculateImprovements(code, refactoredCode, language);
  
  // Calculate quality score (based on improvements with a minimum of 91)
  const baseScore = 91;
  const maxImprovement = 9;
  const qualityScore = Math.min(100, baseScore + Math.min(improvementDetails.count, maxImprovement));
  
  return {
    refactoredCode,
    qualityScore,
    improvementCount: improvementDetails.count,
    improvements: improvementDetails.descriptions
  };
};

export { refactorJavaScript, refactorPython, refactorCPP, refactorJava, refactorGeneric };
