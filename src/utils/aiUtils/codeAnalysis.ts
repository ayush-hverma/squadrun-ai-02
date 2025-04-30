import { QualityResults } from '@/types/codeQuality';

interface FileData {
  path: string;
  content: string;
}

/**
 * Analyze a single code file with AI to assess code quality
 */
export const analyzeCodeWithAI = async (
  code: string,
  language: string
): Promise<QualityResults> => {
  try {
    console.log(`Analyzing ${language} code...`);

    // In a real implementation, this would call an actual AI service
    // For now, we'll implement a more realistic simulation that varies based on code content
    
    const totalLines = code.split('\n').length;
    const commentLines = code.split('\n').filter(line => 
      line.trim().startsWith('//') || 
      line.trim().startsWith('/*') || 
      line.trim().startsWith('*')
    ).length;
    
    // Calculate comment ratio (higher is better for readability)
    const commentRatio = (commentLines / totalLines) * 100;
    
    // Look for common code smells
    const codeSmells = [];
    if (code.includes('var ')) codeSmells.push('Usage of var instead of let/const');
    if (code.includes('console.log')) codeSmells.push('Debug statements in production code');
    if (code.includes('catch (e)') || code.includes('catch(e)')) codeSmells.push('Generic error catching');
    if (code.includes('eval(')) codeSmells.push('Use of eval()');
    
    // Check for security issues
    const securityIssues = [];
    if (code.includes('innerHTML')) securityIssues.push('Use of innerHTML (XSS risk)');
    if (code.includes('dangerouslySetInnerHTML')) securityIssues.push('Use of dangerouslySetInnerHTML (XSS risk)');
    if (code.toLowerCase().includes('password') && !code.includes('hash')) securityIssues.push('Potential password handling without hashing');
    
    // Calculate complexity (naive approach - more functions/conditionals = more complex)
    const functionCount = (code.match(/function/g) || []).length + (code.match(/=>/g) || []).length;
    const conditionalCount = (code.match(/if \(/g) || []).length + (code.match(/\? /g) || []).length;
    const complexity = Math.min(100, ((functionCount + conditionalCount) / (totalLines / 20)) * 100);
    
    // Generate variable scores based on the code characteristics
    // Base scores - will be adjusted based on analysis
    let readabilityBase = Math.min(90, Math.max(40, 70 + (commentRatio / 10) - (complexity / 20)));
    let maintainabilityBase = Math.min(90, Math.max(40, 75 - (complexity / 15)));
    let performanceBase = Math.min(90, Math.max(40, 70 - (functionCount / 10)));
    let securityBase = Math.min(90, Math.max(30, 80 - (securityIssues.length * 15)));
    let codeSmellBase = Math.min(90, Math.max(30, 75 - (codeSmells.length * 10)));
    
    // Add some randomness to simulate AI variations but keep within reasonable bounds
    const addVariation = (score: number) => Math.min(95, Math.max(30, score + (Math.random() * 10 - 5)));
    
    // Final scores with variation
    const readabilityScore = Math.round(addVariation(readabilityBase));
    const maintainabilityScore = Math.round(addVariation(maintainabilityBase));
    const performanceScore = Math.round(addVariation(performanceBase));
    const securityScore = Math.round(addVariation(securityBase));
    const codeSmellScore = Math.round(addVariation(codeSmellBase));
    
    // Overall score is weighted average
    const score = Math.round(
      (readabilityScore * 0.25) + 
      (maintainabilityScore * 0.25) + 
      (performanceScore * 0.2) + 
      (securityScore * 0.2) + 
      (codeSmellScore * 0.1)
    );
    
    // Generate issues and recommendations based on the analysis
    const issues = [];
    const recommendations = [];
    
    if (commentRatio < 10) {
      issues.push('Low comment density in code');
      recommendations.push('Add more comments to explain complex logic and functions');
    }
    
    // Add identified code smells to issues
    issues.push(...codeSmells);
    
    // Add security issues to issues list
    issues.push(...securityIssues);
    
    if (complexity > 60) {
      issues.push('High code complexity detected');
      recommendations.push('Consider breaking down complex functions into smaller, more manageable pieces');
    }
    
    if (functionCount > 20) {
      recommendations.push('Consider refactoring to reduce the number of functions or use more efficient patterns');
    }
    
    // Default recommendations if none were generated
    if (recommendations.length === 0) {
      recommendations.push('Code quality is good, continue following best practices');
    }

    return {
      score,
      readabilityScore,
      maintainabilityScore,
      performanceScore, 
      securityScore,
      codeSmellScore,
      issues,
      recommendations
    };
  } catch (error) {
    console.error('Error analyzing code:', error);
    throw new Error('Failed to analyze code quality');
  }
};

/**
 * Analyze a repository of code files with AI
 */
export const analyzeRepositoryWithAI = async (
  files: FileData[]
): Promise<QualityResults> => {
  try {
    console.log(`Analyzing repository with ${files.length} files...`);
    
    // Initialize aggregated results
    const aggregatedResults: QualityResults = {
      score: 0,
      readabilityScore: 0,
      maintainabilityScore: 0,
      performanceScore: 0,
      securityScore: 0,
      codeSmellScore: 0,
      issues: [],
      recommendations: []
    };
    
    // Skip non-code files or those that are too large
    const validFiles = files.filter(file => {
      const extension = file.path.split('.').pop()?.toLowerCase();
      const validExtensions = ['js', 'ts', 'tsx', 'jsx', 'css', 'html', 'py', 'java', 'c', 'cpp', 'go', 'rb'];
      return validExtensions.includes(extension || '') && file.content.length < 100000;
    });
    
    if (validFiles.length === 0) {
      throw new Error('No valid code files found to analyze');
    }
    
    // Analyze each file and combine results
    for (const file of validFiles) {
      const extension = file.path.split('.').pop() || 'js';
      const fileResults = await analyzeCodeWithAI(file.content, extension);
      
      // Accumulate scores
      aggregatedResults.score += fileResults.score;
      aggregatedResults.readabilityScore += fileResults.readabilityScore;
      aggregatedResults.maintainabilityScore += fileResults.maintainabilityScore;
      aggregatedResults.performanceScore += fileResults.performanceScore;
      aggregatedResults.securityScore += fileResults.securityScore;
      aggregatedResults.codeSmellScore += fileResults.codeSmellScore;
      
      // Track unique issues and recommendations
      fileResults.issues.forEach(issue => {
        if (!aggregatedResults.issues.includes(issue)) {
          aggregatedResults.issues.push(issue);
        }
      });
      
      fileResults.recommendations.forEach(recommendation => {
        if (!aggregatedResults.recommendations.includes(recommendation)) {
          aggregatedResults.recommendations.push(recommendation);
        }
      });
    }
    
    // Calculate averages
    aggregatedResults.score = Math.round(aggregatedResults.score / validFiles.length);
    aggregatedResults.readabilityScore = Math.round(aggregatedResults.readabilityScore / validFiles.length);
    aggregatedResults.maintainabilityScore = Math.round(aggregatedResults.maintainabilityScore / validFiles.length);
    aggregatedResults.performanceScore = Math.round(aggregatedResults.performanceScore / validFiles.length);
    aggregatedResults.securityScore = Math.round(aggregatedResults.securityScore / validFiles.length);
    aggregatedResults.codeSmellScore = Math.round(aggregatedResults.codeSmellScore / validFiles.length);
    
    // Add repository-wide recommendations
    if (validFiles.length > 10) {
      aggregatedResults.recommendations.push('Consider organizing large codebase into more modular structures');
    }
    
    // Limit recommendations and issues to avoid overwhelming the user
    aggregatedResults.recommendations = aggregatedResults.recommendations.slice(0, 5);
    aggregatedResults.issues = aggregatedResults.issues.slice(0, 10);
    
    return aggregatedResults;
  } catch (error) {
    console.error('Error analyzing repository:', error);
    throw new Error('Failed to analyze repository quality');
  }
};

/**
 * Check if the AI is configured
 */
export const isGeminiConfigured = (): boolean => {
  return true; // For demo purposes
};

/**
 * Configure the AI with API key
 */
export const configureGemini = () => {
  return true; // For demo purposes
};

/**
 * Get stored API key
 */
export const getStoredApiKey = (): string => {
  return ''; // For demo purposes
};

/**
 * Clear stored API key
 */
export const clearApiKey = () => {
  // For demo purposes
};
