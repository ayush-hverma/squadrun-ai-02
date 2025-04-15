
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, PlayCircle, TestTube } from "lucide-react";
import CodeDisplay from "../CodeDisplay";

interface TestCaseProps {
  fileContent: string | null;
  fileName: string | null;
}

export default function TestCase({ fileContent, fileName }: TestCaseProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [testCases, setTestCases] = useState<any[] | null>(null);
  const [testResults, setTestResults] = useState<any | null>(null);

  // Reset test cases and results when file changes
  useEffect(() => {
    if (fileContent) {
      setTestCases(null);
      setTestResults(null);
    }
  }, [fileContent, fileName]);

  const getFileLanguage = () => {
    if (!fileName) return 'python';
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
    // Map file extensions to language names
    const extensionMap: Record<string, string> = {
      'py': 'python',
      'js': 'javascript',
      'ts': 'typescript',
      'jsx': 'react',
      'tsx': 'react-ts',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'go': 'go',
      'rb': 'ruby',
      'rs': 'rust',
      'php': 'php',
      'sh': 'bash',
      'sql': 'sql',
      'html': 'html',
      'css': 'css',
    };
    
    return extensionMap[extension] || 'python';
  };

  // Generate test case templates based on file language and content
  const generateTestCasesForLanguage = () => {
    if (!fileContent) return [];
    
    const language = getFileLanguage();
    const functionNames = extractFunctionNames(fileContent, language);
    const testCases = [];
    
    // Generate test cases for each detected function
    for (let i = 0; i < Math.min(functionNames.length, 5); i++) {
      const fn = functionNames[i];
      testCases.push(...generateTestsForFunction(fn, language, i + 1));
    }
    
    // If no functions found, generate generic test cases
    if (testCases.length === 0) {
      testCases.push(...generateGenericTestCases(language));
    }
    
    return testCases;
  };

  // Extract function names from code based on language
  const extractFunctionNames = (code: string, language: string): string[] => {
    const patterns: Record<string, RegExp> = {
      'python': /def\s+([a-zA-Z0-9_]+)\s*\(/g,
      'javascript': /function\s+([a-zA-Z0-9_]+)\s*\(|const\s+([a-zA-Z0-9_]+)\s*=\s*(\([^)]*\)|)\s*=>/g,
      'typescript': /function\s+([a-zA-Z0-9_]+)\s*\(|const\s+([a-zA-Z0-9_]+)\s*=\s*(\([^)]*\)|)\s*=>/g,
      'react': /function\s+([a-zA-Z0-9_]+)\s*\(|const\s+([a-zA-Z0-9_]+)\s*=\s*(\([^)]*\)|)\s*=>/g,
      'react-ts': /function\s+([a-zA-Z0-9_]+)\s*\(|const\s+([a-zA-Z0-9_]+)\s*=\s*(\([^)]*\)|)\s*=>/g,
      'java': /(?:public|private|protected|static|\s) +[\w\<\>\[\]]+\s+([a-zA-Z0-9_]+)\s*\(/g,
      'cpp': /[\w\<\>\[\]]+\s+([a-zA-Z0-9_]+)\s*\(/g,
      'c': /[\w\<\>\[\]]+\s+([a-zA-Z0-9_]+)\s*\(/g,
      'csharp': /(?:public|private|protected|static|\s) +[\w\<\>\[\]]+\s+([a-zA-Z0-9_]+)\s*\(/g,
      'go': /func\s+([a-zA-Z0-9_]+)\s*\(/g,
      'ruby': /def\s+([a-zA-Z0-9_]+)\s*(\(|$)/g,
      'rust': /fn\s+([a-zA-Z0-9_]+)\s*\(/g,
      'php': /function\s+([a-zA-Z0-9_]+)\s*\(/g,
    };
    
    const pattern = patterns[language] || patterns['python'];
    const functionNames = [];
    let match;
    
    while ((match = pattern.exec(code)) !== null) {
      // For JavaScript/TypeScript patterns that capture multiple groups
      const name = match[1] || match[2] || 'main';
      if (name && !functionNames.includes(name)) {
        functionNames.push(name);
      }
    }
    
    // If no functions found, add a generic function name
    if (functionNames.length === 0) {
      const fileClassName = fileName?.split('.')[0] || 'main';
      functionNames.push(fileClassName);
    }
    
    return functionNames;
  };

  // Generate tests for a specific function
  const generateTestsForFunction = (functionName: string, language: string, id: number) => {
    const testTemplates = {
      'python': {
        positive: `def test_${functionName}_valid_input():\n    # Arrange\n    input_value = "example_input"\n    expected = "expected_output"\n    \n    # Act\n    result = ${functionName}(input_value)\n    \n    # Assert\n    assert result == expected\n    assert result is not None`,
        negative: `def test_${functionName}_invalid_input():\n    # Arrange\n    with pytest.raises(ValueError):\n        # Act & Assert\n        ${functionName}(None)`,
        edge: `def test_${functionName}_edge_case():\n    # Arrange\n    input_value = ""\n    \n    # Act\n    result = ${functionName}(input_value)\n    \n    # Assert\n    assert result == ""`,
        performance: `def test_${functionName}_performance():\n    # Arrange\n    large_input = "x" * 1000\n    \n    # Act\n    start_time = time.time()\n    result = ${functionName}(large_input)\n    end_time = time.time()\n    \n    # Assert\n    assert end_time - start_time < 1.0  # Should complete in under 1 second`,
        concurrency: `def test_${functionName}_concurrent_access():\n    # Arrange\n    results = []\n    \n    def worker():\n        results.append(${functionName}("worker_input"))\n    \n    # Act\n    threads = [threading.Thread(target=worker) for _ in range(5)]\n    for t in threads:\n        t.start()\n    for t in threads:\n        t.join()\n    \n    # Assert\n    assert len(results) == 5`
      },
      'javascript': {
        positive: `test('${functionName} handles valid input correctly', () => {\n  // Arrange\n  const input = 'example_input';\n  const expected = 'expected_output';\n  \n  // Act\n  const result = ${functionName}(input);\n  \n  // Assert\n  expect(result).toBe(expected);\n  expect(result).not.toBeNull();\n});`,
        negative: `test('${functionName} throws error for invalid input', () => {\n  // Arrange & Act & Assert\n  expect(() => {\n    ${functionName}(null);\n  }).toThrow();\n});`,
        edge: `test('${functionName} handles edge cases', () => {\n  // Arrange\n  const input = '';\n  \n  // Act\n  const result = ${functionName}(input);\n  \n  // Assert\n  expect(result).toBe('');\n});`,
        performance: `test('${functionName} performs efficiently with large input', () => {\n  // Arrange\n  const largeInput = 'x'.repeat(1000);\n  \n  // Act\n  const startTime = Date.now();\n  const result = ${functionName}(largeInput);\n  const endTime = Date.now();\n  \n  // Assert\n  expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second\n});`,
        concurrency: `test('${functionName} handles concurrent calls', async () => {\n  // Arrange\n  const promises = [];\n  \n  // Act\n  for (let i = 0; i < 5; i++) {\n    promises.push(Promise.resolve(${functionName}('input')));\n  }\n  const results = await Promise.all(promises);\n  \n  // Assert\n  expect(results.length).toBe(5);\n});`
      },
      'typescript': {
        positive: `test('${functionName} handles valid input correctly', () => {\n  // Arrange\n  const input = 'example_input';\n  const expected = 'expected_output';\n  \n  // Act\n  const result = ${functionName}(input);\n  \n  // Assert\n  expect(result).toBe(expected);\n  expect(result).not.toBeNull();\n});`,
        negative: `test('${functionName} throws error for invalid input', () => {\n  // Arrange & Act & Assert\n  expect(() => {\n    ${functionName}(null as any);\n  }).toThrow();\n});`,
        edge: `test('${functionName} handles edge cases', () => {\n  // Arrange\n  const input = '';\n  \n  // Act\n  const result = ${functionName}(input);\n  \n  // Assert\n  expect(result).toBe('');\n});`,
        performance: `test('${functionName} performs efficiently with large input', () => {\n  // Arrange\n  const largeInput = 'x'.repeat(1000);\n  \n  // Act\n  const startTime = Date.now();\n  const result = ${functionName}(largeInput);\n  const endTime = Date.now();\n  \n  // Assert\n  expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second\n});`,
        concurrency: `test('${functionName} handles concurrent calls', async () => {\n  // Arrange\n  const promises: Promise<any>[] = [];\n  \n  // Act\n  for (let i = 0; i < 5; i++) {\n    promises.push(Promise.resolve(${functionName}('input')));\n  }\n  const results = await Promise.all(promises);\n  \n  // Assert\n  expect(results.length).toBe(5);\n});`
      },
      'java': {
        positive: `@Test\npublic void test${functionName}ValidInput() {\n    // Arrange\n    String input = "example_input";\n    String expected = "expected_output";\n    \n    // Act\n    String result = ${functionName}(input);\n    \n    // Assert\n    assertEquals(expected, result);\n    assertNotNull(result);\n}`,
        negative: `@Test(expected = IllegalArgumentException.class)\npublic void test${functionName}InvalidInput() {\n    // Arrange & Act & Assert\n    ${functionName}(null);\n}`,
        edge: `@Test\npublic void test${functionName}EdgeCase() {\n    // Arrange\n    String input = "";\n    \n    // Act\n    String result = ${functionName}(input);\n    \n    // Assert\n    assertEquals("", result);\n}`,
        performance: `@Test\npublic void test${functionName}Performance() {\n    // Arrange\n    StringBuilder sb = new StringBuilder();\n    for (int i = 0; i < 1000; i++) {\n        sb.append("x");\n    }\n    String largeInput = sb.toString();\n    \n    // Act\n    long startTime = System.currentTimeMillis();\n    String result = ${functionName}(largeInput);\n    long endTime = System.currentTimeMillis();\n    \n    // Assert\n    assertTrue(endTime - startTime < 1000); // Should complete in under 1 second\n}`,
        concurrency: `@Test\npublic void test${functionName}Concurrency() throws InterruptedException {\n    // Arrange\n    final List<String> results = new CopyOnWriteArrayList<>();\n    int threadCount = 5;\n    CountDownLatch latch = new CountDownLatch(threadCount);\n    \n    // Act\n    for (int i = 0; i < threadCount; i++) {\n        new Thread(() -> {\n            results.add(${functionName}("input"));\n            latch.countDown();\n        }).start();\n    }\n    latch.await(5, TimeUnit.SECONDS);\n    \n    // Assert\n    assertEquals(threadCount, results.size());\n}`
      },
      // Add more languages as needed...
    };
    
    // Default to Python if language isn't supported
    const templates = testTemplates[language] || testTemplates['python'];
    const testTypes = ['positive', 'negative', 'edge', 'performance', 'concurrency'];
    const result = [];
    
    // Select a few test types based on ID to ensure variety
    const selectedTypes = testTypes.filter((_, index) => index === (id % testTypes.length) || index === ((id + 2) % testTypes.length));
    
    for (const type of selectedTypes) {
      const testName = `Test ${functionName} ${type.replace(/([A-Z])/g, ' $1').toLowerCase()}`;
      const testType = type.charAt(0).toUpperCase() + type.slice(1) + ' Case';
      
      result.push({
        id: result.length + 1,
        name: testName,
        type: testType,
        code: templates[type as keyof typeof templates]
      });
    }
    
    return result;
  };

  // Generate generic test cases for when we can't extract function names
  const generateGenericTestCases = (language: string) => {
    const moduleName = fileName?.split('.')[0] || 'module';
    const templates: Record<string, any> = {
      'python': [
        { 
          name: "Test module initialization", 
          type: "Positive Case",
          code: `def test_module_init():\n    # Test that the module can be imported\n    import ${moduleName}\n    assert ${moduleName} is not None`
        },
        { 
          name: "Test module functionality", 
          type: "Functional Test",
          code: `def test_module_functionality():\n    # This is a placeholder test\n    # Adapt this to test the specific functionality of your module\n    import ${moduleName}\n    result = True  # Replace with actual functionality test\n    assert result is True`
        }
      ],
      'javascript': [
        { 
          name: "Test module import", 
          type: "Positive Case",
          code: `test('${moduleName} module can be imported', () => {\n  // Arrange & Act\n  const module = require('./${moduleName}');\n  \n  // Assert\n  expect(module).toBeDefined();\n});`
        },
        { 
          name: "Test module functionality", 
          type: "Functional Test",
          code: `test('${moduleName} module has expected functionality', () => {\n  // Arrange\n  const module = require('./${moduleName}');\n  \n  // Act & Assert\n  // Replace with actual functionality test\n  expect(typeof module).toBe('object');\n});`
        }
      ],
      // Add templates for other languages...
    };
    
    return templates[language] || templates['python'];
  };

  const handleGenerateTests = () => {
    if (!fileContent) return;
    
    setIsGenerating(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const generatedTestCases = generateTestCasesForLanguage();
      setTestCases(generatedTestCases);
      setIsGenerating(false);
    }, 1500);
  };

  const handleRunTests = () => {
    if (!testCases) return;
    
    setIsRunning(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Generate mock results based on the test cases
      const totalTests = testCases.length;
      const passedTests = Math.floor(totalTests * 0.7) + Math.floor(Math.random() * (totalTests * 0.3));
      const failedTests = totalTests - passedTests;
      
      // Create detailed results with random pass/fail distribution
      const details = testCases.map((test, index) => {
        // Determine if this test passed (weighted random)
        const passed = index < passedTests || Math.random() > 0.3;
        return {
          id: test.id,
          name: test.name,
          passed: passed,
          message: passed ? "Test passed" : getRandomFailureReason(test.type)
        };
      });
      
      // Calculate a somewhat realistic coverage percentage
      const coverage = Math.floor(65 + (passedTests / totalTests) * 25 + Math.random() * 10);
      
      const mockResults = {
        passed: passedTests,
        failed: failedTests,
        total: totalTests,
        coverage: Math.min(100, coverage),
        details: details
      };
      
      setTestResults(mockResults);
      setIsRunning(false);
    }, 2000);
  };

  // Generate realistic-looking failure messages
  const getRandomFailureReason = (testType: string) => {
    const failures = {
      'Positive Case': [
        "Assertion failed: Expected 'expected_output', got 'actual_output'",
        "Function returned null",
        "Expected true but got false"
      ],
      'Edge Case': [
        "Function threw unexpected exception",
        "Empty input handling failed",
        "Boundary condition not handled correctly"
      ],
      'Exception Handling': [
        "Expected exception not thrown",
        "Wrong exception type thrown",
        "Exception message doesn't match expected pattern"
      ],
      'Performance': [
        "Execution time exceeded threshold",
        "Memory usage too high",
        "Operation timed out"
      ],
      'Concurrency': [
        "Race condition detected",
        "Thread deadlock occurred",
        "Concurrent modification exception"
      ]
    };
    
    const failureCategory = failures[testType as keyof typeof failures] || failures['Positive Case'];
    return failureCategory[Math.floor(Math.random() * failureCategory.length)];
  };

  if (!fileContent) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="w-96 bg-squadrun-darker/50 border border-squadrun-primary/20">
          <CardContent className="p-6 text-center">
            <p className="text-squadrun-gray">
              Please upload a code file to generate test cases
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white mb-2">Test Case Generator</h1>
        <p className="text-squadrun-gray">
          Generate and run comprehensive test cases for your code to ensure quality and reliability.
        </p>
      </div>
      
      {!testCases ? (
        <div className="flex-1 flex flex-col">
          <Card className="mb-4 border border-squadrun-primary/20 bg-squadrun-darker/50 flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Code to Test</CardTitle>
            </CardHeader>
            <CardContent>
              <CodeDisplay code={fileContent} language={fileName?.split('.').pop() || 'python'} />
            </CardContent>
          </Card>
          
          <Button
            onClick={handleGenerateTests}
            className="bg-squadrun-primary hover:bg-squadrun-vivid text-white ml-auto"
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>Generating...</>
            ) : (
              <>
                <TestTube className="mr-2 h-4 w-4" /> Generate Test Cases
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <Tabs defaultValue="testcases" className="flex-1 flex flex-col">
            <TabsList className="mb-4">
              <TabsTrigger value="testcases">Test Cases</TabsTrigger>
              <TabsTrigger value="original">Original Code</TabsTrigger>
              {testResults && <TabsTrigger value="results">Test Results</TabsTrigger>}
            </TabsList>
            
            <TabsContent value="original" className="flex-1 mt-0">
              <Card className="border border-squadrun-primary/20 bg-squadrun-darker/50 h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Original Code</CardTitle>
                </CardHeader>
                <CardContent className="h-[calc(100%-60px)] overflow-auto">
                  <CodeDisplay code={fileContent} language={fileName?.split('.').pop() || 'python'} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="testcases" className="flex-1 mt-0">
              <Card className="border border-squadrun-primary/20 bg-squadrun-darker/50 h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Generated Test Cases</CardTitle>
                </CardHeader>
                <CardContent className="h-[calc(100%-60px)] overflow-auto">
                  <div className="space-y-4">
                    {testCases.map((test) => (
                      <div key={test.id} className="border border-squadrun-primary/10 rounded-md p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="font-medium text-white">{test.name}</h3>
                            <p className="text-xs text-squadrun-gray">{test.type}</p>
                          </div>
                          {testResults && (
                            <div>
                              {testResults.details.find((r: any) => r.id === test.id)?.passed ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-500" />
                              )}
                            </div>
                          )}
                        </div>
                        <CodeDisplay code={test.code} language={fileName?.split('.').pop() || 'python'} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {testResults && (
              <TabsContent value="results" className="flex-1 mt-0">
                <Card className="border border-squadrun-primary/20 bg-squadrun-darker/50 h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Test Results</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[calc(100%-60px)] overflow-auto">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-squadrun-primary/10 rounded-md p-4">
                        <h3 className="text-sm font-medium text-white mb-1">Test Summary</h3>
                        <div className="flex justify-between text-sm text-squadrun-gray mb-3">
                          <span>Passed: {testResults.passed}/{testResults.total}</span>
                          <span>Failed: {testResults.failed}/{testResults.total}</span>
                        </div>
                        <Progress 
                          value={(testResults.passed / testResults.total) * 100} 
                          className="h-2 bg-squadrun-darker"
                        />
                      </div>
                      
                      <div className="bg-squadrun-primary/10 rounded-md p-4">
                        <h3 className="text-sm font-medium text-white mb-1">Code Coverage</h3>
                        <div className="flex justify-between text-sm text-squadrun-gray mb-3">
                          <span>Coverage: {testResults.coverage}%</span>
                        </div>
                        <Progress 
                          value={testResults.coverage} 
                          className="h-2 bg-squadrun-darker"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {testResults.details.map((result: any) => (
                        <div 
                          key={result.id} 
                          className={`border p-3 rounded-md ${
                            result.passed 
                              ? "border-green-500/20 bg-green-500/5" 
                              : "border-red-500/20 bg-red-500/5"
                          }`}
                        >
                          <div className="flex items-center">
                            {result.passed ? (
                              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500 mr-2" />
                            )}
                            <div>
                              <h3 className="font-medium text-white">{result.name}</h3>
                              <p className="text-xs text-squadrun-gray">{result.message}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
          
          {!testResults ? (
            <Button
              onClick={handleRunTests}
              className="bg-squadrun-primary hover:bg-squadrun-vivid text-white mt-4 ml-auto"
              disabled={isRunning}
            >
              {isRunning ? (
                <>Running tests...</>
              ) : (
                <>
                  <PlayCircle className="mr-2 h-4 w-4" /> Run Tests
                </>
              )}
            </Button>
          ) : (
            <div className="flex justify-end mt-4">
              <Button
                onClick={handleGenerateTests}
                variant="outline" 
                className="text-squadrun-gray mr-2 border-squadrun-primary/20 hover:bg-squadrun-primary/10"
              >
                <TestTube className="mr-2 h-4 w-4" /> Regenerate Tests
              </Button>
              <Button
                onClick={handleRunTests}
                className="bg-squadrun-primary hover:bg-squadrun-vivid text-white"
                disabled={isRunning}
              >
                {isRunning ? (
                  <>Running tests...</>
                ) : (
                  <>
                    <PlayCircle className="mr-2 h-4 w-4" /> Run Tests Again
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
