
/**
 * Gemini API configuration module
 */

export interface GeminiConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
}

// Default configuration with placeholder API key
const defaultGeminiConfig: GeminiConfig = {
  apiKey: "AIzaSyAMranDv79YHxNAvMAyPGRVK0HsTbRgT2U", // Empty API key placeholder for users to insert their own
  model: "gemini-2.5-flash-preview-04-17",
  temperature: 0.1,
  maxOutputTokens: 65000
};

// Global configuration
let geminiConfig: GeminiConfig = { ...defaultGeminiConfig };

/**
 * Set the Google Gemini API key and optional configuration
 */
export const configureGemini = (config: Partial<GeminiConfig>): void => {
  geminiConfig = { ...geminiConfig, ...config };
};

/**
 * Check if Gemini is configured with an API key
 */
export const isGeminiConfigured = (): boolean => {
  return Boolean(geminiConfig.apiKey && geminiConfig.apiKey !== "");
};

/**
 * Get the stored API key
 */
export const getStoredApiKey = (): string => {
  return geminiConfig.apiKey;
};

/**
 * Clear the stored API key
 */
export const clearApiKey = (): void => {
  geminiConfig.apiKey = defaultGeminiConfig.apiKey;
};

/**
 * Get the current configuration
 */
export const getGeminiConfig = (): GeminiConfig => {
  return { ...geminiConfig };
};
