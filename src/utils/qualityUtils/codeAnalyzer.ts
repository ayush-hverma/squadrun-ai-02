
import { QualityResults, CategoryScore, CodeSnippet } from "@/types/codeQuality";
import { 
  BookOpen, 
  FileCode, 
  Zap, 
  Shield, 
  AlertTriangle 
} from "lucide-react";

const calculateReadabilityScore = (code: string): number => {
  // Analyze code for readability
  let score = 80; // Base score
  
  // Check for code complexity indicators
  const longLines = code.split('\n').filter(line => line.length > 100).length;
  const longFunctions = (code.match(/function\s+\w+\s*\([^)]*\)\s*{[^}]*}/g) || []).filter(fn => fn.length > 200).length;
  const deepNesting = (code.match(/\{\s*\{\s*\{\s*\{/g) || []).length;
  
  // Each of these issues reduces the score
  score -= longLines * 2; // -2 points per long line
  score -= longFunctions * 5; // -5 points per long function
  score -= deepNesting * 8; // -8 points per deeply nested code block
  
  // Check for readability improvements
  const hasComments = (code.match(/\/\/|\/\*|\*\/|#/g) || []).length > 0;
  const usesDescriptiveNames = (code.match(/[a-zA-Z][a-zA-Z0-9]+[A-Z][a-zA-Z0-9]*/g) || []).length > 0;
  
  // These improve the score
  if (hasComments) score += 10;
  if (usesDescriptiveNames) score += 10;
  
  // Ensure score is within range
  return Math.max(0, Math.min(100, score));
};

const calculateMaintainabilityScore = (code: string): number => {
  // Analyze code for maintainability
  let score = 75; // Base score
  
  // Check for code maintainability indicators
  const duplicatedCodePatterns = (code.match(/(.{50,})\1+/g) || []).length;
  const longFunctions = (code.match(/function\s+\w+\s*\([^)]*\)\s*{[^}]*}/g) || []).filter(fn => fn.length > 250).length;
  const missingComments = code.length > 500 && (code.match(/\/\/|\/\*|\*\/|#/g) || []).length < 5;
  
  // Each of these issues reduces the score
  score -= duplicatedCodePatterns * 10; // -10 points per duplicated code
  score -= longFunctions * 5; // -5 points per long function
  if (missingComments) score -= 15;
  
  // Check for maintainability improvements
  const hasStructuredCode = (code.match(/class|module|namespace|export/g) || []).length > 0;
  const hasFunctionDocumentation = (code.match(/\/\*\*[\s\S]*?\*\/\s*function/g) || []).length > 0;
  
  // These improve the score
  if (hasStructuredCode) score += 10;
  if (hasFunctionDocumentation) score += 15;
  
  // Ensure score is within range
  return Math.max(0, Math.min(100, score));
};

const calculatePerformanceScore = (code: string): number => {
  // Analyze code for performance
  let score = 85; // Base score
  
  // Check for performance issues
  const nestedLoops = (code.match(/for\s*\([^)]*\)\s*\{[^}]*for\s*\([^)]*\)/g) || []).length;
  const largeArrayOperations = (code.match(/\.map\(|\.filter\(|\.reduce\(/g) || []).length > 10;
  const inefficientQueries = (code.match(/SELECT\s+\*\s+FROM|db\.find\({}\)/gi) || []).length;
  
  // Each of these issues reduces the score
  score -= nestedLoops * 8; // -8 points per nested loop
  if (largeArrayOperations) score -= 10;
  score -= inefficientQueries * 12; // -12 points per inefficient query
  
  // Check for performance optimizations
  const usesMemoization = (code.match(/useMemo|memo|cache|memoize/g) || []).length > 0;
  const usesAsyncAwait = (code.match(/async|await/g) || []).length > 0;
  
  // These improve the score
  if (usesMemoization) score += 10;
  if (usesAsyncAwait) score += 5;
  
  // Ensure score is within range
  return Math.max(0, Math.min(100, score));
};

const calculateSecurityScore = (code: string): number => {
  // Analyze code for security issues
  let score = 90; // Base score
  
  // Check for security issues
  const unsafeEval = (code.match(/eval\s*\(/g) || []).length;
  const unsafeInnerHTML = (code.match(/innerHTML|dangerouslySetInnerHTML/g) || []).length;
  const sqlInjectionVulnerabilities = (code.match(/executeQuery\s*\(\s*["'`]SELECT.+\$|db\.query\s*\(\s*["'`]SELECT/g) || []).length;
  
  // Each of these issues reduces the score
  score -= unsafeEval * 25; // -25 points per eval use
  score -= unsafeInnerHTML * 15; // -15 points per unsafe inner HTML
  score -= sqlInjectionVulnerabilities * 30; // -30 points per SQL injection vulnerability
  
  // Check for security improvements
  const inputValidation = (code.match(/validate|sanitize|escape/g) || []).length > 0;
  const usesTryCatch = (code.match(/try\s*\{[\s\S]*\}\s*catch/g) || []).length > 0;
  
  // These improve the score
  if (inputValidation) score += 10;
  if (usesTryCatch) score += 5;
  
  // Ensure score is within range
  return Math.max(0, Math.min(100, score));
};

const calculateCodeSmellScore = (code: string): number => {
  // Analyze code for "code smells"
  let score = 85; // Base score
  
  // Check for code smell indicators
  const magicNumbers = (code.match(/\W\d{2,}\W/g) || []).length;
  const longMethods = (code.match(/function\s+\w+\s*\([^)]*\)\s*{[\s\S]{500,}?}/g) || []).length;
  const globalVariables = (code.match(/var\s+\w+\s*=|let\s+\w+\s*=|const\s+\w+\s*=(?!\s*function)/g) || []).length;
  
  // Each of these issues reduces the score
  score -= magicNumbers * 3; // -3 points per magic number
  score -= longMethods * 10; // -10 points per long method
  score -= Math.max(0, globalVariables - 5) * 2; // -2 points per global variable beyond 5
  
  // Check for code smell improvements
  const usesConstants = (code.match(/const\s+[A-Z_][A-Z0-9_]*\s*=/g) || []).length > 0;
  const usesFunctions = (code.match(/function\s+\w+|const\s+\w+\s*=\s*\([^)]*\)\s*=>/g) || []).length > 2;
  
  // These improve the score
  if (usesConstants) score += 10;
  if (usesFunctions) score += 5;
  
  // Ensure score is within range
  return Math.max(0, Math.min(100, score));
};

/**
 * Analyze code quality using various metrics
 */
export const analyzeCodeQuality = (code: string, language: string): QualityResults => {
  // Calculate individual scores
  const readabilityScore = calculateReadabilityScore(code);
  const maintainabilityScore = calculateMaintainabilityScore(code);
  const performanceScore = calculatePerformanceScore(code);
  const securityScore = calculateSecurityScore(code);
  const codeSmellScore = calculateCodeSmellScore(code);
  
  // Calculate overall score (weighted average)
  const overallScore = Math.round(
    (readabilityScore * 0.25) +
    (maintainabilityScore * 0.25) +
    (performanceScore * 0.2) +
    (securityScore * 0.2) +
    (codeSmellScore * 0.1)
  );
  
  // Generate results with categories
  const categories: CategoryScore[] = [
    {
      name: "Readability",
      score: readabilityScore,
      icon: BookOpen
    },
    {
      name: "Maintainability",
      score: maintainabilityScore,
      icon: FileCode
    },
    {
      name: "Performance",
      score: performanceScore,
      icon: Zap
    },
    {
      name: "Security",
      score: securityScore,
      icon: Shield
    },
    {
      name: "Code Smell",
      score: codeSmellScore,
      icon: AlertTriangle
    }
  ];
  
  // Generate code snippets with issues
  const snippets: CodeSnippet[] = [];
  
  // Look for long lines
  code.split('\n').forEach((line, index) => {
    if (line.length > 100) {
      snippets.push({
        description: "Line too long (exceeds 100 characters)",
        code: line,
        line: index + 1
      });
    }
  });
  
  // Look for complex nested code
  const nestedMatches = code.match(/(?:if|for|while)[\s\S]*?(?:if|for|while)[\s\S]*?(?:if|for|while)/g) || [];
  nestedMatches.slice(0, 2).forEach(match => {
    const contextLines = match.split('\n').slice(0, 3).join('\n');
    const lineNumber = code.split('\n').findIndex(line => line.includes(contextLines.split('\n')[0])) + 1;
    
    snippets.push({
      description: "Deeply nested code structures",
      code: contextLines + '...',
      line: lineNumber
    });
  });
  
  // Look for magic numbers
  const magicNumberMatches = code.match(/\W\d{3,}\W/g) || [];
  magicNumberMatches.slice(0, 3).forEach(match => {
    const context = code.substring(
      Math.max(0, code.indexOf(match) - 20),
      Math.min(code.length, code.indexOf(match) + match.length + 20)
    );
    const lineNumber = code.substring(0, code.indexOf(match)).split('\n').length;
    
    snippets.push({
      description: "Magic number should be a named constant",
      code: context,
      line: lineNumber
    });
  });
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  if (readabilityScore < 70) {
    recommendations.push("Improve code readability by adding comments and using descriptive variable names");
    recommendations.push("Break down complex functions into smaller, more focused ones");
  }
  
  if (maintainabilityScore < 70) {
    recommendations.push("Modularize code into smaller, reusable components");
    recommendations.push("Add documentation to functions explaining their purpose and parameters");
  }
  
  if (performanceScore < 70) {
    recommendations.push("Avoid nested loops and optimize repeated operations");
    recommendations.push("Consider memoization for expensive calculations");
  }
  
  if (securityScore < 80) {
    recommendations.push("Avoid using eval() and innerHTML for security reasons");
    recommendations.push("Implement proper input validation for all user inputs");
  }
  
  if (codeSmellScore < 70) {
    recommendations.push("Replace magic numbers with named constants");
    recommendations.push("Refactor long methods into smaller, focused functions");
  }
  
  // Generate a simple refactored code example
  let refactoredCode = code;
  
  // Replace magic numbers with constants
  const magicNumbers = Array.from(new Set(code.match(/\W\d{3,}\W/g) || []));
  magicNumbers.forEach((num, index) => {
    const cleanNum = num.replace(/\W/g, '');
    const constantName = `CONSTANT_${cleanNum}`;
    
    // Only replace first occurrence to avoid over-refactoring
    refactoredCode = refactoredCode.replace(
      new RegExp(`\\W${cleanNum}\\W`), 
      (match) => match.replace(cleanNum, constantName)
    );
    
    // Add constant definition at the beginning
    if (index === 0) {
      const constantType = language === 'ts' || language === 'tsx' ? 'const' : 'const';
      refactoredCode = `${constantType} ${constantName} = ${cleanNum};\n\n${refactoredCode}`;
    }
  });
  
  // Add a summary based on the overall score
  let summary = "";
  if (overallScore >= 90) {
    summary = "Excellent code quality. Well-structured and maintainable.";
  } else if (overallScore >= 75) {
    summary = "Good code quality with some room for improvement.";
  } else if (overallScore >= 60) {
    summary = "Moderate code quality. Several areas need attention.";
  } else {
    summary = "Poor code quality. Significant refactoring recommended.";
  }
  
  return {
    score: overallScore,
    summary,
    categories,
    recommendations,
    snippets,
    refactoredCode
  };
};
