
// Re-export all necessary functions from the refactored modules
export {
  isGeminiConfigured,
  getGeminiConfig
} from './geminiConfig';

export {
  refactorCodeWithAI,
  analyzeCodeQualityWithAI,
  analyzeRepositoryWithAI,
  analyzeCodeWithAI
} from './codeAnalysis';

export {
  getCodeCompletion
} from './codeCompletion';

// Backward compatibility exports
export { configureGemini, getStoredApiKey, clearApiKey } from './geminiConfig';
