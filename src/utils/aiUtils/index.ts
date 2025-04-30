
// Re-export everything from the new module structure
export * from './codeAnalysis';
export * from './codeCompletion';
export * from './geminiApi';
export * from './geminiConfig';
export * from './refactoring';

// Export the refactorCodeWithAI function directly to maintain compatibility
export { refactorCodeWithAI } from './refactoring';
