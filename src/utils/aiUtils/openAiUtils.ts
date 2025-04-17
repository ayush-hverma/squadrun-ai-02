import { toast } from "sonner";

/**
 * OpenAI API integration for code analysis and refactoring
 */

interface OpenAIConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

// Default configuration with hardcoded API key
const defaultConfig: OpenAIConfig = {
  apiKey: "YOUR_OPENAI_API_KEY", // Replace with your actual API key
  model: "gpt-4o", // Use the latest model
  temperature: 0.2, // Lower temperature for more deterministic results
  maxTokens: 8192 // Sufficient tokens for code analysis
};

// Global configuration
let openAIConfig: OpenAIConfig = { ...defaultConfig };

/**
 * Set the OpenAI API key and optional configuration
 */
export const configureOpenAI = (config: Partial<OpenAIConfig>): void => {
  openAIConfig = { ...openAIConfig, ...config };
};

/**
 * Check if OpenAI is configured with an API key
 */
export const isOpenAIConfigured = (): boolean => {
  return Boolean(openAIConfig.apiKey && openAIConfig.apiKey !== "YOUR_OPENAI_API_KEY");
};

/**
 * Get the stored API key
 */
export const getStoredApiKey = (): string => {
  return openAIConfig.apiKey;
};

/**
 * Clear the stored API key
 */
export const clearApiKey = (): void => {
  openAIConfig.apiKey = defaultConfig.apiKey;
};

/**
 * Make a request to OpenAI API for code analysis
 */
export const analyzeCodeWithAI = async (
  code: string, 
  language: string,
  analysisType: 'quality' | 'refactor'
): Promise<any> => {
  // Get API key from config
  const apiKey = openAIConfig.apiKey;
  
  if (!apiKey || apiKey === "YOUR_OPENAI_API_KEY") {
    throw new Error("OpenAI API key not configured properly in the source code. Please update the API key in openAiUtils.ts");
  }
  
  try {
    const prompt = getPromptForAnalysis(code, language, analysisType);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: openAIConfig.model,
        messages: [
          {
            role: "system",
            content: "You are an expert code analyzer and refactorer. Provide detailed, accurate, and professional analysis of code."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: openAIConfig.temperature,
        max_tokens: openAIConfig.maxTokens
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to get response from OpenAI");
    }
    
    const data = await response.json();
    return processAIResponse(data, analysisType);
    
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw error;
  }
};

/**
 * Generate an appropriate prompt based on the analysis type and language
 */
const getPromptForAnalysis = (code: string, language: string, analysisType: 'quality' | 'refactor'): string => {
  if (analysisType === 'quality') {
    return `
      Analyze the following ${language} code for quality metrics. 
      Provide a JSON response with the following structure:
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
      
      Code to analyze:
      \`\`\`${language}
      ${code}
      \`\`\`
    `;
  } else {
    return `
      Refactor the following ${language} code to improve its quality, readability, maintainability, and performance.
      Preserve functionality while applying best practices. Return only the refactored code without explanations.
      
      Original code:
      \`\`\`${language}
      ${code}
      \`\`\`
    `;
  }
};

/**
 * Process and transform the AI response based on analysis type
 */
const processAIResponse = (response: any, analysisType: 'quality' | 'refactor'): any => {
  const content = response.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error("Invalid response from OpenAI");
  }
  
  if (analysisType === 'quality') {
    try {
      // Extract JSON from the response (handle cases where there might be markdown)
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                        content.match(/{[\s\S]*}/);
      
      const jsonContent = jsonMatch 
        ? jsonMatch[1] || jsonMatch[0]
        : content;
        
      return JSON.parse(jsonContent);
    } catch (error) {
      console.error("Failed to parse quality analysis:", error);
      throw new Error("Failed to parse the AI response for quality analysis");
    }
  } else {
    // For refactoring, extract code from markdown code blocks if present
    const codeMatch = content.match(/```(?:\w+)?\s*([\s\S]*?)\s*```/);
    return codeMatch ? codeMatch[1] : content;
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
      description: error instanceof Error ? error.message : "Failed to refactor code with AI"
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
      description: error instanceof Error ? error.message : "Failed to analyze code quality with AI"
    });
    throw error;
  }
};
