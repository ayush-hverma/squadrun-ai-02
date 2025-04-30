
import { QualityResults } from "@/types/codeQuality";
import { callGeminiApi } from "./geminiApi";
import { analyzeCodeQuality } from "../qualityUtils/codeAnalyzer";

// Comprehensive prompt for code refactoring
const REFACTORING_SYSTEM_PROMPT = `
You are an expert code refactoring assistant. Analyze the given code and refactor it following these principles:
1. Improve readability through better variable names, consistent formatting, and clear comments
2. Enhance maintainability by applying DRY principles, single responsibility principle, and modularization
3. Optimize performance by identifying and fixing inefficient algorithms or operations
4. Address security vulnerabilities and follow best practices
5. Correct potential bugs and edge cases
6. Ensure TypeScript type safety and proper error handling
7. Follow modern coding conventions for the given language
8. Preserve the original functionality exactly

Return only the refactored code with no explanations or markdown.
`;

// AI-powered code refactoring
export const refactorCodeWithAI = async (
  code: string,
  language: string
): Promise<string> => {
  try {
    const prompt = `
Language: ${language}

Original code:
\`\`\`${language}
${code}
\`\`\`

Please refactor this code to improve its quality, readability, and maintainability while preserving its exact functionality.
`;

    const refactoredCode = await callGeminiApi(prompt, REFACTORING_SYSTEM_PROMPT, {
      temperature: 0.2,
      maxOutputTokens: 65000
    });

    return refactoredCode;
  } catch (error) {
    console.error("Error in refactorCodeWithAI:", error);
    throw new Error("Failed to refactor code: " + (error instanceof Error ? error.message : String(error)));
  }
};

// AI-powered code quality analysis
export const analyzeCodeQualityWithAI = async (
  code: string, 
  language: string
): Promise<QualityResults> => {
  // Use the actual analyzer implementation
  return analyzeCodeQuality(code, language);
};

