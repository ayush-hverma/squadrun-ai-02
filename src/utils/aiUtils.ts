
// Mock data for development until real AI integration
export const refactorCodeWithAI = async (
  code: string,
  language: string
): Promise<string> => {
  // In a real implementation, this would call an AI service
  // For now, we'll return a slightly modified version of the code
  return new Promise((resolve) => {
    setTimeout(() => {
      // For demonstration purposes, we'll make some simple changes
      let refactored = code;
      
      // Add some comments
      refactored = "// Refactored by SquadRun AI\n// This code has been optimized for better readability and performance\n\n" + refactored;
      
      // Make a few more visible changes
      refactored = refactored.replace(/function/g, "function /* optimized */");
      refactored = refactored.replace(/const /g, "const /* improved */ ");
      
      // Add some whitespace formatting
      refactored = refactored.replace(/;/g, ";\n");
      
      resolve(refactored);
    }, 2000);
  });
};

// Configuration check for AI integration
export const isGeminiConfigured = (): boolean => {
  // This would check if the API key is configured
  // For demo purposes, we'll always return true
  return true;
};

// Store API key
export const configureGemini = (config: {
  apiKey: string;
  model: string;
  temperature: number;
  maxOutputTokens: number;
}): void => {
  // In a real implementation, this would store the config
  console.log("Gemini configured with:", config);
  localStorage.setItem("gemini_configured", "true");
};

// Get stored API key
export const getStoredApiKey = (): string => {
  // In a real implementation, this would retrieve the stored API key
  return "";
};

// Clear stored API key
export const clearApiKey = (): void => {
  // In a real implementation, this would clear the stored API key
  localStorage.removeItem("gemini_configured");
};
