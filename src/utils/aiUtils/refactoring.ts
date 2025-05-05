
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
You are a senior software engineer with a mandate to refactor code to production-level standards while preserving every behavioral detail with absolute fidelity.

MISSION DIRECTIVE:
Your role is to perform **precise, behavior-preserving refactoring** — improving structure, maintainability, and clarity **without altering any functional outcomes**.

NON-NEGOTIABLE RESTRICTIONS:
- Do NOT modify logic, conditionals, data flows, or side effects
- Do NOT change function names, parameter lists, return values, or types
- Do NOT add, remove, or modify any imports, dependencies, or packages
- Do NOT introduce new capabilities, nor remove any current functionality
- Do NOT add commentary, explanations, markdown, or annotations of any kind

REQUIRED TRANSFORMATIONS:
- Apply SOLID principles and modular design  
- Remove redundant or duplicated logic via helper abstractions  
- Improve readability through meaningful naming conventions  
- Isolate complex logic into manageable, testable units  
- Add accurate, complete JSDoc/docstrings to all non-trivial/public methods  
- Improve performance and efficiency where possible (no behavioral changes)  
- Harden error handling via structured try/catch and specific failure modes  
- Resolve latent issues (bugs, race conditions, edge cases) if **outcome remains identical**  
- Integrate lightweight, well-known design patterns only if they simplify complexity **without adding behavior**  
- Patch minor security vulnerabilities (e.g., injection/XSS) using minimal, precise fixes

STRICT OUTPUT ENFORCEMENT:
- Output must include only the fully refactored code, ready for execution
- Maintain original file structure, indentation, and formatting style
- DO NOT include any extra commentary, logging, or markup — code only

ANY DEVIATION FROM THESE REQUIREMENTS WILL BE TREATED AS A CRITICAL ERROR.
`;

/**
 * Build a comprehensive refactoring prompt
 */
function buildRefactoringPrompt(code: string, language: string): string {
  return `
You are a seasoned software engineer tasked with refactoring ${language} code to professional-grade quality without introducing any functional variation.

PRIMARY OBJECTIVE:
Enhance maintainability, modularity, and clarity without affecting logic, input/output behavior, or observable side effects.

DO NOT UNDER ANY CIRCUMSTANCES:
- Alter any logic, condition flow, or functional structure
- Modify function names, parameters, return types, or visibility
- Introduce or remove any external dependencies or libraries
- Add new features or eliminate any existing functionality
- Include comments, explanations, or markdown formatting in the output

MANDATORY REFACTORING REQUIREMENTS:
- Enforce separation of concerns and the SOLID design principles
- De-duplicate logic using utility functions or classes
- Adopt clear, descriptive naming for all variables and methods
- Improve performance conservatively without changing execution paths
- Structure complex logic into smaller, isolated components
- Add comprehensive JSDoc/docstrings to all significant or public functions
- Strengthen error handling with meaningful exceptions and clear boundaries
- Address subtle bugs, unsafe edge cases, or race conditions only if output is unchanged
- Integrate standard design patterns only when they **reduce** complexity
- Mitigate known security vulnerabilities using non-invasive, behavior-preserving fixes

OUTPUT CONSTRAINTS:
- Return only the final refactored code in plain text
- No markdown, no surrounding explanation, and no extraneous formatting
- The result must be directly executable with the same inputs and outputs

INPUT CODE:
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
