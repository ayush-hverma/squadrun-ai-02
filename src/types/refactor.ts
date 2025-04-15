
/**
 * Types for code refactoring functionality
 */

export interface CodeSnippet {
  title: string;
  code: string;
  suggestion: string;
}

export interface ImprovementDetail {
  count: number;
  descriptions: string[];
}

export interface RefactoringResult {
  refactoredCode: string;
  qualityScore: number;
  improvementCount: number;
  improvements: string[];
}

export type SupportedLanguage = 'js' | 'jsx' | 'ts' | 'tsx' | 'py' | 'cpp' | 'c' | 'h' | 'java' | string;
