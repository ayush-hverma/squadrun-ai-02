
import { callGeminiApi } from './geminiApi';

/**
 * Refactor code using AI
 * 
 * @param code The source code to refactor
 * @param language Programming language of the code
 * @returns The refactored code
 */
export async function refactorCodeWithAI(code: string, language: string): Promise<string> {
  const prompt = buildRefactoringPrompt(code, language);
  
  try {
    const response = await callGeminiApi(prompt, REFACTORING_SYSTEM_PROMPT);
    return extractRefactoredCode(response, code);
  } catch (error) {
    console.error("Error during AI refactoring:", error);
    throw new Error("Failed to refactor code. Please try again.");
  }
}

// System prompt specifically designed for refactoring tasks
const REFACTORING_SYSTEM_PROMPT = `
You are an expert software engineer specializing in code refactoring and best practices.
Your task is to refactor the provided code while preserving its exact functionality.
DO NOT suggest changing dependencies or package.json.
Return ONLY the refactored code WITHOUT explanations or markdown formatting.
`;

/**
 * Build a comprehensive refactoring prompt
 */
function buildRefactoringPrompt(code: string, language: string): string {
  return `
Please refactor the following ${language} code to improve:
1. Readability
2. Maintainability
3. Performance
4. Security
5. Code organization

Apply these refactoring techniques as appropriate:
- Extract methods/functions for reusability
- Use meaningful naming conventions
- Apply proper formatting and indentation
- Eliminate code duplication
- Follow the DRY (Don't Repeat Yourself) principle
- Use appropriate design patterns
- Add JSDoc/docstring comments for functions and classes
- Fix any bugs or potential issues
- Improve error handling
- Optimize for performance where applicable

IMPORTANT: Do NOT modify package.json or suggest any changes to dependencies.
Return ONLY the refactored code, without explanations or additional text.

CODE TO REFACTOR:
\`\`\`${language}
${code}
\`\`\`

Return ONLY the refactored code as plain text, without any markdown formatting.
`;
}

/**
 * Extract the refactored code from the AI response
 */
function extractRefactoredCode(response: string, originalCode: string): string {
  // Remove any markdown code blocks if present
  let refactoredCode = response.replace(/```[\w]*\n/g, '').replace(/```$/g, '');
  
  // Trim any explanations before or after the code
  refactoredCode = refactoredCode.trim();
  
  // If the response seems too short or empty, return the original code
  if (!refactoredCode || refactoredCode.length < originalCode.length / 10) {
    console.warn("AI response seems invalid, returning original code");
    return originalCode;
  }
  
  return refactoredCode;
}
