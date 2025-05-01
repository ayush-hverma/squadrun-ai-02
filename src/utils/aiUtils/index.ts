
// Re-export everything from the new module structure except for the duplicate functions
export * from './codeCompletion';
export * from './refactoring';

// Explicitly re-export from geminiConfig (these take precedence)
export { 
  getGeminiConfig,
  isGeminiConfigured,
  configureGemini,
  getStoredApiKey,
  clearApiKey 
} from './geminiConfig';

// Explicitly re-export from geminiApi
export { callGeminiApi } from './geminiApi';

// Export code analysis functions except the ones that would cause conflicts
export { 
  analyzeCodeWithAI,
  analyzeRepositoryWithAI
} from './codeAnalysis';

// Explicitly re-export apiPromptTemplates
export * from './apiPromptTemplates';

// Export the refactorCodeWithAI function directly to maintain compatibility
export { refactorCodeWithAI } from './refactoring';
