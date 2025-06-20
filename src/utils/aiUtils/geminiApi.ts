import { toast } from "sonner";

// Default configuration
const DEFAULT_CONFIG = {
  apiKey: import.meta.env.VITE_GEMINI_API_KEY, 
  model: "gemini-1.5-pro",
  temperature: 0.1,
  maxOutputTokens: 8000
};

// Store configuration in localStorage
const CONFIG_KEY = "gemini_config";

/**
 * Configure Gemini API settings 
 */
export const configureGemini = (config: Partial<typeof DEFAULT_CONFIG>) => {
  const currentConfig = getGeminiConfig();
  const newConfig = { ...currentConfig, ...config };
  localStorage.setItem(CONFIG_KEY, JSON.stringify(newConfig));
  return newConfig;
};

/**
 * Check if Gemini is configured
 */
export const isGeminiConfigured = () => {
  const config = getGeminiConfig();
  return !!config.apiKey && config.apiKey !== "YOUR_GOOGLE_API_KEY";
};

/**
 * Get stored API key
 */
export const getStoredApiKey = () => {
  const config = getGeminiConfig();
  return config.apiKey;
};

/**
 * Clear stored API key
 */
export const clearApiKey = () => {
  const config = getGeminiConfig();
  config.apiKey = "";
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
};

/**
 * Get Gemini configuration
 */
export const getGeminiConfig = () => {
  const stored = localStorage.getItem(CONFIG_KEY);
  return stored ? JSON.parse(stored) : { ...DEFAULT_CONFIG };
};

/**
 * Make a request to Google Gemini API
 */
export const callGeminiApi = async (
  prompt: string,
  systemInstruction: string,
  options?: { temperature?: number, maxOutputTokens?: number, stopSequences?: string[] }
): Promise<any> => {
  // Get API key from config
  const geminiConfig = getGeminiConfig();
  const apiKey = geminiConfig.apiKey;

  if (!apiKey || apiKey === "YOUR_GOOGLE_API_KEY" || apiKey === "") {
    throw new Error("Google Gemini API key not configured properly. Please update the API key.");
  }

  const model = geminiConfig.model || "gemini-1.5-pro";
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  try {
    console.log('Making Gemini API request:', {
      model,
      promptLength: prompt.length,
      systemInstructionLength: systemInstruction.length,
      options
    });

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: options?.temperature ?? geminiConfig.temperature,
          maxOutputTokens: options?.maxOutputTokens ?? geminiConfig.maxOutputTokens,
          stopSequences: options?.stopSequences
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error response:', errorData);
      const errorMessage = errorData.error?.message || JSON.stringify(errorData);
      throw new Error(`Gemini API error: ${errorMessage}`);
    }

    const data = await response.json();
    console.log('Gemini API response:', {
      hasCandidates: !!data.candidates,
      candidatesLength: data.candidates?.length,
      hasContent: !!data.candidates?.[0]?.content,
      hasParts: !!data.candidates?.[0]?.content?.parts,
      partsLength: data.candidates?.[0]?.content?.parts?.length
    });

    // Check for candidates and parts before accessing text
    if (!data.candidates || data.candidates.length === 0 || 
        !data.candidates[0].content || !data.candidates[0].content.parts || 
        data.candidates[0].content.parts.length === 0) {
        
        if (data.promptFeedback) {
             throw new Error(`Gemini API error: Prompt blocked due to safety concerns (${data.promptFeedback.blockReason})`);
        }
        throw new Error("Invalid or empty response from Gemini API");
    }

    // Extract the text content
    const content = data.candidates[0].content.parts[0].text;

    if (!content) {
         if (data.candidates[0].finishReason) {
             throw new Error(`Gemini API finished with reason: ${data.candidates[0].finishReason}`);
         }
         throw new Error("Received empty content from Gemini API");
    }

    return content;
  } catch (error) {
    console.error("Gemini API error:", {
      error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined,
      endpoint,
      model,
      promptLength: prompt.length
    });
    throw error;
  }
};
