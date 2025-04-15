
import { QualityMetrics, CategoryScore, QualityResults, CodeSnippet } from "@/types/codeQuality";
import { refactorCode } from "./codeRefactorer";
import { BookOpen, CircleCheck, CircleAlert, AlertTriangle } from "lucide-react";

/**
 * Calculate code metrics based on the code content
 */
export const calculateCodeMetrics = (code: string): QualityMetrics => {
  // Split code into lines
  const lines = code.split('\n');
  
  // Calculate average line length (shorter is often better)
  const totalChars = code.length;
  const lineLength = Math.min(100, 100 - Math.min(30, Math.max(0, (totalChars / lines.length - 40) / 2)));
  
  // Check for comments
  const commentLines = lines.filter(line => 
    line.trim().startsWith('//') || 
    line.trim().startsWith('#') || 
    line.trim().startsWith('/*') || 
    line.includes('*/')
  ).length;
  const commentRatio = Math.min(100, (commentLines / lines.length) * 300);
  
  // Simple complexity heuristic (fewer nested blocks is better)
  const bracesCount = (code.match(/{/g) || []).length;
  const indentationLevel = Math.max(1, bracesCount / Math.max(1, lines.length) * 10);
  const complexityScore = Math.max(50, 100 - indentationLevel * 5);
  
  // Check for potential security issues (very basic check)
  const securityIssues = [
    'eval(', 'exec(', '.innerHTML', 'document.write(', 
    'sql.query(', 'unvalidated', 'unsanitized'
  ];
  const securityIssueCount = securityIssues.reduce((count, issue) => 
    count + (code.includes(issue) ? 1 : 0), 0);
  const securityScore = Math.max(50, 100 - securityIssueCount * 10);
  
  // Check for consistency in code style
  const mixedQuotes = (code.includes("'") && code.includes('"'));
  const mixedIndentation = (code.includes('    ') && code.includes('\t'));
  const consistencyScore = mixedQuotes || mixedIndentation ? 70 : 95;
  
  return {
    lineLength,
    commentRatio,
    complexityScore,
    securityScore,
    consistencyScore
  };
};

/**
 * Generate category scores based on code metrics
 */
export const generateCategoryScores = (metrics: QualityMetrics): CategoryScore[] => {
  return [
    { 
      name: "Readability", 
      score: Math.round((metrics.lineLength + metrics.commentRatio + metrics.consistencyScore) / 3), 
      icon: BookOpen 
    },
    { 
      name: "Maintainability", 
      score: Math.round((metrics.commentRatio + metrics.complexityScore) / 2), 
      icon: CircleCheck 
    },
    { 
      name: "Performance", 
      score: Math.round(metrics.complexityScore), 
      icon: CircleCheck 
    },
    { 
      name: "Security", 
      score: Math.round(metrics.securityScore), 
      icon: CircleAlert 
    },
    { 
      name: "Code Smell", 
      score: Math.round((metrics.consistencyScore + metrics.complexityScore) / 2), 
      icon: AlertTriangle 
    }
  ];
};

/**
 * Generate code improvement recommendations based on metrics
 */
export const generateRecommendations = (metrics: QualityMetrics, overallScore: number): string[] => {
  const recommendations = [];
  
  if (metrics.commentRatio < 70) {
    recommendations.push("Add more comments to explain complex logic and improve code understanding");
  }
  
  if (metrics.lineLength < 70) {
    recommendations.push("Consider breaking long lines of code into more readable, shorter segments");
  }
  
  if (metrics.complexityScore < 80) {
    recommendations.push("Refactor complex functions into smaller, more focused ones");
  }
  
  if (metrics.securityScore < 80) {
    recommendations.push("Review code for potential security vulnerabilities and add input validation");
  }
  
  if (metrics.consistencyScore < 80) {
    recommendations.push("Standardize code style (quotes, indentation, naming conventions)");
  }
  
  // Always recommend error handling as it's good practice
  if (overallScore < 95) {
    recommendations.push("Add error handling for potential exceptions");
  }
  
  return recommendations;
};

/**
 * Generate sample code snippets for improvement
 */
export const generateCodeSnippets = (metrics: QualityMetrics, language: string): CodeSnippet[] => {
  const snippets: CodeSnippet[] = [];
  
  if (metrics.securityScore < 80) {
    snippets.push({
      title: "Improve Security with Validation",
      code: "function getData() {\n  return fetch(url).then(res => res.json());\n  // Missing error handling\n}",
      suggestion: "function getData() {\n  return fetch(url)\n    .then(res => {\n      if (!res.ok) throw new Error('Network response failed');\n      return res.json();\n    })\n    .catch(error => {\n      console.error('Fetch error:', error);\n      throw error;\n    });\n}"
    });
  }
  
  if (metrics.complexityScore < 80) {
    snippets.push({
      title: "Simplify Complex Logic",
      code: "function process(data) {\n  let result;\n  if (data.type === 'A') {\n    if (data.value > 10) {\n      result = data.value * 2;\n    } else {\n      result = data.value;\n    }\n  } else {\n    result = 0;\n  }\n  return result;\n}",
      suggestion: "function process(data) {\n  // Early return pattern\n  if (data.type !== 'A') return 0;\n  \n  // Simplified conditional logic\n  return data.value > 10 ? data.value * 2 : data.value;\n}"
    });
  }
  
  return snippets;
};

/**
 * Generate a summary based on the overall score
 */
export const generateSummary = (overallScore: number, categories: CategoryScore[]): string => {
  if (overallScore >= 90) {
    return "Excellent code quality with good practices. Minor improvements possible.";
  } else if (overallScore >= 75) {
    return "Good code quality with some areas needing improvement, particularly in " + 
      categories.filter(c => c.score < 75).map(c => c.name.toLowerCase()).join(" and ") + ".";
  } else if (overallScore >= 60) {
    return "Moderate code quality with several areas requiring attention, especially " + 
      categories.filter(c => c.score < 70).map(c => c.name.toLowerCase()).join(" and ") + ".";
  } else {
    return "Code needs significant improvement across multiple dimensions for better maintainability and reliability.";
  }
};

/**
 * Analyze code quality and generate comprehensive results
 */
export const analyzeCodeQuality = (code: string, language: string): QualityResults => {
  // Generate refactored version of the code with best practices
  const refactoredCode = refactorCode(code, language);
  
  // Calculate metrics for the refactored code
  const metrics = calculateCodeMetrics(refactoredCode);
  
  // Calculate category scores based on code characteristics
  const categories = generateCategoryScores(metrics);
  
  // Calculate overall score (weighted average)
  const weights = [0.25, 0.25, 0.2, 0.2, 0.1];
  const overallScore = Math.round(
    categories.reduce((sum, category, index) => sum + (category.score * weights[index]), 0)
  );
  
  // Generate recommendations based on scores
  const recommendations = generateRecommendations(metrics, overallScore);
  
  // Generate code snippets based on the issues found
  const snippets = generateCodeSnippets(metrics, language);
  
  // Summary based on overall score
  const summary = generateSummary(overallScore, categories);
  
  return {
    score: overallScore,
    summary,
    categories,
    recommendations,
    snippets,
    refactoredCode
  };
};
