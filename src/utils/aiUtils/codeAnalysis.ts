
import { QualityResults } from "@/types/codeQuality";

// Mock data for development until real AI integration
const generateMockQualityResults = (): QualityResults => {
  return {
    score: Math.floor(Math.random() * 40) + 60,
    readabilityScore: Math.floor(Math.random() * 40) + 60,
    maintainabilityScore: Math.floor(Math.random() * 40) + 60,
    performanceScore: Math.floor(Math.random() * 40) + 60,
    securityScore: Math.floor(Math.random() * 40) + 60,
    codeSmellScore: Math.floor(Math.random() * 40) + 60,
    issues: [
      "Variable names are not descriptive enough",
      "Functions are too long and complex",
      "Missing error handling in critical sections",
      "Potential memory leaks in resource management",
      "Security vulnerability: Unsanitized user input"
    ],
    recommendations: [
      "Use more descriptive variable names",
      "Break down large functions into smaller, reusable functions",
      "Implement proper error handling with try-catch blocks",
      "Ensure resources are properly released",
      "Sanitize all user inputs before processing"
    ]
  };
};

// AI-powered code analysis
export const analyzeCodeWithAI = async (
  code: string, 
  language: string
): Promise<QualityResults> => {
  // In a real implementation, this would call an AI service
  // For now, we'll return mock data with a delay to simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateMockQualityResults());
    }, 1500);
  });
};

// AI-powered repository analysis
export const analyzeRepositoryWithAI = async (
  files: Array<{path: string, content: string}>
): Promise<QualityResults> => {
  // In a real implementation, this would call an AI service with the batch of files
  // For now, we'll return mock data with a delay to simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateMockQualityResults());
    }, 2000);
  });
};
