
/**
 * Code Quality Analysis Utilities
 * 
 * This module provides tools for analyzing code quality across different dimensions,
 * including readability, maintainability, security, and best practices.
 */

import { QualityMetrics, CategoryScore, QualityResults, CodeSnippet } from "@/types/codeQuality";
import { refactorCode } from "./refactors";
import { BookOpen, CircleCheck, ShieldCheck, AlertTriangle, Zap } from "lucide-react";

/**
 * Calculate code metrics based on the code content
 * 
 * @param code The source code to analyze
 * @returns Metrics object with various quality scores
 */
export const calculateCodeMetrics = (code: string): QualityMetrics => {
  // Early return for small files (less than 10 lines)
  if (code.split('\n').length < 10) {
    return {
      lineLength: 90,
      commentRatio: 70,
      complexityScore: 85,
      securityScore: 80,
      consistencyScore: 85,
      bestPracticesScore: 80
    };
  }
  
  // Split code into lines for analysis - do once and reuse
  const lines = code.split('\n');
  const nonEmptyLines = lines.filter(line => line.trim().length > 0);
  const totalLines = nonEmptyLines.length || 1;
  
  // Calculate average line length (shorter is often better)
  const totalChars = code.length;
  const avgLineLength = totalChars / totalLines;
  const lineLengthScore = 100 - Math.max(0, (avgLineLength - 30) / 1.2);
  
  // Fast check for comments
  const commentRegex = /\/\/|\/\*|\*\/|#|"""|'''/;
  const commentLines = lines.filter(line => commentRegex.test(line.trim())).length;
  const commentRatio = (commentLines / totalLines) * 200;
  
  // Quick check for documentation
  const hasDocumentation = code.includes('/**') || code.includes('"""') || code.includes("'''");
  const hasFunctionDocumentation = code.includes('@param') || code.includes('@return') || 
                                  code.includes(':param') || code.includes('Returns:');
  
  const documentationScore = hasDocumentation ? 8 : 0;
  const functionDocScore = hasFunctionDocumentation ? 10 : 0;
  const commentScore = commentRatio + documentationScore + functionDocScore;
  
  // Simplified complexity analysis
  const bracesCount = (code.match(/{/g) || []).length;
  const conditionalMatches = (code.match(/if|else|switch|for|while|foreach|\.map\(|\.filter\(/g) || []).length;
  const conditionalRatio = conditionalMatches / totalLines;
  
  // Check for function definitions - simplified pattern
  const functionMatches = (code.match(/function|def\s+|class\s+|\)\s*{|\)\s*=>/g) || []).length;
  
  // Simplified complexity scoring
  const complexityScore = 100 - 
    (bracesCount / totalLines * 20) - 
    (conditionalRatio * 50) + 
    (functionMatches > 0 ? Math.min(8, functionMatches * 0.8) : 0);
  
  // Fast security check - look for known patterns
  const securityKeywords = ['eval(', 'innerHTML', 'dangerouslySetInnerHTML', 'password', 'token'];
  const securityIssueCount = securityKeywords.reduce((count, keyword) => 
    count + (code.toLowerCase().includes(keyword.toLowerCase()) ? 1 : 0), 0);
  
  const securityScore = 90 - securityIssueCount * 15;
  
  // Quick check for input validation
  const hasInputValidation = code.includes('validate') || code.includes('sanitize') || 
                             code.includes('isNaN') || code.includes('typeof');
  const securityFinalScore = securityScore + (hasInputValidation ? 8 : 0);
  
  // Fast style consistency check
  const mixedQuotes = (code.includes("'") && code.includes('"'));
  const mixedIndentation = (code.includes('    ') && code.includes('\t'));
  const styleIssues = (mixedQuotes ? 20 : 0) + (mixedIndentation ? 25 : 0);
  const consistencyScore = 90 - styleIssues;
  
  // Fast best practices check
  const bestPracticesPatterns = [
    /var\s+/g,
    /console\.log/g,
    /alert\(/g,
    /TODO|FIXME/g
  ];
  
  const bestPracticesIssues = bestPracticesPatterns.reduce((total, pattern) => 
    total + (code.match(pattern) || []).length, 0);
  
  const bestPracticesScore = 90 - bestPracticesIssues * 10;
  
  return {
    lineLength: lineLengthScore,
    commentRatio: commentScore,
    complexityScore,
    securityScore: securityFinalScore,
    consistencyScore,
    bestPracticesScore
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
      score: Math.round((metrics.commentRatio + metrics.complexityScore + metrics.bestPracticesScore) / 3),
      icon: CircleCheck
    },
    { 
      name: "Performance", 
      score: Math.round((metrics.complexityScore + metrics.bestPracticesScore) / 2),
      icon: Zap
    },
    { 
      name: "Security", 
      score: Math.round(metrics.securityScore),
      icon: ShieldCheck
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
  
  // Only add recommendations for scores below thresholds
  if (metrics.commentRatio < 75) {
    recommendations.push(
      "Add comprehensive documentation with JSDoc, docstrings, or function-level comments"
    );
  }
  
  if (metrics.lineLength < 75) {
    recommendations.push(
      "Break long lines of code (>80 characters) into more readable, shorter segments"
    );
  }
  
  if (metrics.complexityScore < 80) {
    recommendations.push(
      "Refactor complex functions into smaller, single-responsibility functions"
    );
  }
  
  if (metrics.securityScore < 85) {
    recommendations.push(
      "Implement input validation and avoid unsafe functions that can lead to security vulnerabilities"
    );
  }
  
  if (metrics.consistencyScore < 85) {
    recommendations.push(
      "Standardize code style by using consistent quotes, indentation, and naming conventions"
    );
  }
  
  if (metrics.bestPracticesScore < 85) {
    recommendations.push(
      "Follow language-specific best practices and avoid deprecated methods"
    );
  }
  
  // Limit to the top 3 recommendations for faster display
  return recommendations.slice(0, 3);
};

/**
 * Generate sample code snippets for improvement - simplified for performance
 */
export const generateCodeSnippets = (metrics: QualityMetrics, language: string): CodeSnippet[] => {
  // Return smaller set of snippets for performance
  const snippets: CodeSnippet[] = [];
  
  // Only generate snippets for the most critical issue
  const lowestScore = Math.min(
    metrics.commentRatio, 
    metrics.complexityScore, 
    metrics.securityScore, 
    metrics.bestPracticesScore
  );
  
  if (snippets.length > 0 || lowestScore > 60) {
    return snippets.slice(0, 1); // Just return 1 snippet for performance
  }
  
  // Generic code improvement example
  if (metrics.commentRatio < 60) {
    snippets.push({
      title: "Add Documentation",
      code: "function calculateTotal(items) {\n  let sum = 0;\n  for (const item of items) {\n    sum += item.price * item.quantity;\n  }\n  return sum;\n}",
      suggestion: "/**\n * Calculate the total price\n * @param {Array} items - Items with price and quantity\n * @returns {number} Total\n */\nfunction calculateTotal(items) {\n  let sum = 0;\n  for (const item of items) {\n    sum += item.price * item.quantity;\n  }\n  return sum;\n}"
    });
  }
  
  return snippets;
};

/**
 * Generate a summary based on the overall score
 */
export const generateSummary = (overallScore: number, categories: CategoryScore[]): string => {
  if (overallScore >= 90) {
    return "Excellent code quality that follows best practices.";
  } else if (overallScore >= 80) {
    return "Good code quality with some areas needing refinement.";
  } else if (overallScore >= 70) {
    return "Moderate code quality with several improvement opportunities.";
  } else if (overallScore >= 50) {
    return "Code needs significant improvement for better maintainability.";
  } else {
    return "Poor code quality with critical issues that should be addressed.";
  }
};

/**
 * Analyze code quality and generate comprehensive results - optimized for speed
 */
export const analyzeCodeQuality = (code: string, language: string): QualityResults => {
  // Early return for empty code
  if (!code || code.trim().length === 0) {
    return {
      score: 0,
      summary: "No code to analyze.",
      categories: [],
      recommendations: ["Please provide code to analyze."],
      snippets: [],
      refactoredCode: ""
    };
  }
  
  // Calculate metrics directly from the original code
  const metrics = calculateCodeMetrics(code);
  
  // Get refactored version only for smaller files (<500 lines)
  const refactoredCode = code.split('\n').length < 500 ? refactorCode(code, language) : code;
  
  // Calculate category scores based on code characteristics
  const categories = generateCategoryScores(metrics);
  
  // Calculate overall score - simplified weighted average
  const weights = [0.20, 0.25, 0.15, 0.25, 0.15]; // Readability, Maintainability, Performance, Security, Code Smell
  const weightSum = weights.reduce((sum, weight) => sum + weight, 0);
  const normalizedWeights = weights.map(w => w / weightSum);
  
  // Calculate weighted score
  const overallScore = Math.round(categories.reduce(
    (sum, category, index) => sum + (category.score * normalizedWeights[index]), 
    0
  ));
  
  // Generate recommendations based on scores
  const recommendations = generateRecommendations(metrics, overallScore);
  
  // Generate code snippets - using a smaller set for performance
  const snippets = code.split('\n').length < 300 ? generateCodeSnippets(metrics, language) : [];
  
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
