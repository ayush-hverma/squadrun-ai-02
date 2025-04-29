import { toast } from "sonner"; // Assuming 'sonner' is a toast library you are using

/**
 * Google Gemini API integration for code analysis and refactoring
 */

interface GeminiConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxOutputTokens?: number; // Changed name for Gemini
}

// Default configuration with placeholder API key
const defaultGeminiConfig: GeminiConfig = {
  apiKey: "AIzaSyAMranDv79YHxNAvMAyPGRVK0HsTbRgT2U", // Replace with your actual Google API key
  model: "gemini-1.5-pro-latest", // Use a suitable Gemini model
  temperature: 0.1, // Lower temperature for more deterministic results
  maxOutputTokens: 8192 // Sufficient tokens for code analysis (adjust as needed, 8192 is common for 1.5 Pro)
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
  return Boolean(geminiConfig.apiKey && geminiConfig.apiKey !== "YOUR_GOOGLE_API_KEY");
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
 * Make a request to Google Gemini API for code analysis or refactoring
 */
const callGeminiApi = async (
  prompt: string,
  systemInstruction: string, // Gemini often handles this separately or in prompt
  options?: { temperature?: number, maxOutputTokens?: number, stopSequences?: string[] }
): Promise<any> => {
  // Get API key from config
  const apiKey = geminiConfig.apiKey;

  if (!apiKey || apiKey === "YOUR_GOOGLE_API_KEY" || apiKey === "") {
    throw new Error("Google Gemini API key not configured properly. Please update the API key.");
  }

  const model = geminiConfig.model || defaultGeminiConfig.model;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey, // Use Gemini API key header
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] }, // Gemini system instruction structure
        contents: [ // Gemini content structure
          {
            role: "user", // User role for the main prompt
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: { // Gemini generation config
          temperature: options?.temperature ?? geminiConfig.temperature,
          maxOutputTokens: options?.maxOutputTokens ?? geminiConfig.maxOutputTokens,
          stopSequences: options?.stopSequences // Add stop sequences if provided
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      // Attempt to parse Gemini error structure
      const errorMessage = errorData.error?.message || JSON.stringify(errorData);
      throw new Error(`Gemini API error: ${errorMessage}`);
    }

    const data = await response.json();

    // Check for candidates and parts before accessing text
    if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content || !data.candidates[0].content.parts || data.candidates[0].content.parts.length === 0) {
        // Check if there are prompt feedback or safety issues
        if (data.promptFeedback) {
             throw new Error(`Gemini API error: Prompt blocked due to safety concerns (${data.promptFeedback.blockReason})`);
        }
        throw new Error("Invalid or empty response from Gemini API");
    }

    // Extract the text content
    const content = data.candidates[0].content.parts[0].text;

    if (!content) {
         if (data.candidates[0].finishReason) {
             // Handle potential finish reasons other than STOP, like SAFETY
             throw new Error(`Gemini API finished with reason: ${data.candidates[0].finishReason}`);
         }
         throw new Error("Received empty content from Gemini API");
    }


    return content; // Return the raw text content
  } catch (error) {
    console.error("Gemini API error:", error);
    throw error;
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
      return processAIResponse(rawResponse, analysisType); // Pass the raw text content
  } catch (error) {
     console.error("Gemini Code Analysis API error:", error);
     throw error; // Re-throw after logging
  }
};

/**
 * Generate an appropriate prompt based on the analysis type and language
 */
const getPromptForAnalysis = (code: string, language: string, analysisType: 'quality' | 'refactor'): string => {
  if (analysisType === 'quality') {
    // Keep the prompt structure requesting JSON, Gemini is good at this.
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
  // The 'content' here is the raw text from data.candidates[0].content.parts[0].text

  if (!content) {
    throw new Error("Invalid response content from Gemini");
  }

  if (analysisType === 'quality') {
    try {
      // Extract JSON from the response (handle cases where there might be markdown)
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) ||
                          content.match(/{[\s\S]*}/); // Fallback if no markdown block

      const jsonContent = jsonMatch
        ? jsonMatch[1] || jsonMatch[0]
        : content;

      // Clean up potential trailing commas or comments if necessary (basic attempt)
      const cleanedJsonContent = jsonContent.replace(/,\s*\]/g, ']').replace(/,\s*\}/g, '}').trim();

      return JSON.parse(cleanedJsonContent);

    } catch (error) {
      console.error("Failed to parse quality analysis JSON from Gemini:", error);
       // Log the raw content that failed to parse for debugging
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
 * API Interface for AI-powered code refactoring
 */
export const refactorCodeWithAI = async (code: string, language: string): Promise<string> => {
  try {
    // analyzeCodeWithAI now returns the processed content (string for refactor)
    return await analyzeCodeWithAI(code, language, 'refactor');
  } catch (error) {
    toast.error("AI refactoring failed", {
      description: error instanceof Error ? error.message : "Failed to refactor code with Gemini"
    });
    throw error; // Re-throw the error
  }
};

/**
 * API Interface for AI-powered code quality analysis
 */
export const analyzeCodeQualityWithAI = async (code: string, language: string) => {
  try {
     // analyzeCodeWithAI now returns the processed content (object for quality)
    return await analyzeCodeWithAI(code, language, 'quality');
  } catch (error) {
    toast.error("AI code quality analysis failed", {
      description: error instanceof Error ? error.message : "Failed to analyze code quality with Gemini"
    });
    throw error; // Re-throw the error
  }
};

/**
 * Get code completions from Gemini
 */
export const getCodeCompletion = async (
  prompt: string,
  language: string,
  maxTokens: number = 500 // Renamed parameter for clarity, maps to maxOutputTokens
): Promise<string> => {

  const systemInstruction = `You are a helpful code completion assistant for ${language}. Provide only the code to complete the user's input.`;

  try {
    // Call the generic API function
    const completion = await callGeminiApi(prompt, systemInstruction, {
        maxOutputTokens: maxTokens, // Pass renamed parameter
        temperature: 0.4, // Slightly higher temperature for creativity in completion
        stopSequences: ["```", "\n\n"] // Stop at code block endings or double newline
    });

    // Clean up the response by removing markdown code blocks if present
    // Note: Gemini might not always wrap completions in ```, but this handles it if it does.
    // Also trim any leading/trailing whitespace.
    return completion.replace(/```[a-z]*\n?|```$/g, '').trim();

  } catch (error) {
    console.error("Gemini code completion error:", error);
    toast.error("Code completion failed", {
      description: error instanceof Error ? error.message : "Failed to get code completion from Gemini"
    });
    throw error;
  }
};