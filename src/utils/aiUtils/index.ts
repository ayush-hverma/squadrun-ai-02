
// Re-export everything from the new module structure
export * from './codeAnalysis';
export * from './codeCompletion';
export * from './geminiApi';

// Re-export specific functions from geminiConfig to avoid conflicts
export { configureGemini, isGeminiConfigured, getStoredApiKey, clearApiKey } from './geminiConfig';
export * from './refactoring';

// Export the refactorCodeWithAI function directly to maintain compatibility
export { refactorCodeWithAI } from './refactoring';
