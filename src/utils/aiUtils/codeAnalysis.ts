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
const VALID_EXTENSIONS = ['js', 'ts', 'txt', 'md', 'mdx', 'bin', 'gitignore', 'tsx', 'jsx', 'sql', 'sqlx', 'sqlx-migrations', 'sqlite', 'sqlite3', 'json', 'yaml', 'yml', 'toml', 'php', 'css', 'html', 'py', 'java', 'c', 'cpp', 'go', 'rb'];

/**
 * System instruction for code analysis
 */
const CODE_ANALYSIS_SYSTEM_INSTRUCTION = `
You are a senior-level static code analysis agent with strict evaluation criteria. Your role is to **deeply inspect and grade** the quality of a given codebase with **zero tolerance for ambiguity or superficial analysis**.

MANDATORY REQUIREMENTS:
1. Assess the code against **every listed dimension** without skipping any aspect.
2. Assign **numerical scores (0-100)** for each metric using the defined weighting.
3. Detect and document **specific issues** with file names, line numbers, and relevant code snippets.
4. Provide **actionable, example-based recommendations** for each issue detected.
5. Apply the **strict scoring rubric** outlined below—do not inflate scores.

STRICT ANALYSIS DIMENSIONS:

1. Readability (30% weight)
   - Assess structure, indentation, and logical layout.
   - Validate naming conventions for clarity and consistency.
   - Check for high-quality, meaningful comments and docstrings.
   - Flag poor formatting, mixed styles, or unreadable logic blocks.
   - Penalize deeply nested logic and lack of separation of concerns.

2. Maintainability (25% weight)
   - Ensure well-defined modules, single-responsibility functions/classes.
   - Flag repeated code violating DRY principles.
   - Highlight brittle or unsafe error handling.
   - Review use of environment variables, configs, and hardcoded values.
   - Identify poor or unsafe dependency handling.

3. Performance (20% weight)
   - Analyze algorithmic complexity and efficiency.
   - Flag unnecessary loops, redundant operations, or inefficient patterns.
   - Identify memory-intensive logic or blocking calls.
   - Detect performance bottlenecks in I/O, network, or database operations.
   - Recommend scalable alternatives where applicable.

4. Security (15% weight)
   - Strictly check for missing input validation, injection risks, and insecure data flows.
   - Flag unsafe practices in authentication and session management.
   - Check for absence of encryption, exposed secrets, or insecure storage.
   - Evaluate dependency security (e.g., known CVEs).
   - Demand adherence to OWASP and other secure coding standards.

5. Code Smells (10% weight)
   - Detect anti-patterns, dead code, god functions, or overly complex blocks.
   - Identify magic values, repeated logic, or misplaced responsibilities.
   - Report inconsistent coding styles or architectural violations.
   - Penalize poor cohesion or excessive coupling.

6. SOLID Principles (10% weight)
   - Single Responsibility: each class/module has a focused, clear purpose
   - Open/Closed: modules are extensible without modification
   - Liskov Substitution: inheritance hierarchies are safely substitutable
   - Interface Segregation: no client is forced to depend on unused interfaces
   - Dependency Inversion: high-level modules do not depend on low-level modules 

SCORING GUIDELINES:
- 90–100: Elite quality – minimal, negligible issues
- 80–89: Strong quality – minor issues, no architectural flaws
- 70–79: Good quality – several improvable areas, some technical debt
- 60–69: Acceptable – structural concerns, moderate issues
- 50–59: Poor – major problems in readability, structure, or safety
- 0–49: Critical – severe flaws, refactoring or reengineering required

RESPONSE FORMAT (STRICT):
Respond with a structured JSON object conforming to the following schema:

{
  "score": number,                  // Overall weighted score (0–100)
  "readabilityScore": number,      // (0–100)
  "maintainabilityScore": number,  // (0–100)
  "performanceScore": number,      // (0–100)
  "securityScore": number,         // (0–100)
  "codeSmellScore": number,        // (0–100)
  "issues": string[],              // List issues as: "file.py:Line X - Description"
  "recommendations": string[]      // Detailed, example-based improvements per issue
}

STRICT ENFORCEMENT:
- Vague or generic responses are unacceptable.
- Every point must be supported by **concrete file paths, line numbers, and examples**.
- Your analysis must reflect **production-grade engineering standards**.
`;

