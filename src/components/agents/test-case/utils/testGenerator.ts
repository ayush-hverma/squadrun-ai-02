
import { extractFunctionNames } from './functionExtractor';
import { getTestTemplates, generateGenericTestCases } from './testTemplates';
import { TestCase } from '../types';

export const generateTestCasesForLanguage = (
  fileContent: string | null, 
  fileName: string | null,
  fileLanguage: string
): TestCase[] => {
  if (!fileContent) return [];
  const language = fileLanguage;
  const functionNames = extractFunctionNames(fileContent, language);
  const testCases: TestCase[] = [];

  for (let i = 0; i < Math.min(functionNames.length, 5); i++) {
    const fn = functionNames[i];
    testCases.push(...generateTestsForFunction(fn, language, i + 1));
  }

  if (testCases.length === 0) {
    testCases.push(...generateGenericTestCases(language, fileName));
  }
  return testCases;
};

export const generateTestsForFunction = (
  functionName: string, 
  language: string, 
  id: number
): TestCase[] => {
  const templates = getTestTemplates(language, functionName);
  const testTypes = ['positive', 'negative', 'edge', 'performance', 'concurrency'];
  const result: TestCase[] = [];

  const selectedTypes = testTypes.filter((_, index) => index === id % testTypes.length || index === (id + 2) % testTypes.length);
  for (const type of selectedTypes) {
    const testName = `Test ${functionName} ${type.replace(/([A-Z])/g, ' $1').toLowerCase()}`;
    const testType = type.charAt(0).toUpperCase() + type.slice(1) + ' Case';
    const template = templates[type as keyof typeof templates];
    result.push({
      id: result.length + 1,
      name: testName,
      type: testType,
      code: template.code,
      description: template.description
    });
  }
  return result;
};

export const getRandomFailureReason = (testType: string): string => {
  const failures: Record<string, string[]> = {
    'Positive Case': ["Assertion failed: Expected 'expected_output', got 'actual_output'", "Function returned null", "Expected true but got false"],
    'Edge Case': ["Function threw unexpected exception", "Empty input handling failed", "Boundary condition not handled correctly"],
    'Exception Handling': ["Expected exception not thrown", "Wrong exception type thrown", "Exception message doesn't match expected pattern"],
    'Performance': ["Execution time exceeded threshold", "Memory usage too high", "Operation timed out"],
    'Concurrency': ["Race condition detected", "Thread deadlock occurred", "Concurrent modification exception"]
  };
  const failureCategory = failures[testType as keyof typeof failures] || failures['Positive Case'];
  return failureCategory[Math.floor(Math.random() * failureCategory.length)];
};
