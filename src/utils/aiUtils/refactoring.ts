
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
You are a senior-level software engineer specializing in production-grade refactoring with zero tolerance for deviation from functional integrity.

TASK: Refactor the provided code with **absolute precision**, maintaining **identical input/output behavior and side effects**. Apply only structural and quality improvements without altering any functional logic.

NON-NEGOTIABLE CONSTRAINTS — VIOLATIONS ARE STRICTLY FORBIDDEN:
1. DO NOT alter any logic, control flow, side effects, or computational behavior
2. DO NOT change function names, argument types, return values, or signatures
3. DO NOT add, remove, or replace libraries, imports, or packages
4. DO NOT introduce new functionality, features, or behavioral enhancements
5. DO NOT remove existing functionality, even if seemingly redundant
6. DO NOT produce any output other than the full refactored code
7. DO NOT add any comments, explanations, or markdown formatting

MANDATORY REFACTORING ACTIONS — EXECUTE ALL WHERE APPLICABLE:
1. Enforce **SOLID principles** — Single Responsibility, Open/Closed, etc.
2. Optimize algorithmic efficiency (time/space complexity) without behavior change
3. Remove code duplication by abstracting reusable logic into helpers/utilities
4. Improve semantic clarity — rename variables, functions, and classes meaningfully
5. Extract deeply nested or long logic into composable, testable units
6. Add complete, accurate **JSDoc/docstrings** to all public and non-trivial functions
7. Review and mitigate **security vulnerabilities** (e.g., XSS, injection risks) conservatively
8. Apply appropriate, well-established **design patterns** (Factory, Strategy, etc.) only if they reduce complexity without adding behavior
9. Refine **error handling** — introduce meaningful try/catch blocks, avoid silent failures
10. Fix latent bugs, unhandled edge cases, or race conditions while preserving original outcomes

STRICT OUTPUT POLICY:
- Output **ONLY** the complete refactored code — no Markdown, no comments, no explanations
- Maintain consistent indentation, line spacing, and file structure as in the original
- Include all necessary imports, initializations, and declarations to preserve execution
- The refactored code must be executable immediately with the same inputs and expected outputs 


FAILURE TO FOLLOW THESE INSTRUCTIONS OR STRICT OUTPUT POLICY WILL RESULT IN REJECTION OF THE OUTPUT.
`;

/**
 * Build a comprehensive refactoring prompt
 */
function buildRefactoringPrompt(code: string, language: string): string {
  return `
You are a senior-level software engineer. Refactor the following ${language} code with absolute precision.

OBJECTIVE: Improve code quality while preserving EXACT functionality, input/output behavior, and side effects.

STRICT RULES — NO EXCEPTIONS:
1. DO NOT change any logic, behavior, side effects, or data flows
2. DO NOT alter function names, signatures, return types, or argument structures
3. DO NOT add, remove, or modify dependencies, libraries, or package files (e.g., package.json)
4. DO NOT introduce new features or remove any existing functionality
5. DO NOT explain changes, add markdown formatting, or return anything other than the full refactored code

MANDATORY REFACTORING ACTIONS (where applicable):
- Enforce SOLID principles and separation of concerns
- Extract reusable logic into helper functions or classes
- Eliminate duplication and follow the DRY principle
- Improve naming conventions for clarity and intent
- Apply consistent, industry-standard formatting and indentation
- Add complete and accurate JSDoc/docstrings for all public and non-trivial functions
- Improve error handling with structured try/catch and specific error messages
- Address potential bugs, race conditions, and edge cases without changing behavior
- Apply appropriate design patterns ONLY if they simplify structure without altering behavior
- Optimize performance (e.g., reduce complexity, minimize redundant operations) without functional change
- Review and address any minor security concerns conservatively

RESPONSE REQUIREMENTS:
- Return ONLY the refactored code as plain text
- DO NOT include any markdown formatting, comments, explanations, or surrounding text
- Ensure the refactored code is executable with the same behavior and structure

CODE TO REFACTOR:
${code}
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
