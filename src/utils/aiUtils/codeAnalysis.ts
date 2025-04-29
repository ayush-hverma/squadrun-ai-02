
import { toast } from "sonner";
import { callGeminiApi } from "./geminiApi";

/**
 * Generate an appropriate prompt based on the analysis type and language
 */
const getPromptForAnalysis = (code: string, language: string, analysisType: 'quality' | 'refactor'): string => {
  if (analysisType === 'quality') {
    return `
      Analyze the following ${language} code for quality metrics.
      Provide a JSON response with the following structure:
      \`\`\`json
      {
        "score": <overall score from 0-100>,
        "summary": "<brief summary of code quality>",
        "categories": [
          {"name": "Readability", "score": <score from 0-100>},
          {"name": "Maintainability", "score": <score from 0-100>},
          {"name": "Performance", "score": <score from 0-100>},
          {"name": "Security", "score": <score from 0-100>},
          {"name": "Code Smell", "score": <score from 0-100>}
        ],
        "recommendations": [
          "<recommendation 1>",
          "<recommendation 2>",
          ...
        ],
        "snippets": [
          {"description": "<issue description>", "code": "<problematic code>", "line": <line number>},
          ...
        ]
      }
      \`\`\`
      Ensure the response is ONLY the JSON object within the \`\`\`json \`\`\` block.

      Code to analyze:
      \`\`\`${language}
      ${code}
      \`\`\`
    `;
  } else {
    return `
      Refactor the following ${language} code to improve its quality, readability, maintainability, and performance.
      Preserve functionality while applying best practices. Return ONLY the refactored code, ideally within a markdown code block (\`\`\`${language} ... \`\`\`) without any additional explanations or text.

      Original code:
      \`\`\`${language}
      ${code}
      \`\`\`
    `;
  }
};

/**
 * Process and transform the Gemini response based on analysis type
 */
const processAIResponse = (content: string, analysisType: 'quality' | 'refactor'): any => {
  if (!content) {
    throw new Error("Invalid response content from Gemini");
  }

  if (analysisType === 'quality') {
    try {
      // Extract JSON from the response (handle cases where there might be markdown)
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) ||
                        content.match(/{[\s\S]*}/);

      const jsonContent = jsonMatch
        ? jsonMatch[1] || jsonMatch[0]
        : content;

      // Clean up potential trailing commas or comments if necessary
      const cleanedJsonContent = jsonContent.replace(/,\s*\]/g, ']').replace(/,\s*\}/g, '}').trim();

      return JSON.parse(cleanedJsonContent);

    } catch (error) {
      console.error("Failed to parse quality analysis JSON from Gemini:", error);
      console.error("Raw content that failed to parse:", content);
      throw new Error("Failed to parse the Gemini response for quality analysis. Check console for raw output.");
    }
  } else {
    // For refactoring, extract code from markdown code blocks if present
    const codeMatch = content.match(/```(?:\w+)?\s*([\s\S]*?)\s*```/);
    // Return the content inside the code block, or the raw content if no block found
    return codeMatch ? codeMatch[1].trim() : content.trim();
  }
};

/**
 * Make a request to Google Gemini API for code analysis
 */
export const analyzeCodeWithAI = async (
  code: string,
  language: string,
  analysisType: 'quality' | 'refactor'
): Promise<any> => {
  const systemInstruction = "You are an expert code analyzer and refactorer. Provide detailed, accurate, and professional analysis or refactored code.";
  const prompt = getPromptForAnalysis(code, language, analysisType);

  try {
      const rawResponse = await callGeminiApi(prompt, systemInstruction);
      return processAIResponse(rawResponse, analysisType);
  } catch (error) {
     console.error("Gemini Code Analysis API error:", error);
     throw error;
  }
};

/**
 * API Interface for AI-powered code refactoring
 */
export const refactorCodeWithAI = async (code: string, language: string): Promise<string> => {
  try {
    return await analyzeCodeWithAI(code, language, 'refactor');
  } catch (error) {
    toast.error("AI refactoring failed", {
      description: error instanceof Error ? error.message : "Failed to refactor code with Gemini"
    });
    throw error;
  }
};

/**
 * API Interface for AI-powered code quality analysis
 */
export const analyzeCodeQualityWithAI = async (code: string, language: string) => {
  try {
    return await analyzeCodeWithAI(code, language, 'quality');
  } catch (error) {
    toast.error("AI code quality analysis failed", {
      description: error instanceof Error ? error.message : "Failed to analyze code quality with Gemini"
    });
    throw error;
  }
};
