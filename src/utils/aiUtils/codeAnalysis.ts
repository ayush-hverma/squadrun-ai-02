import { QualityResults } from '@/types/codeQuality';
import { callGeminiApi } from './geminiApi';
import { getGeminiConfig } from './geminiConfig';

interface FileData {
  path: string;
  content: string;
}

/**
 * Valid file extensions for code analysis
 */
const VALID_EXTENSIONS = ['js', 'ts', 'tsx', 'jsx', 'sql', 'json', 'yaml', 'yml', 'toml', 'php', 'css', 'html', 'py', 'java', 'c', 'cpp', 'go', 'rb'];

/**
 * System instruction for code analysis
 */
const CODE_ANALYSIS_SYSTEM_INSTRUCTION = `
You are an expert code quality analyzer with strict evaluation criteria. Your task is to analyze code and provide detailed quality metrics.

CRITICAL REQUIREMENTS:
1. Evaluate code quality across ALL specified dimensions
2. Provide numerical scores (0-100) for each metric
3. List specific issues found with line numbers or code snippets
4. Give actionable recommendations with code examples
5. Follow strict scoring guidelines for each metric

ANALYSIS DIMENSIONS:

1. Readability (30% weight)
   - Code structure and organization
   - Naming conventions and consistency
   - Comment quality and documentation
   - Code formatting and style
   - Variable and function naming clarity
   - Code complexity and nesting levels

2. Maintainability (25% weight)
   - Code organization and modularity
   - Function and class design
   - Code duplication and DRY principles
   - Error handling patterns
   - Configuration management
   - Dependency management

3. Performance (20% weight)
   - Algorithm efficiency
   - Resource usage and optimization
   - Memory management
   - Asynchronous operations
   - Database queries and caching
   - Network request optimization

4. Security (15% weight)
   - Input validation and sanitization
   - Authentication and authorization
   - Data encryption and protection
   - Secure coding practices
   - Vulnerability prevention
   - Security best practices

5. Code Smells (10% weight)
   - Anti-patterns
   - Technical debt
   - Code complexity
   - Dead code
   - Magic numbers/strings
   - Inconsistent patterns

SCORING GUIDELINES:
- 90-100: Exceptional code quality, minimal issues
- 80-89: Very good code quality, minor issues
- 70-79: Good code quality, some issues
- 60-69: Acceptable code quality, several issues
- 50-59: Poor code quality, many issues
- 0-49: Critical issues, requires major refactoring

RESPONSE FORMAT:
{
  "score": number, // Overall weighted score (0-100)
  "readabilityScore": number, // Readability score (0-100)
  "maintainabilityScore": number, // Maintainability score (0-100)
  "performanceScore": number, // Performance score (0-100)
  "securityScore": number, // Security score (0-100)
  "codeSmellScore": number, // Code smell score (0-100)
  "issues": string[], // List of specific issues with line numbers
  "recommendations": string[] // List of improvement recommendations with examples
}
`;

/**
 * System instruction for repository analysis
 */
