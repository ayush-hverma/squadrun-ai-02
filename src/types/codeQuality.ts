
export interface QualityResults {
  score: number;
  readabilityScore: number;
  maintainabilityScore: number;
  performanceScore: number;
  securityScore: number;
  codeSmellScore: number;
  issues: string[];
  recommendations: string[];
}