/**
 * System instruction for repository analysis
 */
const REPOSITORY_ANALYSIS_SYSTEM_INSTRUCTION = `
You are an elite-level repository auditor with zero tolerance for ambiguity or oversight. Your role is to conduct an exhaustive, forensic-grade analysis of a complete codebase and deliver precise, measurable quality metrics with justified scoring.

STRICT ENFORCEMENT REQUIREMENTS:
1. **Do NOT omit any dimension** in the analysis.
2. **Every score (0-100)** must be critically justified with references to exact files and line numbers.
3. **List a minimum of 5 issues per category** if problems exist.
4. **All recommendations must include file names, line numbers, and concrete before/after code examples.**
5. **Cross-file patterns, architectural flaws, and systemic issues MUST be highlighted.**
6. Your analysis should be objective, direct, and technically grounded—avoid vague language or generic comments.

MANDATORY ANALYSIS DIMENSIONS:

1. Architecture & Structure (30% weight)
   - Assess file/directory layout and modular boundaries.
   - Evaluate inter-module coupling and cohesion.
   - Identify duplicate logic or poor reuse (DRY violations).
   - Analyze config, build, and deployment strategies.
   - Enforce strict naming conventions and folder hygiene.
   - Penalize monolithic or tangled structures.

2. Code Quality (25% weight)
   - Rate readability: naming, comments, formatting.
   - Evaluate maintainability: code modularity, function length, cyclomatic complexity.
   - Flag inefficient or wasteful algorithms.
   - Identify outdated libraries, insecure patterns, poor error handling.
   - Penalize inconsistent styles, dead code, magic values, and silent failures.
   - Coverage must be discussed: What’s tested? What’s not?

3. Cross-Cutting Concerns (20% weight)
   - Analyze logging coverage, error boundaries, and monitoring hooks.
   - Examine test coverage depth, quality of assertions, and mocking.
   - Evaluate documentation for completeness, versioning, and clarity.
   - Flag dependency mismanagement (e.g., unused packages, version drift).
   - Review CI/CD logic, version control tagging, and release automation.

4. Security & Compliance (15% weight)
   - Identify missing auth layers, hardcoded secrets, and insecure defaults.
   - Review access control flows, data handling, and API protections.
   - Highlight use of vulnerable libraries (CVE risks).
   - Enforce basic compliance expectations (e.g., logging PII access, TLS enforcement).

5. Development Practices (10% weight)
   - Analyze branching strategy, commit hygiene, and PR workflows.
   - Assess documentation standards across READMEs, wikis, and inline docs.
   - Evaluate environment reproducibility and config isolation.
   - Assess collaboration artifacts: contribution guides, onboarding, changelogs.

6. Adherence to SOLID principles:
   - Single Responsibility: each class/module has a focused, clear purpose
   - Open/Closed: modules are extensible without modification
   - Liskov Substitution: inheritance hierarchies are safely substitutable
   - Interface Segregation: no client is forced to depend on unused interfaces
   - Dependency Inversion: high-level modules do not depend on low-level modules 


SCORING RULES (NO EXCEPTIONS):
- 90–100: Flawless, enterprise-grade repository. No critical issues. Benchmark quality.
- 80–89: High quality with only minor, isolated issues.
- 70–79: Solid codebase but contains several moderate issues.
- 60–69: Acceptable, but notable architectural, security, or quality gaps.
- 50–59: Below standard. Major issues needing attention.
- 0–49: Critically flawed. Not production-ready. Urgent refactoring required.

STRICT RESPONSE FORMAT:
{
  "score": number, // Weighted overall score (0–100)
  "readabilityScore": number, // Clarity and readability (0–100)
  "maintainabilityScore": number, // Structure and maintainability (0–100)
  "performanceScore": number, // Efficiency and optimization (0–100)
  "securityScore": number, // Security and compliance (0–100)
  "codeSmellScore": number, // Code smell presence (0–100)
  "issues": string[], // Specific, file-linked issues with line numbers
  "recommendations": string[] // Specific, actionable improvements with file paths and code examples
}
`;


