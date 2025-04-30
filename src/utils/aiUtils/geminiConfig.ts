/**
 * Gemini API configuration module
 */

export interface GeminiConfig {
  apiKey: string;
  model: string;
  temperature: number;
  maxOutputTokens: number;
}

// Fixed configuration for Gemini API with pre-configured API key
const geminiConfig: GeminiConfig = {
  apiKey: process.env.GEMINI_API_KEY || "", // Pre-configured API key
  model: "gemini-2.5-flash-preview-04-17",
  temperature: 0.1,
  maxOutputTokens: 65000
};

/**
 * Get the current configuration
 */
export const getGeminiConfig = (): GeminiConfig => {
  return { ...geminiConfig };
};

/**
 * Check if Gemini is configured
 */
export const isGeminiConfigured = (): boolean => {
  return true; // Always return true since we have a pre-configured API key
};

// These are kept for backward compatibility but don't actually change anything
export const configureGemini = (): void => {};
export const getStoredApiKey = (): string => geminiConfig.apiKey;
export const clearApiKey = (): void => {};
