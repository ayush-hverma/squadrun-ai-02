
import OpenAI from 'openai';

export async function refactorCodeWithOpenAI(
  code: string, 
  language: string, 
  apiKey: string
): Promise<{ refactoredCode: string, improvements: string[] }> {
  const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system", 
          content: `You are an expert code refactoring assistant. Refactor the following ${language} code to follow best practices, improve readability, performance, and maintainability. Provide a detailed explanation of improvements.`
        },
        {
          role: "user", 
          content: code
        }
      ],
      max_tokens: 4000,
    });

    const refactoredCode = response.choices[0].message.content?.trim() || code;
    
    // Generate improvements list
    const improvementsResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system", 
          content: "List specific improvements made to the code, focusing on best practices, readability, and maintainability."
        },
        {
          role: "user", 
          content: `Original Code:\n${code}\n\nRefactored Code:\n${refactoredCode}`
        }
      ],
      max_tokens: 1000,
    });

    const improvements = improvementsResponse.choices[0].message.content
      ?.split('\n')
      .filter(line => line.trim().length > 0) || [];

    return { 
      refactoredCode, 
      improvements 
    };
  } catch (error) {
    console.error("OpenAI Refactoring Error:", error);
    throw new Error("Failed to refactor code with OpenAI");
  }
}
