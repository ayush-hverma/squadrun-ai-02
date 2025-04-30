
import { LucideIcon } from "lucide-react";

export interface QualityResults {
  score: number;
  readabilityScore: number;
  maintainabilityScore: number;
  performanceScore: number;
  securityScore: number;
  codeSmellScore: number;
  issues: string[];
  recommendations: string[];
  summary?: string;
  categories?: CategoryScore[];
  snippets?: CodeSnippet[];
  refactoredCode?: string;
}

export interface CategoryScore {
  name: string;
  score: number;
  icon?: LucideIcon;
}

export interface CodeSnippet {
  title: string;
  code: string;
  suggestion: string;
}
