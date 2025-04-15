/**
 * Code Quality Analysis Utilities
 * 
 * This module provides tools for analyzing code quality across different dimensions,
 * including readability, maintainability, security, and best practices.
 */

import { QualityMetrics, CategoryScore, QualityResults, CodeSnippet } from "@/types/codeQuality";
import { refactorCode } from "./refactors";
import { BookOpen, CircleCheck, CircleAlert, AlertTriangle, ShieldCheck } from "lucide-react";

/**
 * Calculate code metrics based on the code content
 * 
 * @param code The source code to analyze
 * @returns Metrics object with various quality scores
 */
export const calculateCodeMetrics = (code: string): QualityMetrics => {
  // Split code into lines for analysis
  const lines = code.split('\n');
  const nonEmptyLines = lines.filter(line => line.trim().length > 0);
  
  // Calculate average line length (shorter is often better)
  const totalChars = code.length;
  const avgLineLength = totalChars / Math.max(1, nonEmptyLines.length);
  // Be more strict about line length
  const lineLengthScore = Math.min(100, 100 - Math.min(75, Math.max(0, (avgLineLength - 30) / 1.2)));
  
  // Check for comments and documentation
  const commentLines = lines.filter(line => 
    line.trim().startsWith('//') || 
    line.trim().startsWith('#') || 
    line.trim().startsWith('/*') || 
    line.trim().startsWith('*') ||
    line.includes('*/') ||
    line.trim().startsWith('"""') ||
    line.includes('"""') ||
    line.trim().startsWith("'''") ||
    line.includes("'''")
  ).length;
  
  // Make comment ratio more strict - require more comments for a good score
  const commentRatio = Math.min(90, (commentLines / Math.max(1, nonEmptyLines.length)) * 200);
  
  // Check for JSDoc or similar documentation patterns
  const hasDocumentation = (
    (code.includes('/**') && code.includes('*/')) ||
    (code.includes('"""') && code.includes('"""')) ||
    (code.includes("'''") && code.includes("'''"))
  );
  
  const hasFunctionDocumentation = (
    code.includes('@param') || 
    code.includes('@return') || 
    code.includes(':param') || 
    code.includes(':return') ||
    code.includes('Args:') ||
    code.includes('Returns:')
  );
  
  // Provide smaller documentation bonuses
  const documentationScore = hasDocumentation ? 8 : 0;
  const functionDocScore = hasFunctionDocumentation ? 10 : 0;
  
  // More realistic comment score with documentation bonus
  const commentScore = Math.min(95, commentRatio + documentationScore + functionDocScore);
  
  // Analyze complexity based on:
  // 1. Nesting levels (braces, indentation)
  // 2. Function/method length
  // 3. Conditionals and loops
  const bracesCount = (code.match(/{/g) || []).length;
  const indentationRatio = bracesCount / Math.max(1, nonEmptyLines.length);
  
  // Count conditional and loop statements - be more comprehensive
  const conditionalMatches = code.match(/if\s+\(|if\s+[a-zA-Z_]|else|switch|case\s+:|for\s+\(|for\s+[a-zA-Z_]|while\s+\(|while\s+[a-zA-Z_]|foreach|\.map\(|\.filter\(|\.reduce\(/g) || [];
  const conditionalCount = conditionalMatches.length;
  const conditionalRatio = conditionalCount / Math.max(1, nonEmptyLines.length);
  
  // Check for function/method definitions
  const functionMatches = code.match(/function\s+[a-zA-Z_]|def\s+[a-zA-Z_]|class\s+[a-zA-Z_]|interface\s+[a-zA-Z_]|impl\s+|[a-zA-Z_]+\s*\([^)]*\)\s*{/g) || [];
  const functionCount = functionMatches.length;
  
  // Measure function length
  const functionLengths: number[] = [];
  let currentFunctionLines = 0;
  let inFunction = false;
  let openBraces = 0;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (!inFunction && (
      trimmedLine.match(/function\s+[a-zA-Z_]/) || 
      trimmedLine.match(/def\s+[a-zA-Z_]/) ||
      trimmedLine.match(/[a-zA-Z_]+\s*\([^)]*\)\s*{/)
    )) {
      inFunction = true;
      currentFunctionLines = 1;
      openBraces += (trimmedLine.match(/{/g) || []).length;
      openBraces -= (trimmedLine.match(/}/g) || []).length;
      continue;
    }
    
    if (inFunction) {
      currentFunctionLines++;
      openBraces += (trimmedLine.match(/{/g) || []).length;
      openBraces -= (trimmedLine.match(/}/g) || []).length;
      
      if ((openBraces <= 0 && trimmedLine.includes('}')) || 
          (trimmedLine.endsWith(':') && openBraces <= 0)) {
        inFunction = false;
        functionLengths.push(currentFunctionLines);
      }
    }
  }
  
  // Calculate average function length
  const avgFunctionLength = functionLengths.length > 0 
    ? functionLengths.reduce((sum, len) => sum + len, 0) / functionLengths.length 
    : 0;
  
  // Greater penalty for long functions
  const functionLengthPenalty = Math.min(50, Math.max(0, avgFunctionLength - 12) * 2.5);
  
  // More aggressive complexity scoring
  const complexityScore = Math.max(30, 100 - 
    (indentationRatio * 35) - 
    (conditionalRatio * 50) - 
    functionLengthPenalty + 
    (functionCount > 0 ? Math.min(8, functionCount * 0.8) : 0)
  );
  
  // Check for potential security issues (more comprehensive list)
  const securityIssues = [
    'eval(', 'exec(', '.innerHTML', 'document.write(', 
    'sql.query(', 'unvalidated', 'unsanitized', 
    '.dangerouslySetInnerHTML', 'shell_exec', 'system(',
    '__import__', 'subprocess.call', 'os.system',
    'scanf', 'gets(', 'strcpy', 'strcat', 'sprintf',
    'deserialize', 'pickle.loads', 'yaml.load', 'fromYaml',
    'innerHTML =', 'outerHTML =', 'exec(', 'eval(',
    'setTimeout(', 'setInterval(', 'new Function(',
    'document.write', 'document.writeln',
    'localStorage.', 'sessionStorage.', '.createObjectURL',
    'Math.random()', 'window.location', 'location.href',
    'location.hash', 'location.pathname', 'location.search'
  ];
  
  // Count security issues found
  const securityIssueCount = securityIssues.reduce((count, issue) => 
    count + (code.toLowerCase().includes(issue.toLowerCase()) ? 1 : 0), 0);
  
  // Check for password/credential exposure
  const hasCredentials = (
    code.includes('password') ||
    code.includes('passwd') ||
    code.includes('secret') ||
    code.includes('api_key') ||
    code.includes('apikey') ||
    code.includes('api-key') ||
    code.includes('token') ||
    code.includes('auth')
  );
  
  // Reduce score for each security issue found
  const securityScore = Math.max(20, 90 - securityIssueCount * 18 - (hasCredentials ? 25 : 0));
  
  // Check for input validation patterns
  const hasInputValidation = (
    code.includes('validate') || 
    code.includes('sanitize') || 
    code.includes('escape') ||
    code.includes('trim') ||
    code.includes('parseFloat') ||
    code.includes('parseInt') ||
    code.includes('isNaN') ||
    code.includes('typeof') && code.includes('===')
  );
  
  // Smaller bonus for having input validation
  const securityBonus = hasInputValidation ? 8 : 0;
  
  // Improved security score with validation bonus
  const securityFinalScore = Math.min(95, securityScore + securityBonus);
  
  // Check code style consistency
  const mixedQuotes = (
    (code.includes("'") && code.includes('"')) && 
    !(code.includes("\"'") || code.includes('\'"')) // Exclude cases where both are needed
  );
  
  const mixedIndentation = (code.includes('    ') && code.includes('\t'));
  const inconsistentBraces = (
    (code.includes('{\n') && code.includes('{')) ||
    (code.includes('if (') && code.includes('if('))
  );
  
  // Check for trailing whitespace
  const linesWithTrailingSpace = lines.filter(line => line.match(/\s+$/)).length;
  const trailingWhitespacePenalty = Math.min(30, (linesWithTrailingSpace / lines.length) * 100);
  
  // Penalty points for inconsistent style
  const styleIssues = (mixedQuotes ? 20 : 0) + 
                     (mixedIndentation ? 25 : 0) + 
                     (inconsistentBraces ? 20 : 0) +
                     trailingWhitespacePenalty;
  
  const consistencyScore = Math.max(30, 90 - styleIssues);
  
  // Check for best practices
  const bestPracticesIssues = [
    { pattern: /var\s+[a-zA-Z0-9_]+/g, count: 0 }, // Using var instead of let/const
    { pattern: /for\s*\(\s*var\s+\w+\s*=\s*0/g, count: 0 }, // Using traditional for loop vs array methods
    { pattern: /console\.log/g, count: 0 }, // Leftover console.logs
    { pattern: /print\(/g, count: 0 }, // Leftover print statements in Python
    { pattern: /alert\(/g, count: 0 }, // Using alert
    { pattern: /[^\w\s.]\s*=\s*null/g, count: 0 }, // Explicit null assignment
    { pattern: /catch\s*\([^)]*\)\s*{}/g, count: 0 }, // Empty catch blocks
    { pattern: /if\s*\([^)]+\)\s*{\s*}\s*else/g, count: 0 }, // Empty if blocks
    { pattern: /TODO|FIXME/g, count: 0 }, // TODOs and FIXMEs
    { pattern: /\t/g, count: 0 } // Tabs (in some style guides)
  ];
  
  bestPracticesIssues.forEach(issue => {
    issue.count = (code.match(issue.pattern) || []).length;
  });
  
  // More aggressive penalty for best practices issues
  const bestPracticesScore = Math.max(25, 90 - bestPracticesIssues.reduce(
    (total, issue) => total + issue.count * 10, 0
  ));
  
  return {
    lineLength: lineLengthScore,
    commentRatio: commentScore,
    complexityScore,
    securityScore: securityFinalScore,
    consistencyScore,
    bestPracticesScore: bestPracticesScore
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
      icon: CircleCheck 
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
  
  if (metrics.commentRatio < 75) {
    recommendations.push(
      "Add comprehensive documentation with JSDoc, docstrings, or function-level comments to improve code understanding"
    );
  }
  
  if (metrics.lineLength < 75) {
    recommendations.push(
      "Break long lines of code (>80 characters) into more readable, shorter segments for better readability"
    );
  }
  
  if (metrics.complexityScore < 80) {
    recommendations.push(
      "Refactor complex functions into smaller, single-responsibility functions with clear purposes"
    );
  }
  
  if (metrics.securityScore < 85) {
    recommendations.push(
      "Implement input validation, parameterized queries, and avoid unsafe functions that can lead to security vulnerabilities"
    );
  }
  
  if (metrics.consistencyScore < 85) {
    recommendations.push(
      "Standardize code style by using consistent quotes, indentation, naming conventions, and bracket placement"
    );
  }
  
  if (metrics.bestPracticesScore < 85) {
    recommendations.push(
      "Follow language-specific best practices such as using modern syntax, avoiding deprecated methods, and utilizing built-in functions"
    );
  }
  
  // Advanced recommendations for high-scoring code to reach excellence
  if (overallScore >= 80 && overallScore < 95) {
    recommendations.push(
      "Enhance error handling with specific error types, meaningful error messages, and graceful fallbacks"
    );
    
    recommendations.push(
      "Extract magic numbers and string literals into named constants for better code maintainability"
    );
    
    if (metrics.complexityScore >= 80) {
      recommendations.push(
        "Consider implementing design patterns appropriate for your application domain to improve architecture"
      );
    }
  }
  
  return recommendations;
};

/**
 * Generate sample code snippets for improvement
 */
export const generateCodeSnippets = (metrics: QualityMetrics, language: string): CodeSnippet[] => {
  const snippets: CodeSnippet[] = [];
  
  // Language-specific snippet examples
  if (['js', 'jsx', 'ts', 'tsx'].includes(language)) {
    if (metrics.securityScore < 85) {
      snippets.push({
        title: "Improve Security with Input Validation",
        code: "function processUserData(userData) {\n  const query = `SELECT * FROM users WHERE id = ${userData.id}`;\n  return database.execute(query);\n}",
        suggestion: "function processUserData(userData) {\n  // Validate input\n  if (!userData?.id || typeof userData.id !== 'number') {\n    throw new Error('Invalid user ID');\n  }\n  \n  // Use parameterized query\n  const query = 'SELECT * FROM users WHERE id = ?';\n  return database.execute(query, [userData.id]);\n}"
      });
    }
    
    if (metrics.bestPracticesScore < 85) {
      snippets.push({
        title: "Use Modern JavaScript Features",
        code: "function getUsers(callback) {\n  var results = [];\n  for (var i = 0; i < users.length; i++) {\n    var user = users[i];\n    if (user.active) {\n      results.push({\n        name: user.name,\n        email: user.email\n      });\n    }\n  }\n  callback(null, results);\n}",
        suggestion: "async function getUsers() {\n  // Use array methods instead of for loops\n  const activeUsers = users\n    .filter(user => user.active)\n    .map(({ name, email }) => ({ name, email }));\n    \n  return activeUsers;\n}"
      });
    }
  } else if (['py', 'python'].includes(language)) {
    if (metrics.complexityScore < 80) {
      snippets.push({
        title: "Simplify Complex Logic with Pythonic Patterns",
        code: "def process_data(items):\n    result = []\n    for item in items:\n        if item is not None:\n            if item.status == 'active':\n                if item.value > 100:\n                    transformed = item.value * 2\n                    result.append({\n                        'id': item.id,\n                        'value': transformed\n                    })\n    return result",
        suggestion: "def process_data(items):\n    \"\"\"Process active items with values over 100.\n    \n    Args:\n        items: Collection of data items\n        \n    Returns:\n        List of processed items with doubled values\n    \"\"\"\n    return [\n        {'id': item.id, 'value': item.value * 2}\n        for item in items\n        if item and item.status == 'active' and item.value > 100\n    ]"
      });
    }
    
    if (metrics.bestPracticesScore < 85) {
      snippets.push({
        title: "Improve Python Error Handling",
        code: "def read_config(filename):\n    f = open(filename, 'r')\n    data = f.read()\n    config = json.loads(data)\n    f.close()\n    return config",
        suggestion: "def read_config(filename):\n    \"\"\"Read and parse a JSON configuration file.\n    \n    Args:\n        filename: Path to the configuration file\n        \n    Returns:\n        Dict containing the configuration\n        \n    Raises:\n        FileNotFoundError: If the file doesn't exist\n        JSONDecodeError: If the file contains invalid JSON\n    \"\"\"\n    try:\n        with open(filename, 'r') as f:\n            return json.load(f)\n    except json.JSONDecodeError as e:\n        logging.error(f\"Invalid JSON in config file: {e}\")\n        raise"
      });
    }
  } else if (['java'].includes(language)) {
    if (metrics.bestPracticesScore < 85) {
      snippets.push({
        title: "Modernize Java Code",
        code: "List<User> getActiveUsers(List<User> users) {\n    List<User> result = new ArrayList<>();\n    for (User user : users) {\n        if (user.isActive()) {\n            result.add(user);\n        }\n    }\n    return result;\n}",
        suggestion: "List<User> getActiveUsers(List<User> users) {\n    // Use Java streams for cleaner collection operations\n    return users.stream()\n        .filter(User::isActive)\n        .collect(Collectors.toList());\n}"
      });
    }
  } else if (['cpp', 'c', 'h'].includes(language)) {
    if (metrics.securityScore < 85) {
      snippets.push({
        title: "Improve C++ Memory Safety",
        code: "void processData() {\n    char* buffer = new char[100];\n    strcpy(buffer, userInput.c_str()); // Unsafe\n    // Process data\n    delete[] buffer;\n}",
        suggestion: "void processData() {\n    // Use smart pointers and safer string handling\n    std::string buffer = userInput;\n    \n    // Validate input length to prevent buffer overflow\n    if (buffer.length() > 100) {\n        throw std::runtime_error(\"Input too long\");\n    }\n    \n    // Process data (smart pointer automatically freed)\n}"
      });
    }
  }
  
  // Generic snippets for any language
  if (metrics.commentRatio < 75) {
    snippets.push({
      title: "Add Comprehensive Documentation",
      code: "function calculateTotal(items) {\n  let sum = 0;\n  for (const item of items) {\n    sum += item.price * item.quantity;\n  }\n  return sum;\n}",
      suggestion: "/**\n * Calculate the total price for a collection of items\n *\n * @param {Array<{price: number, quantity: number}>} items - The items to calculate\n * @returns {number} The total price\n */\nfunction calculateTotal(items) {\n  // Initialize sum accumulator\n  let sum = 0;\n  \n  // Add the price*quantity for each item\n  for (const item of items) {\n    sum += item.price * item.quantity;\n  }\n  \n  return sum;\n}"
    });
  }
  
  return snippets;
};

/**
 * Generate a summary based on the overall score
 */
export const generateSummary = (overallScore: number, categories: CategoryScore[]): string => {
  const lowestCategories = categories
    .sort((a, b) => a.score - b.score)
    .slice(0, 2)
    .filter(c => c.score < 85);
  
  if (overallScore >= 90) {
    return "Excellent code quality that follows best practices. Minor improvements still possible for perfection.";
  } else if (overallScore >= 80) {
    const areasToImprove = lowestCategories.length > 0 
      ? `, particularly in ${lowestCategories.map(c => c.name.toLowerCase()).join(" and ")}`
      : '';
    return `Good code quality with some areas needing refinement${areasToImprove}.`;
  } else if (overallScore >= 70) {
    return `Moderate code quality with several improvement opportunities, especially in ${lowestCategories.map(c => c.name.toLowerCase()).join(" and ")}.`;
  } else {
    return "Code needs significant improvement across multiple dimensions for better maintainability and reliability.";
  }
};

/**
 * Analyze code quality and generate comprehensive results
 */
export const analyzeCodeQuality = (code: string, language: string): QualityResults => {
  // Calculate metrics directly from the original code
  const metrics = calculateCodeMetrics(code);
  
  // Get refactored version for display purposes
  const refactoredCode = refactorCode(code, language);
  
  // Calculate category scores based on code characteristics
  const categories = generateCategoryScores(metrics);
  
  // Calculate overall score (weighted average with modified weights)
  const weights = [0.20, 0.25, 0.15, 0.25, 0.15]; // Readability, Maintainability, Performance, Security, Code Smell
  
  // Make sure the weights always sum to 1
  const weightSum = weights.reduce((sum, weight) => sum + weight, 0);
  const normalizedWeights = weights.map(w => w / weightSum);
  
  // Calculate initial weighted score
  const rawScore = categories.reduce((sum, category, index) => sum + (category.score * normalizedWeights[index]), 0);
  
  // Apply a realistic scaling factor
  const scaledScore = Math.min(
    95,  // Cap the maximum score at 95 (nearly impossible to get perfect)
    Math.max(
      20,  // Minimum score is 20 (even terrible code has some merit)
      Math.round(rawScore * 0.70 + 12)  // Scale down scores to be more realistic
    )
  );
  
  // Generate recommendations based on scores
  const recommendations = generateRecommendations(metrics, scaledScore);
  
  // Generate code snippets based on the issues found
  const snippets = generateCodeSnippets(metrics, language);
  
  // Summary based on overall score
  const summary = generateSummary(scaledScore, categories);
  
  return {
    score: scaledScore,
    summary,
    categories,
    recommendations,
    snippets,
    refactoredCode
  };
};