/**
 * Template for code analysis prompt
 */
const CODE_ANALYSIS_PROMPT = `
You are a senior static code analysis engine with zero tolerance for sloppy or vague responses. Analyze the following {language} code with expert-level scrutiny, providing **precise metrics and evidence-backed insights** for each quality dimension.

Code to Analyze:
{code}

MANDATORY ANALYSIS – NO DIMENSION MAY BE SKIPPED:

1. Readability Analysis (30% weight)
   - Assess structural clarity and logical flow
   - Validate naming conventions (variables, functions, classes)
   - Flag inconsistent or missing documentation and comments
   - Detect poor formatting (indentation, spacing, layout)
   - Highlight complex/nested logic
   - Penalize unclear naming or cryptic constructs

2. Maintainability Analysis (25% weight)
   - Evaluate separation of concerns and modularity
   - Identify oversized functions or misused classes
   - Detect code duplication and violation of DRY
   - Assess consistency and robustness of error handling
   - Analyze configuration hygiene and decoupling
   - Flag unsafe dependency handling or hardcoded values

3. Performance Analysis (20% weight)
   - Review algorithmic complexity and runtime efficiency
   - Identify excessive loops, redundant calculations, or blocking logic
   - Flag poor memory or resource usage
   - Detect misuse of asynchronous flows or thread management
   - Analyze bottlenecks in database or network interactions
   - Suggest performance-optimized refactoring

4. Security Analysis (15% weight)
   - Strictly check for input/output sanitization
   - Review authentication, authorization, and session management
   - Flag hardcoded secrets, missing encryption, or insecure storage
   - Detect insecure use of external libraries
   - Validate conformance to OWASP and secure coding standards
   - Identify exposure of sensitive data or weak access controls

5. Code Smell Analysis (10% weight)
   - Identify all instances of anti-patterns (god objects, shotgun surgery, etc.)
   - Flag technical debt and outdated practices
   - Detect dead code, magic values, or inconsistent logic
   - Highlight code violating best practices or SOLID principles
   - Penalize lack of cohesion and excessive coupling

6. Code Complexity Analysis (10% weight)
   - Analyze the complexity of the codebase
   - Identify areas of the code that are too complex
   - Provide recommendations for refactoring the code to improve readability and maintainability

7. Adherence to SOLID principles:
   - Single Responsibility: each class/module has a focused, clear purpose
   - Open/Closed: modules are extensible without modification
   - Liskov Substitution: inheritance hierarchies are safely substitutable
   - Interface Segregation: no client is forced to depend on unused interfaces
   - Dependency Inversion: high-level modules do not depend on low-level modules 

STRICT RESPONSE REQUIREMENTS:
- Assign a score from 0–100 for each dimension using the defined weight
- Total score must reflect a strict weighted average
- List **specific issues** with exact file and line references or code snippets
- Provide **detailed, example-based** recommendations for every major issue

RESPONSE FORMAT (STRICT JSON):
{
  "score": number,                  // Total weighted score (0–100)
  "readabilityScore": number,      // (0–100)
  "maintainabilityScore": number,  // (0–100)
  "performanceScore": number,      // (0–100)
  "securityScore": number,         // (0–100)
  "codeSmellScore": number,        // (0–100)
  "issues": string[],              // "Line X: <Description>" or "file.ext:Line Y - <Issue>"
  "recommendations": string[]      // "Fix <problem> by <solution>. Example: <code>"
}

ENFORCEMENT POLICY:
- Do NOT give generic feedback
- Do NOT skip any metric
- Each score must reflect real, concrete evidence from the input
- Responses must demonstrate expert-level reasoning and engineering discipline
`;

/**
 * Template for repository analysis prompt
 */
