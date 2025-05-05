import { TestCase } from '../types';

interface TestGenerationPrompt {
  systemPrompt: string;
  userPrompt: (functionName: string, language: string, code: string) => string;
  parseResponse: (response: string) => TestCase;
}

const baseSystemPrompt = `You are an expert software test engineer. Your task is to generate comprehensive test cases for the given function.
Follow these strict guidelines:
1. Generate test cases that cover all edge cases, error conditions, and normal operation
2. Include clear assertions and error messages
3. Follow the language's testing best practices and conventions
4. Ensure tests are deterministic and reproducible
5. Include proper setup and teardown if needed
6. Document test cases with clear descriptions
7. Use meaningful test data that demonstrates the function's behavior`;

const testTypePrompts: Record<string, TestGenerationPrompt> = {
  positive: {
    systemPrompt: `${baseSystemPrompt}
Focus on testing normal operation with valid inputs.
Include tests for:
- Typical use cases
- Various valid input combinations
- Expected output validation
- Return type verification`,
    userPrompt: (functionName: string, language: string, code: string) => 
      `Generate positive test cases for the following ${language} function:
\`\`\`${language}
${code}
\`\`\`
Function name: ${functionName}
Focus on testing normal operation with valid inputs.`,
    parseResponse: (response: string) => ({
      id: 0,
      name: "Positive Test Case",
      type: "Positive Case",
      code: response,
      description: "Tests normal operation with valid inputs"
    })
  },
  negative: {
    systemPrompt: `${baseSystemPrompt}
Focus on testing error handling and invalid inputs.
Include tests for:
- Invalid input types
- Out of range values
- Null/undefined handling
- Error message verification
- Exception type checking`,
    userPrompt: (functionName: string, language: string, code: string) =>
      `Generate negative test cases for the following ${language} function:
\`\`\`${language}
${code}
\`\`\`
Function name: ${functionName}
Focus on testing error handling and invalid inputs.`,
    parseResponse: (response: string) => ({
      id: 0,
      name: "Negative Test Case",
      type: "Negative Case",
      code: response,
      description: "Tests error handling and invalid inputs"
    })
  },
  edge: {
    systemPrompt: `${baseSystemPrompt}
Focus on testing edge cases and boundary conditions.
Include tests for:
- Empty inputs
- Maximum/minimum values
- Boundary conditions
- Special characters
- Edge case combinations`,
    userPrompt: (functionName: string, language: string, code: string) =>
      `Generate edge case test cases for the following ${language} function:
\`\`\`${language}
${code}
\`\`\`
Function name: ${functionName}
Focus on testing edge cases and boundary conditions.`,
    parseResponse: (response: string) => ({
      id: 0,
      name: "Edge Case Test",
      type: "Edge Case",
      code: response,
      description: "Tests edge cases and boundary conditions"
    })
  },
  performance: {
    systemPrompt: `${baseSystemPrompt}
Focus on testing performance characteristics.
Include tests for:
- Large input handling
- Time complexity verification
- Memory usage monitoring
- Resource cleanup
- Performance benchmarks`,
    userPrompt: (functionName: string, language: string, code: string) =>
      `Generate performance test cases for the following ${language} function:
\`\`\`${language}
${code}
\`\`\`
Function name: ${functionName}
Focus on testing performance characteristics.`,
    parseResponse: (response: string) => ({
      id: 0,
      name: "Performance Test",
      type: "Performance Case",
      code: response,
      description: "Tests performance characteristics"
    })
  },
  concurrency: {
    systemPrompt: `${baseSystemPrompt}
Focus on testing concurrent execution.
Include tests for:
- Thread safety
- Race conditions
- Deadlock prevention
- Resource contention
- Concurrent access patterns`,
    userPrompt: (functionName: string, language: string, code: string) =>
      `Generate concurrency test cases for the following ${language} function:
\`\`\`${language}
${code}
\`\`\`
Function name: ${functionName}
Focus on testing concurrent execution.`,
    parseResponse: (response: string) => ({
      id: 0,
      name: "Concurrency Test",
      type: "Concurrency Case",
      code: response,
      description: "Tests concurrent execution"
    })
  }
};

export const getTestGenerationPrompt = (
  testType: string,
  functionName: string,
  language: string,
  code: string
): { systemPrompt: string; userPrompt: string } => {
  const prompt = testTypePrompts[testType];
  if (!prompt) {
    throw new Error(`Unknown test type: ${testType}`);
  }
  return {
    systemPrompt: prompt.systemPrompt,
    userPrompt: prompt.userPrompt(functionName, language, code)
  };
};

export const parseTestResponse = (testType: string, response: string): TestCase => {
  const prompt = testTypePrompts[testType];
  if (!prompt) {
    throw new Error(`Unknown test type: ${testType}`);
  }
  return prompt.parseResponse(response);
}; 