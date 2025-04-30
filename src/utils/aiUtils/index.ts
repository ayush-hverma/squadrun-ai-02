
// Re-export all necessary functions from the refactored modules
export {
  configureGemini,
  isGeminiConfigured,
  getStoredApiKey,
  clearApiKey
} from './geminiConfig';

export {
  refactorCodeWithAI,
  analyzeCodeQualityWithAI,
  analyzeRepositoryWithAI
} from './codeAnalysis';

export {
  getCodeCompletion,
  codeCompletion
} from './codeCompletion';

// Legacy re-exports to maintain backward compatibility
export { configureGemini as configureOpenAI } from './geminiConfig';
export { isGeminiConfigured as isOpenAIConfigured } from './geminiConfig';