const REPOSITORY_ANALYSIS_SYSTEM_INSTRUCTION = `
You are an expert repository quality analyzer with strict evaluation criteria. Your task is to analyze a collection of code files and provide comprehensive quality metrics for the entire codebase.

CRITICAL REQUIREMENTS:
1. Evaluate repository quality across ALL specified dimensions
2. Provide numerical scores (0-100) for each metric
3. List specific issues found with file paths and line numbers
4. Give actionable recommendations with implementation examples
5. Follow strict scoring guidelines for each metric
6. Consider cross-file dependencies and patterns

ANALYSIS DIMENSIONS:

1. Architecture & Structure (30% weight)
   - Project organization and file structure
   - Module dependencies and coupling
   - Code reuse and DRY principles
   - Configuration management
   - Build and deployment setup
   - Directory organization
   - File naming conventions
   - Module boundaries

2. Code Quality (25% weight)
   - Readability (code structure, naming, comments)
   - Maintainability (organization, modularity, complexity)
   - Performance (algorithms, resource usage)
   - Security (vulnerabilities, best practices)
   - Code Smells (anti-patterns, technical debt)
   - Code consistency across files
   - Error handling patterns
   - Testing coverage

3. Cross-Cutting Concerns (20% weight)
   - Error handling patterns
   - Logging and monitoring
   - Testing coverage and quality
   - Documentation completeness
   - Dependency management
   - Version control practices
   - CI/CD configuration
   - Environment management

4. Security & Compliance (15% weight)
   - Security best practices
   - Authentication and authorization
   - Data protection
   - API security
   - Dependency vulnerabilities
   - Compliance requirements
   - Security documentation
   - Access control

5. Development Practices (10% weight)
   - Version control usage
   - Branch management
   - Code review process
   - Documentation standards
   - Build and deployment
   - Environment configuration
   - Development workflow
   - Team collaboration

SCORING GUIDELINES:
- 90-100: Exceptional repository quality, minimal issues
- 80-89: Very good repository quality, minor issues
- 70-79: Good repository quality, some issues
- 60-69: Acceptable repository quality, several issues
- 50-59: Poor repository quality, many issues
- 0-49: Critical issues, requires major restructuring

RESPONSE FORMAT:
{
  "score": number, // Overall weighted score (0-100)
  "readabilityScore": number, // Overall readability score (0-100)
  "maintainabilityScore": number, // Overall maintainability score (0-100)
  "performanceScore": number, // Overall performance score (0-100)
  "securityScore": number, // Overall security score (0-100)
  "codeSmellScore": number, // Overall code smell score (0-100)
  "issues": string[], // List of specific issues with file paths and line numbers
  "recommendations": string[] // List of improvement recommendations with examples
}
`;

/**
 * Template for code analysis prompt
 */
const CODE_ANALYSIS_PROMPT = `
Analyze the following {language} code for quality metrics:

Code:
{code}

REQUIRED ANALYSIS:

1. Readability Analysis
   - Evaluate code structure and organization
   - Check naming conventions and consistency
   - Assess comment quality and documentation
   - Review code formatting and style
   - Analyze variable and function naming
   - Measure code complexity

2. Maintainability Analysis
   - Evaluate code organization and modularity
   - Assess function and class design
   - Check for code duplication
   - Review error handling patterns
   - Analyze configuration management
   - Evaluate dependency management

3. Performance Analysis
   - Evaluate algorithm efficiency
   - Check resource usage and optimization
   - Review memory management
   - Assess asynchronous operations
   - Analyze database operations
   - Review network requests

4. Security Analysis
   - Check input validation
   - Review authentication mechanisms
   - Assess data protection
   - Evaluate secure coding practices
   - Check for vulnerabilities
   - Review security patterns

5. Code Smell Analysis
   - Identify anti-patterns
   - Check for technical debt
   - Measure code complexity
   - Look for dead code
   - Check for magic numbers/strings
   - Review coding patterns

For each category:
- Provide a score from 0-100
- List specific issues with line numbers
- Give actionable recommendations with code examples

Format the response as a structured JSON object matching the QualityResults interface.
`;

/**
 * Template for repository analysis prompt
 */
const REPOSITORY_ANALYSIS_PROMPT = `
Analyze the following repository for quality metrics:

Files:
{files}

Repository Structure:
{structure}

REQUIRED ANALYSIS:

1. Architecture & Structure Analysis
   - Evaluate project organization
   - Check module dependencies
   - Assess code reuse
   - Review configuration management
   - Analyze build setup
   - Check directory structure
   - Review file naming
   - Evaluate module boundaries

2. Code Quality Analysis
   - Evaluate overall readability
   - Check maintainability
   - Assess performance patterns
   - Review security practices
   - Identify code smells
   - Check code consistency
   - Review error handling
   - Assess testing coverage

3. Cross-Cutting Concerns Analysis
   - Evaluate error handling
   - Check logging practices
   - Review testing coverage
   - Assess documentation
   - Check dependency management
   - Review version control
   - Analyze CI/CD setup
   - Check environment management

4. Security & Compliance Analysis
   - Review security practices
   - Check authentication
   - Assess data protection
   - Evaluate API security
   - Check dependencies
   - Review compliance
   - Assess documentation
   - Check access control

5. Development Practices Analysis
   - Review version control
   - Check branch management
   - Assess code review
   - Review documentation
   - Check build process
   - Evaluate environments
   - Review workflow
   - Check collaboration

For each category:
- Provide a score from 0-100
- List specific issues with file paths and line numbers
- Give actionable recommendations with implementation examples

Format the response as a structured JSON object matching the QualityResults interface.
`;