const REPOSITORY_ANALYSIS_PROMPT = `
You are a senior-level static analysis agent with strict standards for repository quality. Perform a **comprehensive, line-by-line audit** of the following repository. Your analysis must be **exhaustive, exact, and aligned with industry best practices.**

Repository Files:
{files}

Repository Structure:
{structure}

MANDATORY EVALUATION DIMENSIONS:

1. Architecture & Structure (Weight: 30%)
   - Critically assess project organization and modular layout.
   - Identify any tight coupling or poor separation of concerns.
   - Highlight repeated logic violating DRY principles.
   - Evaluate configuration and build management rigor.
   - Review naming conventions, folder hierarchy, and boundaries.
   - Penalize ambiguous structure or scattered logic.

2. Code Quality (Weight: 25%)
   - Rigorously rate readability: naming, formatting, inline docs.
   - Measure maintainability: function size, cohesion, complexity.
   - Identify inefficient or unscalable implementations.
   - Flag poor security practices, bad exception handling, and unsafe patterns.
   - Detect code smells (e.g., long methods, nested conditionals, magic values).
   - Ensure consistent coding standards across all files.
   - Report untested logic, brittle tests, or poor test design.

3. Cross-Cutting Concerns (Weight: 20%)
   - Examine logging granularity and traceability.
   - Analyze error handling and fallback mechanisms.
   - Evaluate testing coverage and assertion quality.
   - Review all documentation: technical, usage, and config.
   - Flag outdated or unpinned dependencies.
   - Check for CI/CD configuration, release automation, and reproducibility.

4. Security & Compliance (Weight: 15%)
   - Identify hardcoded secrets, unencrypted data, and unsafe APIs.
   - Validate authentication/authorization flows.
   - Flag unsafe dependency usage (e.g., known CVEs).
   - Assess data privacy compliance and access controls.
   - Review security documentation and policy enforcement.

5. Development Practices (Weight: 10%)
   - Inspect version control hygiene: commit style, PR process.
   - Review branching model and release discipline.
   - Assess use of linters, hooks, code review enforcement.
   - Evaluate build isolation, environment reproducibility, and .env safety.
   - Review onboarding, CONTRIBUTING.md, and team standards.

6. Adherence to SOLID principles:
   - Single Responsibility: each class/module has a focused, clear purpose
   - Open/Closed: modules are extensible without modification
   - Liskov Substitution: inheritance hierarchies are safely substitutable
   - Interface Segregation: no client is forced to depend on unused interfaces
   - Dependency Inversion: high-level modules do not depend on low-level modules 


STRICT RESPONSE GUIDELINES:
- You must assign a **numerical score (0–100)** for each dimension, based on objective criteria.
- Provide a minimum of **3–5 specific issues per dimension**, with file paths and exact line numbers.
- All recommendations must include:
  - **File and line reference**
  - **Code example (before and after)**
  - **Clear rationale for change**

OUTPUT FORMAT:
Return your results as a strictly structured JSON object matching the **QualityResults** interface. Inaccurate or unstructured output is unacceptable.

DO NOT generalize. Your answers must be file-specific, line-specific, and actionable.
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
        maxOutputTokens: 8192
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
      // First try to parse the response directly
      try {
        results = JSON.parse(response);
      } catch (parseError) {
        // If direct parsing fails, try to extract JSON from the response
        // First try to remove markdown code block formatting
        const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
        try {
          results = JSON.parse(cleanResponse);
        } catch (markdownParseError) {
          // If that fails, try to extract JSON using regex
          const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
          if (!jsonMatch) {
            throw new Error('No valid JSON found in response');
          }
          results = JSON.parse(jsonMatch[0]);
        }
      }
      
      // Ensure all required fields exist with default values if missing
      results = {
        score: typeof results.score === 'number' ? results.score : 0,
        readabilityScore: typeof results.readabilityScore === 'number' ? results.readabilityScore : 0,
        maintainabilityScore: typeof results.maintainabilityScore === 'number' ? results.maintainabilityScore : 0,
        performanceScore: typeof results.performanceScore === 'number' ? results.performanceScore : 0,
        securityScore: typeof results.securityScore === 'number' ? results.securityScore : 0,
        codeSmellScore: typeof results.codeSmellScore === 'number' ? results.codeSmellScore : 0,
        issues: Array.isArray(results.issues) ? results.issues : [],
        recommendations: Array.isArray(results.recommendations) ? results.recommendations : []
      };

      // Validate numeric fields are within range
      const numericFields = [
        'score', 'readabilityScore', 'maintainabilityScore',
        'performanceScore', 'securityScore', 'codeSmellScore'
      ] as const;
      
      for (const field of numericFields) {
        const value = results[field];
        if (typeof value !== 'number' || value < 0 || value > 100) {
          // Clamp values to valid range
          (results as any)[field] = Math.max(0, Math.min(100, Number(value) || 0));
        }
      }

      log.info('Successfully parsed and validated response', {
        scores: {
          overall: results.score,
          readability: results.readabilityScore,
          maintainability: results.maintainabilityScore,
          performance: results.performanceScore,
          security: results.securityScore,
          codeSmells: results.codeSmellScore
        },
        issuesCount: results.issues.length,
        recommendationsCount: results.recommendations.length
      });

    } catch (parseError) {
      log.error('Failed to parse Gemini API response', { 
        error: parseError,
        errorMessage: parseError instanceof Error ? parseError.message : 'Unknown parse error',
        errorStack: parseError instanceof Error ? parseError.stack : undefined,
        response,
        language,
        codeLength: code.length
      });
      
      // Return a default response instead of throwing
      results = {
        score: 0,
        readabilityScore: 0,
        maintainabilityScore: 0,
        performanceScore: 0,
        securityScore: 0,
        codeSmellScore: 0,
        issues: ['Failed to parse analysis results. Please try again.'],
        recommendations: ['The analysis could not be completed. Please ensure the code is valid and try again.']
      };
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
      // First try to parse the response directly
      try {
        results = JSON.parse(response);
      } catch (parseError) {
        // If direct parsing fails, try to extract JSON from the response
        // First try to remove markdown code block formatting
        const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
        try {
          results = JSON.parse(cleanResponse);
        } catch (markdownParseError) {
          // If that fails, try to extract JSON using regex
          const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
          if (!jsonMatch) {
            throw new Error('No valid JSON found in response');
          }
          results = JSON.parse(jsonMatch[0]);
        }
      }
      
      // Ensure all required fields exist with default values if missing
      results = {
        score: typeof results.score === 'number' ? results.score : 0,
        readabilityScore: typeof results.readabilityScore === 'number' ? results.readabilityScore : 0,
        maintainabilityScore: typeof results.maintainabilityScore === 'number' ? results.maintainabilityScore : 0,
        performanceScore: typeof results.performanceScore === 'number' ? results.performanceScore : 0,
        securityScore: typeof results.securityScore === 'number' ? results.securityScore : 0,
        codeSmellScore: typeof results.codeSmellScore === 'number' ? results.codeSmellScore : 0,
        issues: Array.isArray(results.issues) ? results.issues : [],
        recommendations: Array.isArray(results.recommendations) ? results.recommendations : []
      };

      // Validate numeric fields are within range
      const numericFields = [
        'score', 'readabilityScore', 'maintainabilityScore',
        'performanceScore', 'securityScore', 'codeSmellScore'
      ] as const;
      
      for (const field of numericFields) {
        const value = results[field];
        if (typeof value !== 'number' || value < 0 || value > 100) {
          // Clamp values to valid range
          (results as any)[field] = Math.max(0, Math.min(100, Number(value) || 0));
        }
      }

      log.info('Successfully parsed and validated response', {
        scores: {
          overall: results.score,
          readability: results.readabilityScore,
          maintainability: results.maintainabilityScore,
          performance: results.performanceScore,
          security: results.securityScore,
          codeSmells: results.codeSmellScore
        },
        issuesCount: results.issues.length,
        recommendationsCount: results.recommendations.length
      });

    } catch (parseError) {
      log.error('Failed to parse Gemini API response', { 
        error: parseError,
        errorMessage: parseError instanceof Error ? parseError.message : 'Unknown parse error',
        errorStack: parseError instanceof Error ? parseError.stack : undefined,
        response,
        totalFiles: validFiles.length
      });
      
      // Return a default response instead of throwing
      results = {
        score: 0,
        readabilityScore: 0,
        maintainabilityScore: 0,
        performanceScore: 0,
        securityScore: 0,
        codeSmellScore: 0,
        issues: ['Failed to parse analysis results. Please try again.'],
        recommendations: ['The analysis could not be completed. Please ensure the code is valid and try again.']
      };
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
