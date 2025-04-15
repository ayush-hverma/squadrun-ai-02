
/**
 * Types for code quality assessment functionality
 */

export interface QualityMetrics {
  lineLength: number;
  commentRatio: number;
  complexityScore: number;
  securityScore: number;
  consistencyScore: number;
}

export interface CodeSnippet {
  title: string;
  code: string;
  suggestion: string;
}

export interface CategoryScore {
  name: string;
  score: number;
  icon: React.ElementType;
}

export interface QualityResults {
  score: number;
  summary: string;
  categories: CategoryScore[];
  recommendations: string[];
  snippets: CodeSnippet[];
  refactoredCode: string;
}