/**
 * Logging utility for debugging
 */
const log = {
  info: (message: string, data?: any) => {
    console.log(`[Code Analysis] ${message}`, data ? data : '');
  },
  error: (message: string, error?: any) => {
    console.error(`[Code Analysis] ${message}`, error ? error : '');
    // Log stack trace if available
    if (error instanceof Error) {
      console.error(`[Code Analysis] Stack trace:`, error.stack);
    }
  },
  warn: (message: string, data?: any) => {
    console.warn(`[Code Analysis] ${message}`, data ? data : '');
  },
  debug: (message: string, data?: any) => {
    // Always log in debug mode
    console.debug(`[Code Analysis] ${message}`, data ? data : '');
  }
};

/**
 * Validate file data before analysis
 */
const validateFileData = (file: FileData): boolean => {
  try {
    if (!file) {
      log.error('File is null or undefined');
      return false;
    }

    if (!file.path || !file.content) {
      log.error('Invalid file data', { 
        path: file.path,
        hasContent: !!file.content,
        contentLength: file.content?.length
      });
      return false;
    }
    
    const extension = file.path.split('.').pop()?.toLowerCase();
    if (!VALID_EXTENSIONS.includes(extension || '')) {
      log.warn('Invalid file extension', { 
        path: file.path, 
        extension,
        validExtensions: VALID_EXTENSIONS 
      });
      return false;
    }
    
    if (file.content.length > 100000) {
      log.warn('File too large', { 
        path: file.path, 
        size: file.content.length,
        maxSize: 100000
      });
      return false;
    }
    
    return true;
  } catch (error) {
    log.error('Error validating file data', { error, file });
    return false;
  }
};

/**
 * Analyze a single code file with AI to assess code quality
 */
