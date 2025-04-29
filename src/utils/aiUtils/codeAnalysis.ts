
import { toast } from "sonner";
import { callGeminiApi } from "./geminiApi";

/**
 * Generate an appropriate prompt based on the analysis type and language
 */
const getPromptForAnalysis = (code: string, language: string, analysisType: 'quality' | 'refactor'): string => {
  if (analysisType === 'quality') {
    return `
      You are an expert Code Quality Analyzer. Your task is to meticulously analyze the provided `${language}` code snippet and evaluate its quality across several key metrics.

Perform a detailed analysis focusing on the following categories:

1.  Readability: How easy is the code to understand? Consider factors like variable naming, function length, code structure, comments, and adherence to common style guides.
2.  Maintainability: How easy is the code to modify, debug, and extend? Look for modularity, code duplication, complexity, and clear dependencies.
3.  Performance: How efficient is the code in terms of time and resource usage? Identify potential bottlenecks, inefficient algorithms, or unnecessary computations.
4.  Security: Are there any obvious security vulnerabilities or insecure practices? Check for issues like improper input handling, potential injection flaws, or insecure use of libraries.
5.  Code Smell: Are there any indicators of deeper problems in the code, even if they don't cause immediate errors? Look for anti-patterns, excessive complexity, or unclear intent.

Based on your analysis, provide an assessment and generate a JSON response with the following structure:
  \`\`\` json
  {
    "overall_score": <overall score from 0-100, representing the aggregate quality>,
    "summary": "<a concise, professional summary of the code's overall quality, highlighting major strengths and weaknesses>",
    "category_scores": [
      {"name": "Readability", "score": <score from 0-100 for readability>},
      {"name": "Maintainability", "score": <score from 0-100 for maintainability>},
      {"name": "Performance", "score": <score from 0-100 for performance>},
      {"name": "Security", "score": <score from 0-100 for security>},
      {"name": "Code Smell", "score": <score from 0-100 for code smell>}
    ],
    "recommendations": [
      "<Clear, actionable recommendation 1 for improving code quality>",
      "<Clear, actionable recommendation 2 for improving code quality>",
      ... // Include specific recommendations covering the identified issues
    ],
    "problem_snippets": [
      {"description": "<Brief description of the specific issue found>", "code": "<The exact problematic code snippet>", "line": <The approximate starting line number in the original code>},
      ... // Include multiple examples of significant issues found
    ]
  }
      \`\`\`
      Ensure the response is ONLY the JSON object within the \`\`\`json \`\`\` block.
      Ensure the JSON is valid and correctly formatted.
      Provide meaningful scores (0-100) for each category and the overall score, reflecting the severity and number of issues found.
      Recommendations should be specific and guide the user on how to improve the code.
      Code to analyze:
      ${code}
      \`\`\`
    `;
  } else {
    return `
      You are an expert software engineer specializing in code refactoring and optimization. Your task is to take the provided code snippet in `${language}` and refactor it to meet high standards of quality, readability, maintainability, and performance, while strictly preserving its original functionality.

Approach the refactoring process by considering the following aspects:

1.  Functionality Preservation: The refactored code must behave identically to the original code from an external perspective. No changes to the intended behavior or outputs are allowed.
2.  Code Quality: Improve the overall structure, design, and robustness of the code.
3.  Readability: Enhance clarity and ease of understanding. This includes:
     Using descriptive variable, function, and class names.
     Simplifying complex logic or expressions.
     Ensuring consistent formatting and indentation.
     Adding concise, single-line comments or docstrings only where the code's purpose is not immediately obvious from the code itself. Avoid excessive or redundant comments.
4.  Maintainability: Make the code easier to modify, debug, and extend in the future. This involves:
     Reducing code duplication (DRY principle).
     Improving modularity and separation of concerns.
     Simplifying control flow.
     Minimizing dependencies where appropriate.
5.  Performance: Identify and eliminate potential bottlenecks or inefficiencies. This might include:
     Optimizing algorithms or data structures.
     Reducing unnecessary computations or resource usage.
     Improving the efficiency of loops or conditional statements.
     Considering language-specific performance best practices.
6.  Best Practices: Apply widely accepted coding standards and idiomatic patterns for the `${language}` programming language.

Your final response must adhere to these strict output requirements:

 Return ONLY the refactored code.
 Do NOT include any introductory sentences, explanations of changes, analysis summaries, or concluding remarks outside the code block.
 
Code to analyze and refactor:

```${language}
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
