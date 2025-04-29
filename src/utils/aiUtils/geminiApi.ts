
import { toast } from "sonner";
import { getGeminiConfig } from "./geminiConfig";

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

  const model = geminiConfig.model || "gemini-1.5-pro-latest";
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  try {
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
      const errorMessage = errorData.error?.message || JSON.stringify(errorData);
      throw new Error(`Gemini API error: ${errorMessage}`);
    }

    const data = await response.json();

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
    console.error("Gemini API error:", error);
    throw error;
  }
};