export const analyzeCodeWithAI = async (
  code: string,
  language: string
): Promise<QualityResults> => {
  try {
    // Validate input
    if (!code || typeof code !== 'string') {
      const error = new Error('Invalid code input: Code must be a non-empty string');
      log.error('Code validation failed', { 
        hasCode: !!code,
        codeType: typeof code,
        codeLength: code?.length
      });
      throw error;
    }
    
    if (!language || typeof language !== 'string') {
      const error = new Error('Invalid language input: Language must be a non-empty string');
      log.error('Language validation failed', { 
        hasLanguage: !!language,
        languageType: typeof language
      });
      throw error;
    }

    log.info(`Starting code analysis for ${language} file`);
    log.debug('Analysis parameters', { 
      language, 
      codeLength: code.length,
      codePreview: code.substring(0, 100) + '...' // Log first 100 chars for verification
    });

    // Check if Gemini is configured
    if (!isGeminiConfigured()) {
      const error = new Error('Gemini API is not configured');
      log.error('Gemini configuration check failed');
      throw error;
    }

    // Prepare the prompt with actual code
    const prompt = CODE_ANALYSIS_PROMPT
      .replace('{language}', language)
      .replace('{code}', code);

    log.debug('Prepared prompt for Gemini', {
      promptLength: prompt.length,
      language,
      codeLength: code.length
    });

    // Call Gemini API for analysis
    let response;
    try {
      response = await callGeminiApi(prompt, CODE_ANALYSIS_SYSTEM_INSTRUCTION, {
        temperature: 0.1,
        maxOutputTokens: 4000
      });
    } catch (apiError) {
      log.error('Gemini API call failed', { 
        error: apiError,
        language,
        codeLength: code.length
      });
      throw new Error('Failed to get analysis from Gemini API');
    }

    log.info('Received Gemini API response', { 
      responseLength: response?.length,
      language,
      codeLength: code.length
    });

    // Parse and validate the response
    let results: QualityResults;
    try {
      results = JSON.parse(response);
      
      // Validate required fields
      const requiredFields = [
        'score', 'readabilityScore', 'maintainabilityScore',
        'performanceScore', 'securityScore', 'codeSmellScore',
        'issues', 'recommendations'
      ];
      
      for (const field of requiredFields) {
        if (!(field in results)) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      // Validate numeric fields are within range
      const numericFields = [
        'score', 'readabilityScore', 'maintainabilityScore',
        'performanceScore', 'securityScore', 'codeSmellScore'
      ];
      
      for (const field of numericFields) {
        const value = results[field as keyof QualityResults];
        if (typeof value !== 'number' || value < 0 || value > 100) {
          throw new Error(`Invalid score for ${field}: ${value}`);
        }
      }

      // Validate arrays
      if (!Array.isArray(results.issues) || !Array.isArray(results.recommendations)) {
        throw new Error('Issues and recommendations must be arrays');
      }

    } catch (parseError) {
      log.error('Failed to parse Gemini API response', { 
        error: parseError,
        response,
        language,
        codeLength: code.length
      });
      throw new Error('Failed to parse analysis results');
    }

    log.info('Analysis complete', {
      overallScore: results.score,
      metrics: {
        readability: results.readabilityScore,
        maintainability: results.maintainabilityScore,
        performance: results.performanceScore,
        security: results.securityScore,
        codeSmells: results.codeSmellScore
      },
      language,
      codeLength: code.length
    });

    return results;
  } catch (error) {
    log.error('Error analyzing code:', { 
      error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined,
      language,
      codeLength: code?.length
    });
    throw error; // Re-throw the original error for proper handling upstream
  }
};

/**
 * Analyze a repository of code files with AI
 */
export const analyzeRepositoryWithAI = async (
  files: FileData[]
): Promise<QualityResults> => {
  try {
    // Validate input
    if (!Array.isArray(files)) {
      const error = new Error('Invalid files input: Must provide an array of files');
      log.error('Files validation failed - not an array', { 
        filesType: typeof files 
      });
      throw error;
    }

    if (files.length === 0) {
      const error = new Error('Invalid files input: Must provide at least one file');
      log.error('Files validation failed - empty array');
      throw error;
    }

    log.info('Starting repository analysis', { 
      totalFiles: files.length,
      fileTypes: [...new Set(files.map(f => f.path.split('.').pop()?.toLowerCase()))],
      filePaths: files.map(f => f.path)
    });
    
    // Check if Gemini is configured
    if (!isGeminiConfigured()) {
      const error = new Error('Gemini API is not configured');
      log.error('Gemini configuration check failed');
      throw error;
    }

    // Validate each file
    const validFiles = files.filter(file => validateFileData(file));
    
    log.info('File validation results', {
      totalFiles: files.length,
      validFiles: validFiles.length,
      skippedFiles: files.length - validFiles.length,
      skippedReasons: {
        invalidExtension: files.filter(f => !VALID_EXTENSIONS.includes(f.path.split('.').pop()?.toLowerCase() || '')).length,
        tooLarge: files.filter(f => f.content.length >= 100000).length,
        invalidData: files.filter(f => !f.path || !f.content).length
      },
      validFilePaths: validFiles.map(f => f.path)
    });
    
    if (validFiles.length === 0) {
      const error = new Error('No valid code files found to analyze');
      log.error('No valid files after validation');
      throw error;
    }

    // Prepare repository structure information
    const structure = validFiles.map(file => ({
      path: file.path,
      size: file.content.length,
      type: file.path.split('.').pop()?.toLowerCase()
    }));

    // Prepare the prompt with actual files
    const prompt = REPOSITORY_ANALYSIS_PROMPT
      .replace('{files}', JSON.stringify(validFiles, null, 2))
      .replace('{structure}', JSON.stringify(structure, null, 2));

    log.debug('Prepared prompt for Gemini', {
      promptLength: prompt.length,
      totalFiles: validFiles.length,
      filePaths: validFiles.map(f => f.path)
    });

    // Call Gemini API for analysis
    let response;
    try {
      response = await callGeminiApi(prompt, REPOSITORY_ANALYSIS_SYSTEM_INSTRUCTION, {
        temperature: 0.1,
        maxOutputTokens: 4000
      });

      log.info('Received Gemini API response', {
        responseLength: response?.length,
        hasResponse: !!response
      });

      if (!response) {
        throw new Error('Empty response from Gemini API');
      }
    } catch (apiError) {
      log.error('Gemini API call failed', { 
        error: apiError,
        errorMessage: apiError instanceof Error ? apiError.message : 'Unknown API error',
        errorStack: apiError instanceof Error ? apiError.stack : undefined,
        totalFiles: validFiles.length,
        filePaths: validFiles.map(f => f.path)
      });
      throw new Error(`Failed to get analysis from Gemini API: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`);
    }

    // Parse and validate the response
    let results: QualityResults;
    try {
      results = JSON.parse(response);
      
      // Validate required fields
      const requiredFields = [
        'score', 'readabilityScore', 'maintainabilityScore',
        'performanceScore', 'securityScore', 'codeSmellScore',
        'issues', 'recommendations'
      ];
      
      for (const field of requiredFields) {
        if (!(field in results)) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      // Validate numeric fields are within range
      const numericFields = [
        'score', 'readabilityScore', 'maintainabilityScore',
        'performanceScore', 'securityScore', 'codeSmellScore'
      ];
      
      for (const field of numericFields) {
        const value = results[field as keyof QualityResults];
        if (typeof value !== 'number' || value < 0 || value > 100) {
          throw new Error(`Invalid score for ${field}: ${value}`);
        }
      }

      // Validate arrays
      if (!Array.isArray(results.issues) || !Array.isArray(results.recommendations)) {
        throw new Error('Issues and recommendations must be arrays');
      }

    } catch (parseError) {
      log.error('Failed to parse Gemini API response', { 
        error: parseError,
        errorMessage: parseError instanceof Error ? parseError.message : 'Unknown parse error',
        errorStack: parseError instanceof Error ? parseError.stack : undefined,
        response,
        totalFiles: validFiles.length
      });
      throw new Error(`Failed to parse analysis results: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }

    log.info('Repository analysis complete', {
      totalFiles: validFiles.length,
      finalScores: {
        overall: results.score,
        readability: results.readabilityScore,
        maintainability: results.maintainabilityScore,
        performance: results.performanceScore,
        security: results.securityScore,
        codeSmells: results.codeSmellScore
      },
      totalIssues: results.issues.length,
      totalRecommendations: results.recommendations.length,
      analyzedFiles: validFiles.map(f => f.path)
    });

    return results;
  } catch (error) {
    log.error('Error analyzing repository:', { 
      error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined,
      totalFiles: files?.length,
      filePaths: files?.map(f => f.path)
    });
    throw error; // Re-throw the original error for proper handling upstream
  }
};

/**
 * Check if the AI is configured
 */
export const isGeminiConfigured = (): boolean => {
  // Since we have a hardcoded API key in geminiConfig.ts, always return true
  return true;
};

/**
 * Configure the AI with API key
 */
export const configureGemini = (apiKey: string) => {
  // No-op since we're using hardcoded API key
  return true;
};

/**
 * Get stored API key
 */
export const getStoredApiKey = (): string => {
  // Return the hardcoded API key from geminiConfig
  return getGeminiConfig().apiKey;
};

/**
 * Clear stored API key
 */
export const clearApiKey = () => {
  // No-op since we're using hardcoded API key
};
