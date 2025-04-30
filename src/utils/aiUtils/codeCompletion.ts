
import { toast } from "sonner";
import { callGeminiApi } from "./geminiApi";

/**
 * Get code completions from Gemini
 */
export const getCodeCompletion = async (
  prompt: string,
  language: string,
  maxTokens: number = 1500
): Promise<string> => {
  const systemInstruction = `
You are an expert ${language.toUpperCase()} developer tasked with completing code snippets with professional-quality implementations.

CRITICAL REQUIREMENTS:
1. Generate ONLY executable ${language.toUpperCase()} code that compiles without errors
2. Follow all language-specific best practices and conventions
3. Include proper error handling appropriate for the context
4. Use modern syntax and APIs appropriate for production environments
5. Write code that is secure, efficient, and maintainable
6. Add concise comments for complex logic or non-obvious decisions
7. Maintain consistent coding style with the provided code snippet
8. Provide complete implementations that satisfy the apparent requirements
9. Use strong typing where applicable (for typed languages)
10. Consider edge cases and add appropriate validation

DO NOT:
- Include explanations outside of code comments
- Generate incomplete code fragments
- Add markdown formatting or code block delimiters
- Suggest alternative approaches outside the code
- Include TODOs or placeholder comments

Return ONLY the completed code, ready to be inserted directly into a code editor.
`;

  try {
    const completion = await callGeminiApi(prompt, systemInstruction, {
        maxOutputTokens: maxTokens,
        temperature: 0.1,
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

// For backward compatibility
export const codeCompletion = getCodeCompletion;