// AI-powered repository batch analysis
export const analyzeRepositoryWithAI = async (
  files: Array<{path: string, content: string}>,
  repoUrl?: string
): Promise<QualityResults> => {
  if (files.length === 0) {
    throw new Error("No files provided for repository analysis");
  }

  try {
    // Create a comprehensive prompt for repository analysis
    const REPO_ANALYSIS_SYSTEM_PROMPT = `
You are a senior software architect with expertise in code quality assessment, static analysis, and software metrics.

OBJECTIVE: Provide a comprehensive, quantitative, and actionable analysis of the given repository's code quality.

ASSESSMENT CRITERIA:
1. Readability (0-100): Evaluate naming conventions, formatting, comments, and documentation
   - Look for self-documenting code, consistent naming patterns, and appropriate comments
   - Check for excessive complexity, deeply nested logic, and overly long functions/files
   - Assess code formatting consistency and adherence to language conventions

2. Maintainability (0-100): Assess modular design, coupling, cohesion, and technical debt
   - Measure function/class sizes and complexity metrics (cyclomatic complexity)
   - Check for proper separation of concerns and single responsibility principle
   - Identify tight coupling between components and modules
   - Look for code duplication and violations of DRY principle
   - Evaluate test coverage and the presence of proper error handling

3. Performance (0-100): Analyze algorithmic efficiency, resource usage, and optimization
   - Identify inefficient algorithms, unnecessary loops, or redundant calculations
   - Check for proper caching strategies and memory management
   - Assess database query patterns and data structure selection
   - Look for unnecessary re-renders in UI code or expensive computations

4. Security (0-100): Detect vulnerabilities, unsafe practices, and missing safeguards
   - Check for input validation and proper sanitization
   - Identify potential injection vulnerabilities (SQL, XSS, etc.)
   - Look for hardcoded credentials or sensitive information
   - Assess authentication and authorization mechanisms
   - Check for proper error handling that doesn't leak sensitive information

5. Code Smell (0-100): Identify patterns that indicate deeper problems
   - Look for long parameter lists, god objects/classes, and feature envy
   - Detect dead code, commented-out code, and magic numbers/strings
   - Check for improper abstraction levels and primitive obsession
   - Identify inconsistent error handling and return types

OUTPUT REQUIREMENTS:
1. Provide a precise overall code quality score from 0-100
2. Provide precise individual scores for each category from 0-100
3. List the top 10 most critical issues found, with specific file references where possible
4. Provide 5-10 actionable recommendations for improvement
5. Include a concise summary (3-5 sentences) of the repository's overall code quality

Be exhaustive in your analysis but prioritize the most impactful issues and recommendations.
`;

    // Prepare a summary of all files for the AI
    const filesSummary = files.map(file => {
      // Limit the content length to avoid token limits
      const truncatedContent = file.content.length > 1000 
        ? file.content.substring(0, 1000) + "... [truncated]" 
        : file.content;
      
      return `
File: ${file.path}
\`\`\`
${truncatedContent}
\`\`\`
`;
    }).join("\n\n");

    // Select a subset of full files for detailed analysis
    const detailedAnalysisFiles = files
      .filter(file => {
        // Focus on significant code files, skip configs, etc.
        const isCodeFile = /\.(js|ts|jsx|tsx|py|java|cpp|c|go|rb|php)$/i.test(file.path);
        const isNotTestFile = !file.path.includes("test") && !file.path.includes("spec");
        const isNotNodeModule = !file.path.includes("node_modules");
        return isCodeFile && isNotTestFile && isNotNodeModule;
      })
      .slice(0, 10) // Limit to 10 files for detailed analysis
      .map(file => file.content)
      .join("\n\n// Next File\n\n");

    const prompt = `
Repository${repoUrl ? ` (${repoUrl})` : ''} analysis:

Repository structure (${files.length} files):
${files.map(f => `- ${f.path}`).join('\n')}

${detailedAnalysisFiles ? `Selected files for detailed analysis:\n${detailedAnalysisFiles}` : ''}

Analyze this repository and provide:
1. Overall code quality score (0-100)
2. Individual scores for readability, maintainability, performance, security, and code smell (0-100 each)
3. Major issues found (up to 10)
4. Recommendations for improvement (up to 10)
5. A brief summary of the repository's code quality
`;

    // Call Gemini API with the repository analysis prompt
    const analysisResponse = await callGeminiApi(prompt, REPO_ANALYSIS_SYSTEM_PROMPT, {
      temperature: 0.1,
      maxOutputTokens: 10000
    });
    
    // Parse the response to extract scores and insights
    const scoreMatches = {
      overall: analysisResponse.match(/overall.*?score.*?(\d+)/i),
      readability: analysisResponse.match(/readability.*?score.*?(\d+)/i),
      maintainability: analysisResponse.match(/maintainability.*?score.*?(\d+)/i),
      performance: analysisResponse.match(/performance.*?score.*?(\d+)/i),
      security: analysisResponse.match(/security.*?score.*?(\d+)/i),
      codeSmell: analysisResponse.match(/code smell.*?score.*?(\d+)/i)
    };

    // Extract issues and recommendations
    const issuesSection = analysisResponse.match(/issues:([\s\S]*?)(?=recommendations:|$)/i);
    const recommendationsSection = analysisResponse.match(/recommendations:([\s\S]*?)(?=summary:|$)/i);
    const summarySection = analysisResponse.match(/summary:([\s\S]*?)$/i);

    // Extract list items using regex
    const extractItems = (text?: string): string[] => {
      if (!text) return [];
      const items = text.match(/(?:\d+\.\s*|[-•*]\s*)([^\n]+)/g) || [];
      return items.map(item => item.replace(/^\d+\.\s*|[-•*]\s*/, '').trim()).filter(Boolean);
    };

    // Parse issues and recommendations
    const issues = issuesSection ? extractItems(issuesSection[1]) : [];
    const recommendations = recommendationsSection ? extractItems(recommendationsSection[1]) : [];
    const summary = summarySection ? summarySection[1].trim() : "Repository analysis completed.";

    // Create the quality results object
    const qualityResults: QualityResults = {
      score: parseInt(scoreMatches.overall?.[1] || "70"),
      readabilityScore: parseInt(scoreMatches.readability?.[1] || "70"),
      maintainabilityScore: parseInt(scoreMatches.maintainability?.[1] || "70"),
      performanceScore: parseInt(scoreMatches.performance?.[1] || "70"),
      securityScore: parseInt(scoreMatches.security?.[1] || "70"),
      codeSmellScore: parseInt(scoreMatches.codeSmell?.[1] || "70"),
      issues: issues.length > 0 ? issues : ["No major issues identified."],
      recommendations: recommendations.length > 0 ? recommendations : ["No specific recommendations provided."],
      summary: summary,
      categories: [
        { name: "Readability", score: parseInt(scoreMatches.readability?.[1] || "70") },
        { name: "Maintainability", score: parseInt(scoreMatches.maintainability?.[1] || "70") },
        { name: "Performance", score: parseInt(scoreMatches.performance?.[1] || "70") },
        { name: "Security", score: parseInt(scoreMatches.security?.[1] || "70") },
        { name: "Code Smell", score: parseInt(scoreMatches.codeSmell?.[1] || "70") }
      ]
    };

    return qualityResults;
  } catch (error) {
    console.error("Error analyzing repository:", error);
    throw new Error("Failed to analyze repository: " + (error instanceof Error ? error.message : String(error)));
  }
};

// Legacy name
export const analyzeCodeWithAI = analyzeCodeQualityWithAI;
