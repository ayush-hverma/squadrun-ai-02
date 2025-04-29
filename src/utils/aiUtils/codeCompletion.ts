
import { toast } from "sonner";
import { callGeminiApi } from "./geminiApi";

/**
 * Get code completions from Gemini
 */
export const getCodeCompletion = async (
  prompt: string,
  language: string,
  maxTokens: number = 500
): Promise<string> => {
  const systemInstruction = `You are a helpful code completion assistant for ${language}. Provide only the code to complete the user's input.`;

  try {
    const completion = await callGeminiApi(prompt, systemInstruction, {
        maxOutputTokens: maxTokens,
        temperature: 0.4,
        stopSequences: ["```", "\n\n"]
    });

    // Clean up the response by removing markdown code blocks if present
    return completion.replace(/```[a-z]*\n?|```$/g, '').trim();
  } catch (error) {
    console.error("Gemini code completion error:", error);
    toast.error("Code completion failed", {
      description: error instanceof Error ? error.message : "Failed to get code completion from Gemini"
    });
    throw error;
  }
};
