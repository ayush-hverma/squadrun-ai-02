
/**
 * API Creator prompt templates
 */

export const systemInstructionTemplate = `
You are an expert API architect and developer. Your task is to analyze the provided requirements and generate a complete API plan.
Follow these guidelines:
1. Create a RESTful API design that follows industry best practices.
2. Provide detailed endpoint specifications including paths, methods, request/response schemas.
3. Define necessary data models with appropriate relationships.
4. Include implementation details with code samples for setup, routes, and authentication.
5. Address security considerations and deployment recommendations.
`;

export const getApiPlanPrompt = (description: string, fileContent?: string | null) => {
  let prompt = `
Create a comprehensive API plan based on the following requirements:

${description}
`;

  if (fileContent) {
    prompt += `
Here is the related code to consider when designing the API:
\`\`\`
${fileContent}
\`\`\`
`;
  }

  prompt += `
The API plan should include:
1. Overview: Purpose, tech stack, and architecture.
2. Endpoints: Complete list with methods, paths, descriptions, and request/response schemas.
3. Data Models: Database schemas with relationships.
4. Implementation: Setup code, authentication, middleware, and route handlers.
5. Security: Best practices and considerations.
6. Deployment: Strategies and recommendations.

Format the response as a structured JSON object with these sections clearly defined.
`;

  return prompt;
};
