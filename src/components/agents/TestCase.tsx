import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, PlayCircle, TestTube } from "lucide-react";
import CodeDisplay from "../CodeDisplay";
import ModelPicker from "@/components/ModelPicker";
import NoCodeMessage from "../agents/quality/NoCodeMessage";

interface TestCaseProps {
  fileContent: string | null;
  fileName: string | null;
}

export default function TestCase({ fileContent, fileName }: TestCaseProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [testCases, setTestCases] = useState<any[] | null>(null);
  const [testResults, setTestResults] = useState<any | null>(null);
  const [fileLanguage, setFileLanguage] = useState<string>('python');
  const [model, setModel] = useState<"gemini" | "openai" | "groq">("openai");

  useEffect(() => {
    if (fileContent) {
      setTestCases(null);
      setTestResults(null);
      setFileLanguage(getFileLanguage());
    }
  }, [fileContent, fileName]);

  const getFileLanguage = () => {
    if (!fileName) return 'python';
    const extension = fileName.split('.').pop()?.toLowerCase() || '';

    const extensionMap: Record<string, string> = {
      'py': 'python',
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
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
      'css': 'css'
    };
    return extensionMap[extension] || 'python';
  };

  const generateTestCasesForLanguage = () => {
    if (!fileContent) return [];
    const language = fileLanguage;
    const functionNames = extractFunctionNames(fileContent, language);
    const testCases = [];

    for (let i = 0; i < Math.min(functionNames.length, 5); i++) {
      const fn = functionNames[i];
      testCases.push(...generateTestsForFunction(fn, language, i + 1));
    }

    if (testCases.length === 0) {
      testCases.push(...generateGenericTestCases(language));
    }
    return testCases;
  };

  const extractFunctionNames = (code: string, language: string): string[] => {
    const patterns: Record<string, RegExp> = {
      'python': /def\s+([a-zA-Z0-9_]+)\s*\(/g,
      'javascript': /function\s+([a-zA-Z0-9_]+)\s*\(|const\s+([a-zA-Z0-9_]+)\s*=\s*(\([^)]*\)|)\s*=>/g,
      'typescript': /function\s+([a-zA-Z0-9_]+)\s*\(|const\s+([a-zA-Z0-9_]+)\s*=\s*(\([^)]*\)|)\s*=>/g,
      'java': /(?:public|private|protected|static|\s) +[\w\<\>\[\]]+\s+([a-zA-Z0-9_]+)\s*\(/g,
      'cpp': /[\w\<\>\[\]]+\s+([a-zA-Z0-9_]+)\s*\(/g,
      'c': /[\w\<\>\[\]]+\s+([a-zA-Z0-9_]+)\s*\(/g,
      'csharp': /(?:public|private|protected|static|\s) +[\w\<\>\[\]]+\s+([a-zA-Z0-9_]+)\s*\(/g,
      'go': /func\s+([a-zA-Z0-9_]+)\s*\(/g,
      'ruby': /def\s+([a-zA-Z0-9_]+)\s*(\(|$)/g,
      'rust': /fn\s+([a-zA-Z0-9_]+)\s*\(/g,
      'php': /function\s+([a-zA-Z0-9_]+)\s*\(/g
    };
    const pattern = patterns[language] || patterns['python'];
    const functionNames = [];
    let match;
    while ((match = pattern.exec(code)) !== null) {
      const name = match[1] || match[2] || 'main';
      if (name && !functionNames.includes(name)) {
        functionNames.push(name);
      }
    }

    if (functionNames.length === 0) {
      const fileClassName = fileName?.split('.')[0] || 'main';
      functionNames.push(fileClassName);
    }
    return functionNames;
  };

  const generateTestsForFunction = (functionName: string, language: string, id: number) => {
    const testTemplates = {
      'python': {
        positive: {
          code: `def test_${functionName}_valid_input():\n    # Arrange\n    input_value = "example_input"\n    expected = "expected_output"\n    \n    # Act\n    result = ${functionName}(input_value)\n    \n    # Assert\n    assert result == expected\n    assert result is not None`,
          description: "Verifies that the function returns expected output when given valid input."
        },
        negative: {
          code: `def test_${functionName}_invalid_input():\n    # Arrange\n    with pytest.raises(ValueError):\n        # Act & Assert\n        ${functionName}(None)`,
          description: "Checks that the function properly handles invalid input by raising an appropriate exception."
        },
        edge: {
          code: `def test_${functionName}_edge_case():\n    # Arrange\n    input_value = ""\n    \n    # Act\n    result = ${functionName}(input_value)\n    \n    # Assert\n    assert result == ""`,
          description: "Tests the function's behavior with edge case inputs (empty string)."
        },
        performance: {
          code: `def test_${functionName}_performance():\n    # Arrange\n    large_input = "x" * 1000\n    \n    # Act\n    start_time = time.time()\n    result = ${functionName}(large_input)\n    end_time = time.time()\n    \n    # Assert\n    assert end_time - start_time < 1.0  # Should complete in under 1 second`,
          description: "Ensures the function performs efficiently with large inputs."
        },
        concurrency: {
          code: `def test_${functionName}_concurrent_access():\n    # Arrange\n    results = []\n    \n    def worker():\n        results.append(${functionName}("worker_input"))\n    \n    # Act\n    threads = [threading.Thread(target=worker) for _ in range(5)]\n    for t in threads:\n        t.start()\n    for t in threads:\n        t.join()\n    \n    # Assert\n    assert len(results) == 5`,
          description: "Validates that the function works correctly under concurrent access."
        }
      },
      'javascript': {
        positive: {
          code: `test('${functionName} handles valid input correctly', () => {\n  // Arrange\n  const input = 'example_input';\n  const expected = 'expected_output';\n  \n  // Act\n  const result = ${functionName}(input);\n  \n  // Assert\n  expect(result).toBe(expected);\n  expect(result).not.toBeNull();\n});`,
          description: "Verifies that the function returns expected output when given valid input."
        },
        negative: {
          code: `test('${functionName} throws error for invalid input', () => {\n  // Arrange & Act & Assert\n  expect(() => {\n    ${functionName}(null);\n  }).toThrow();\n});`,
          description: "Checks that the function properly handles invalid input by throwing an error."
        },
        edge: {
          code: `test('${functionName} handles edge cases', () => {\n  // Arrange\n  const input = '';\n  \n  // Act\n  const result = ${functionName}(input);\n  \n  // Assert\n  expect(result).toBe('');\n});`,
          description: "Tests the function's behavior with edge case inputs (empty string)."
        },
        performance: {
          code: `test('${functionName} performs efficiently with large input', () => {\n  // Arrange\n  const largeInput = 'x'.repeat(1000);\n  \n  // Act\n  const startTime = Date.now();\n  const result = ${functionName}(largeInput);\n  const endTime = Date.now();\n  \n  // Assert\n  expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second\n});`,
          description: "Ensures the function performs efficiently with large inputs."
        },
        concurrency: {
          code: `test('${functionName} handles concurrent calls', async () => {\n  // Arrange\n  const promises = [];\n  \n  // Act\n  for (let i = 0; i < 5; i++) {\n    promises.push(Promise.resolve(${functionName}('input')));\n  }\n  const results = await Promise.all(promises);\n  \n  // Assert\n  expect(results.length).toBe(5);\n});`,
          description: "Validates that the function works correctly with concurrent calls."
        }
      },
      'typescript': {
        positive: {
          code: `test('${functionName} handles valid input correctly', () => {\n  // Arrange\n  const input = 'example_input';\n  const expected = 'expected_output';\n  \n  // Act\n  const result = ${functionName}(input);\n  \n  // Assert\n  expect(result).toBe(expected);\n  expect(result).not.toBeNull();\n});`,
          description: "Verifies that the function returns expected output when given valid input."
        },
        negative: {
          code: `test('${functionName} throws error for invalid input', () => {\n  // Arrange & Act & Assert\n  expect(() => {\n    ${functionName}(null as any);\n  }).toThrow();\n});`,
          description: "Checks that the function properly handles invalid input by throwing an appropriate exception."
        },
        edge: {
          code: `test('${functionName} handles edge cases', () => {\n  // Arrange\n  const input = '';\n  \n  // Act\n  const result = ${functionName}(input);\n  \n  // Assert\n  expect(result).toBe('');\n});`,
          description: "Tests the function's behavior with edge case inputs (empty string)."
        },
        performance: {
          code: `test('${functionName} performs efficiently with large input', () => {\n  // Arrange\n  const largeInput = 'x'.repeat(1000);\n  \n  // Act\n  const startTime = Date.now();\n  const result = ${functionName}(largeInput);\n  const endTime = Date.now();\n  \n  // Assert\n  expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second\n});`,
          description: "Ensures the function performs efficiently with large inputs."
        },
        concurrency: {
          code: `test('${functionName} handles concurrent calls', async () => {\n  // Arrange\n  const promises: Promise<any>[] = [];\n  \n  // Act\n  for (let i = 0; i < 5; i++) {\n    promises.push(Promise.resolve(${functionName}('input')));\n  }\n  const results = await Promise.all(promises);\n  \n  // Assert\n  expect(results.length).toBe(5);\n});`,
          description: "Validates that the function works correctly with concurrent calls."
        }
      },
      'java': {
        positive: {
          code: `@Test\npublic void test${functionName}ValidInput() {\n    // Arrange\n    String input = "example_input";\n    String expected = "expected_output";\n    \n    // Act\n    String result = ${functionName}(input);\n    \n    // Assert\n    assertEquals(expected, result);\n    assertNotNull(result);\n}`,
          description: "Verifies that the method returns expected output when given valid input."
        },
        negative: {
          code: `@Test(expected = IllegalArgumentException.class)\npublic void test${functionName}InvalidInput() {\n    // Arrange & Act & Assert\n    ${functionName}(null);\n}`,
          description: "Checks that the method properly handles invalid input by throwing an appropriate exception."
        },
        edge: {
          code: `@Test\npublic void test${functionName}EdgeCase() {\n    // Arrange\n    String input = "";\n    \n    // Act\n    String result = ${functionName}(input);\n    \n    // Assert\n    assertEquals("", result);\n}`,
          description: "Tests the method's behavior with edge case inputs (empty string)."
        },
        performance: {
          code: `@Test\npublic void test${functionName}Performance() {\n    // Arrange\n    StringBuilder sb = new StringBuilder();\n    for (int i = 0; i < 1000; i++) {\n        sb.append("x");\n    }\n    String largeInput = sb.toString();\n    \n    // Act\n    long startTime = System.currentTimeMillis();\n    String result = ${functionName}(largeInput);\n    long endTime = System.currentTimeMillis();\n    \n    // Assert\n    assertTrue(endTime - startTime < 1000); // Should complete in under 1 second\n}`,
          description: "Ensures the method performs efficiently with large inputs."
        },
        concurrency: {
          code: `@Test\npublic void test${functionName}Concurrency() throws InterruptedException {\n    // Arrange\n    final List<String> results = new CopyOnWriteArrayList<>();\n    int threadCount = 5;\n    CountDownLatch latch = new CountDownLatch(threadCount);\n    \n    // Act\n    for (int i = 0; i < threadCount; i++) {\n        new Thread(() -> {\n            results.add(${functionName}("input"));\n            latch.countDown();\n        }).start();\n    }\n    latch.await(5, TimeUnit.SECONDS);\n    \n    // Assert\n    assertEquals(threadCount, results.size());\n}`,
          description: "Validates that the method works correctly under concurrent access."
        }
      },
      'cpp': {
        positive: {
          code: `TEST(${functionName}Test, ValidInput) {\n    // Arrange\n    std::string input = "example_input";\n    std::string expected = "expected_output";\n    \n    // Act\n    std::string result = ${functionName}(input);\n    \n    // Assert\n    EXPECT_EQ(expected, result);\n    EXPECT_FALSE(result.empty());\n}`,
          description: "Verifies that the function returns expected output when given valid input."
        },
        negative: {
          code: `TEST(${functionName}Test, InvalidInput) {\n    // Arrange & Act & Assert\n    EXPECT_THROW(${functionName}(nullptr), std::invalid_argument);\n}`,
          description: "Checks that the function properly handles invalid input by throwing an appropriate exception."
        },
        edge: {
          code: `TEST(${functionName}Test, EdgeCase) {\n    // Arrange\n    std::string input = "";\n    \n    // Act\n    std::string result = ${functionName}(input);\n    \n    // Assert\n    EXPECT_EQ("", result);\n}`,
          description: "Tests the function's behavior with edge case inputs (empty string)."
        },
        performance: {
          code: `TEST(${functionName}Test, Performance) {\n    // Arrange\n    std::string largeInput(1000, 'x');\n    \n    // Act\n    auto startTime = std::chrono::high_resolution_clock::now();\n    std::string result = ${functionName}(largeInput);\n    auto endTime = std::chrono::high_resolution_clock::now();\n    \n    // Assert\n    auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(endTime - startTime).count();\n    EXPECT_LT(duration, 1000); // Should complete in under 1 second\n}`,
          description: "Ensures the function performs efficiently with large inputs."
        },
        concurrency: {
          code: `TEST(${functionName}Test, Concurrency) {\n    // Arrange\n    std::vector<std::string> results;\n    std::mutex mutex;\n    std::vector<std::thread> threads;\n    \n    // Act\n    for (int i = 0; i < 5; i++) {\n        threads.push_back(std::thread([&mutex, &results](){\n            std::string result = ${functionName}("input");\n            std::lock_guard<std::mutex> lock(mutex);\n            results.push_back(result);\n        }));\n    }\n    \n    for (auto& thread : threads) {\n        thread.join();\n    }\n    \n    // Assert\n    EXPECT_EQ(5, results.size());\n}`,
          description: "Validates that the function works correctly under concurrent access."
        }
      },
      'ruby': {
        positive: {
          code: `test "${functionName} with valid input" do\n    # Arrange\n    input = "example_input"\n    expected = "expected_output"\n    \n    # Act\n    result = ${functionName}(input)\n    \n    # Assert\n    assert_equal expected, result\n    assert_not_nil result\nend`,
          description: "Verifies that the function returns expected output when given valid input."
        },
        negative: {
          code: `test "${functionName} with invalid input" do\n    # Arrange & Act & Assert\n    assert_raises(ArgumentError) do\n        ${functionName}(nil)\n    end\nend`,
          description: "Checks that the function properly handles invalid input by raising an appropriate exception."
        },
        edge: {
          code: `test "${functionName} with edge case" do\n    # Arrange\n    input = ""\n    \n    # Act\n    result = ${functionName}(input)\n    \n    # Assert\n    assert_equal "", result\nend`,
          description: "Tests the function's behavior with edge case inputs (empty string)."
        },
        performance: {
          code: `test "${functionName} performance" do\n    # Arrange\n    large_input = "x" * 1000\n    \n    # Act\n    start_time = Time.now\n    result = ${functionName}(large_input)\n    end_time = Time.now\n    \n    # Assert\n    assert (end_time - start_time) < 1.0  # Should complete in under 1 second\nend`,
          description: "Ensures the function performs efficiently with large inputs."
        },
        concurrency: {
          code: `test "${functionName} concurrency" do\n    # Arrange\n    results = []\n    threads = []\n    mutex = Mutex.new\n    \n    # Act\n    5.times do\n        threads << Thread.new do\n            result = ${functionName}("input")\n            mutex.synchronize { results << result }\n        end\n    end\n    threads.each(&:join)\n    \n    # Assert\n    assert_equal 5, results.size\nend`,
          description: "Validates that the function works correctly under concurrent access."
        }
      },
      'go': {
        positive: {
          code: `func Test${functionName}ValidInput(t *testing.T) {\n    // Arrange\n    input := "example_input"\n    expected := "expected_output"\n    \n    // Act\n    result := ${functionName}(input)\n    \n    // Assert\n    if result != expected {\n        t.Errorf("Expected %s, got %s", expected, result)\n    }\n    if result == "" {\n        t.Error("Result should not be empty")\n    }\n}`,
          description: "Verifies that the function returns expected output when given valid input."
        },
        negative: {
          code: `func Test${functionName}InvalidInput(t *testing.T) {\n    // Arrange & Act & Assert\n    defer func() {\n        if r := recover(); r == nil {\n            t.Error("Expected function to panic with nil input, but it didn't")\n        }\n    }()\n    ${functionName}(nil)\n}`,
          description: "Checks that the function properly handles invalid input by panicking."
        },
        edge: {
          code: `func Test${functionName}EdgeCase(t *testing.T) {\n    // Arrange\n    input := ""\n    \n    // Act\n    result := ${functionName}(input)\n    \n    // Assert\n    if result != "" {\n        t.Errorf("Expected empty string, got %s", result)\n    }\n}`,
          description: "Tests the function's behavior with edge case inputs (empty string)."
        },
        performance: {
          code: `func Test${functionName}Performance(t *testing.T) {\n    // Arrange\n    largeInput := strings.Repeat("x", 1000)\n    \n    // Act\n    startTime := time.Now()\n    result := ${functionName}(largeInput)\n    endTime := time.Now()\n    \n    // Assert\n    duration := endTime.Sub(startTime)\n    if duration.Milliseconds() > 1000 {\n        t.Errorf("Function took too long: %v", duration)\n    }\n    if result == "" {\n        t.Error("Result should not be empty")\n    }\n}`,
          description: "Ensures the function performs efficiently with large inputs."
        },
        concurrency: {
          code: `func Test${functionName}Concurrency(t *testing.T) {\n    // Arrange\n    var wg sync.WaitGroup\n    var mu sync.Mutex\n    results := make([]string, 0, 5)\n    \n    // Act\n    for i := 0; i < 5; i++ {\n        wg.Add(1)\n        go func() {\n            defer wg.Done()\n            result := ${functionName}("input")\n            mu.Lock()\n            results = append(results, result)\n            mu.Unlock()\n        }()\n    }\n    wg.Wait()\n    \n    // Assert\n    if len(results) != 5 {\n        t.Errorf("Expected 5 results, got %d", len(results))\n    }\n}`,
          description: "Validates that the function works correctly under concurrent access."
        }
      },
      'rust': {
        positive: {
          code: `#[test]\nfn test_${functionName}_valid_input() {\n    // Arrange\n    let input = "example_input";\n    let expected = "expected_output";\n    \n    // Act\n    let result = ${functionName}(input);\n    \n    // Assert\n    assert_eq!(expected, result);\n    assert!(!result.is_empty());\n}`,
          description: "Verifies that the function returns expected output when given valid input."
        },
        negative: {
          code: `#[test]\n#[should_panic]\nfn test_${functionName}_invalid_input() {\n    // Arrange & Act & Assert\n    ${functionName}(None);\n}`,
          description: "Checks that the function properly handles invalid input by panicking."
        },
        edge: {
          code: `#[test]\nfn test_${functionName}_edge_case() {\n    // Arrange\n    let input = "";\n    \n    // Act\n    let result = ${functionName}(input);\n    \n    // Assert\n    assert_eq!("", result);\n}`,
          description: "Tests the function's behavior with edge case inputs (empty string)."
        },
        performance: {
          code: `#[test]\nfn test_${functionName}_performance() {\n    // Arrange\n    let large_input = "x".repeat(1000);\n    \n    // Act\n    let start_time = std::time::Instant::now();\n    let result = ${functionName}(&large_input);\n    let duration = start_time.elapsed();\n    \n    // Assert\n    assert!(duration < std::time::Duration::from_secs(1)); // Should complete in under 1 second\n    assert!(!result.is_empty());\n}`,
          description: "Ensures the function performs efficiently with large inputs."
        },
        concurrency: {
          code: `#[test]\nfn test_${functionName}_concurrency() {\n    // Arrange\n    use std::sync::{Arc, Mutex};\n    use std::thread;\n    \n    let results = Arc::new(Mutex::new(Vec::new()));\n    let mut handles = vec![];\n    \n    // Act\n    for _ in 0..5 {\n        let results_clone = Arc::clone(&results);\n        let handle = thread::spawn(move || {\n            let result = ${functionName}("input");\n            let mut results = results_clone.lock().unwrap();\n            results.push(result);\n        });\n        handles.push(handle);\n    }\n    \n    for handle in handles {\n        handle.join().unwrap();\n    }\n    \n    // Assert\n    let final_results = results.lock().unwrap();\n    assert_eq!(5, final_results.len());\n}`,
          description: "Validates that the function works correctly under concurrent access."
        }
      },
      'c': {
        positive: {
          code: `void test_${functionName}_valid_input(void) {\n    // Arrange\n    char input[] = "example_input";\n    char expected[] = "expected_output";\n    \n    // Act\n    char* result = ${functionName}(input);\n    \n    // Assert\n    TEST_ASSERT_EQUAL_STRING(expected, result);\n    TEST_ASSERT_NOT_NULL(result);\n    free(result);\n}`,
          description: "Verifies that the function returns expected output when given valid input."
        },
        negative: {
          code: `void test_${functionName}_invalid_input(void) {\n    // Arrange & Act & Assert\n    TEST_ASSERT_NULL(${functionName}(NULL));\n}`,
          description: "Checks that the function properly handles NULL input by returning NULL."
        },
        edge: {
          code: `void test_${functionName}_edge_case(void) {\n    // Arrange\n    char input[] = "";\n    \n    // Act\n    char* result = ${functionName}(input);\n    \n    // Assert\n    TEST_ASSERT_EQUAL_STRING("", result);\n    free(result);\n}`,
          description: "Tests the function's behavior with edge case inputs (empty string)."
        },
        performance: {
          code: `void test_${functionName}_performance(void) {\n    // Arrange\n    char* large_input = malloc(1001);\n    memset(large_input, 'x', 1000);\n    large_input[1000] = '\\0';\n    \n    // Act\n    clock_t start_time = clock();\n    char* result = ${functionName}(large_input);\n    clock_t end_time = clock();\n    \n    // Assert\n    double time_spent = (double)(end_time - start_time) / CLOCKS_PER_SEC;\n    TEST_ASSERT_TRUE(time_spent < 1.0); // Should complete in under 1 second\n    TEST_ASSERT_NOT_NULL(result);\n    \n    free(large_input);\n    free(result);\n}`,
          description: "Ensures the function performs efficiently with large inputs."
        },
        concurrency: {
          code: `void test_${functionName}_basic_functionality(void) {\n    // Arrange\n    char input[] = "example_input";\n    \n    // Act\n    char* result = ${functionName}(input);\n    \n    // Assert\n    TEST_ASSERT_NOT_NULL(result);\n    free(result);\n}`,
          description: "Basic test for function functionality (C lacks standard threading support)."
        }
      },
      'csharp': {
        positive: {
          code: `[Test]\npublic void Test${functionName}ValidInput()\n{\n    // Arrange\n    string input = "example_input";\n    string expected = "expected_output";\n    \n    // Act\n    string result = ${functionName}(input);\n    \n    // Assert\n    Assert.AreEqual(expected, result);\n    Assert.IsNotNull(result);\n}`,
          description: "Verifies that the method returns expected output when given valid input."
        },
        negative: {
          code: `[Test]\npublic void Test${functionName}InvalidInput()\n{\n    // Arrange & Act & Assert\n    Assert.Throws<ArgumentException>(() => ${functionName}(null));\n}`,
          description: "Checks that the method properly handles invalid input by throwing an appropriate exception."
        },
        edge: {
          code: `[Test]\npublic void Test${functionName}EdgeCase()\n{\n    // Arrange\n    string input = "";\n    \n    // Act\n    string result = ${functionName}(input);\n    \n    // Assert\n    Assert.AreEqual("", result);\n}`,
          description: "Tests the method's behavior with edge case inputs (empty string)."
        },
        performance: {
          code: `[Test]\npublic void Test${functionName}Performance()\n{\n    // Arrange\n    string largeInput = new string('x', 1000);\n    \n    // Act\n    var stopwatch = Stopwatch.StartNew();\n    string result = ${functionName}(largeInput);\n    stopwatch.Stop();\n    \n    // Assert\n    Assert.Less(stopwatch.ElapsedMilliseconds, 1000); // Should complete in under 1 second\n    Assert.IsNotNull(result);\n}`,
          description: "Ensures the method performs efficiently with large inputs."
        },
        concurrency: {
          code: `[Test]\npublic void Test${functionName}Concurrency()\n{\n    // Arrange\n    var results = new ConcurrentBag<string>();\n    \n    // Act\n    Parallel.For(0, 5, _ =>\n    {\n        results.Add(${functionName}("input"));\n    });\n    \n    // Assert\n    Assert.AreEqual(5, results.Count);\n}`,
          description: "Validates that the method works correctly under concurrent access."
        }
      },
      'php': {
        positive: {
          code: `public function test${functionName}ValidInput(): void\n{\n    // Arrange\n    $input = "example_input";\n    $expected = "expected_output";\n    \n    // Act\n    $result = ${functionName}($input);\n    \n    // Assert\n    $this->assertEquals($expected, $result);\n    $this->assertNotEmpty($result);\n}`,
          description: "Verifies that the function returns expected output when given valid input."
        },
        negative: {
          code: `public function test${functionName}InvalidInput(): void\n{\n    // Arrange & Act & Assert\n    $this->expectException(\\InvalidArgumentException::class);\n    ${functionName}(null);\n}`,
          description: "Checks that the function properly handles invalid input by throwing an appropriate exception."
        },
        edge: {
          code: `public function test${functionName}EdgeCase(): void\n{\n    // Arrange\n    $input = "";\n    \n    // Act\n    $result = ${functionName}($input);\n    \n    // Assert\n    $this->assertEquals("", $result);\n}`,
          description: "Tests the function's behavior with edge case inputs (empty string)."
        },
        performance: {
          code: `public function test${functionName}Performance(): void\n{\n    // Arrange\n    $largeInput = str_repeat("x", 1000);\n    \n    // Act\n    $startTime = microtime(true);\n    $result = ${functionName}($largeInput);\n    $endTime = microtime(true);\n    \n    // Assert\n    $this->assertLessThan(1.0, $endTime - $startTime); // Should complete in under 1 second\n    $this->assertNotEmpty($result);\n}`,
          description: "Ensures the function performs efficiently with large inputs."
        },
        concurrency: {
          code: `public function test${functionName}BasicFunctionality(): void\n{\n    // PHP doesn't have native threading in its test framework, so we'll test basic functionality\n    // Arrange\n    $input = "example_input";\n    \n    // Act\n    $result = ${functionName}($input);\n    \n    // Assert\n    $this->assertNotEmpty($result);\n}`,
          description: "Basic test for function functionality (PHP lacks built-in threading support in tests)."
        }
      }
    };

    const templates = testTemplates[language] || testTemplates['python'];
    const testTypes = ['positive', 'negative', 'edge', 'performance', 'concurrency'];
    const result = [];

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

  const generateGenericTestCases = (language: string) => {
    const moduleName = fileName?.split('.')[0] || 'module';
    const templates: Record<string, any[]> = {
      'python': [{
        name: "Test module initialization",
        type: "Positive Case",
        code: `def test_module_init():\n    # Test that the module can be imported\n    import ${moduleName}\n    assert ${moduleName} is not None`,
        description: "Verifies that the module can be imported successfully."
      }, {
        name: "Test module functionality",
        type: "Functional Test",
        code: `def test_module_functionality():\n    # This is a placeholder test\n    # Adapt this to test the specific functionality of your module\n    import ${moduleName}\n    result = True  # Replace with actual functionality test\n    assert result is True`,
        description: "Tests the overall functionality of the module."
      }],
      'javascript': [{
        name: "Test module import",
        type: "Positive Case",
        code: `test('${moduleName} module can be imported', () => {\n  // Arrange & Act\n  const module = require('./${moduleName}');\n  \n  // Assert\n  expect(module).toBeDefined();\n});`,
        description: "Verifies that the module can be imported successfully."
      }, {
        name: "Test module functionality",
        type: "Functional Test",
        code: `test('${moduleName} module has expected functionality', () => {\n  // Arrange\n  const module = require('./${moduleName}');\n  \n  // Act & Assert\n  // Replace with actual functionality test\n  expect(typeof module).toBe('object');\n});`,
        description: "Tests the overall functionality of the module."
      }],
      'typescript': [{
        name: "Test module import",
        type: "Positive Case",
        code: `test('${moduleName} module can be imported', () => {\n  // Arrange & Act\n  const module = require('./${moduleName}');\n  \n  // Assert\n  expect(module).toBeDefined();\n});`,
        description: "Verifies that the module can be imported successfully."
      }, {
        name: "Test module functionality",
        type: "Functional Test",
        code: `test('${moduleName} module has expected functionality', () => {\n  // Arrange\n  const module = require('./${moduleName}');\n  \n  // Act & Assert\n  // Replace with actual functionality test\n  expect(typeof module).toBe('object');\n});`,
        description: "Tests the overall functionality of the module."
      }],
      'java': [{
        name: "Test class initialization",
        type: "Positive Case",
        code: `@Test\npublic void test${moduleName}Initialization() {\n    // Arrange & Act\n    ${moduleName} instance = new ${moduleName}();\n    \n    // Assert\n    assertNotNull(instance);\n}`,
        description: "Verifies that the class can be instantiated successfully."
      }, {
        name: "Test class functionality",
        type: "Functional Test",
        code: `@Test\npublic void test${moduleName}Functionality() {\n    // Arrange\n    ${moduleName} instance = new ${moduleName}();\n    \n    // Act & Assert\n    // Replace with actual functionality test\n    assertTrue(true);\n}`,
        description: "Tests the overall functionality of the class."
      }],
      'cpp': [{
        name: "Test basic initialization",
        type: "Positive Case",
        code: `TEST(${moduleName}Test, Initialization) {\n    // This is a basic test to ensure the test framework works\n    EXPECT_TRUE(true);\n}`,
        description: "Basic test to verify the test framework is working."
      }, {
        name: "Test module functionality",
        type: "Functional Test",
        code: `TEST(${moduleName}Test, BasicFunctionality) {\n    // Add your specific tests for ${moduleName} functionality\n    // This is just a placeholder\n    EXPECT_TRUE(true);\n}`,
        description: "Tests the overall functionality of the module."
      }],
      'ruby': [{
        name: "Test module loading",
        type: "Positive Case",
        code: `test "can load ${moduleName} module" do\n    # Arrange & Act\n    require_relative '../${moduleName}'\n    \n    # Assert\n    assert Object.const_defined?(:${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)})\nend`,
        description: "Verifies that the module can be loaded successfully."
      }, {
        name: "Test module functionality",
        type: "Functional Test",
        code: `test "${moduleName} has expected functionality" do\n    # Arrange\n    require_relative '../${moduleName}'\n    \n    # Act & Assert\n    # Replace with actual functionality test\n    assert true\nend`,
        description: "Tests the overall functionality of the module."
      }],
      'go': [{
        name: "Test package import",
        type: "Positive Case",
        code: `func TestPackageImport(t *testing.T) {\n    // This is a basic test to ensure the test framework works\n    if false {\n        t.Error("This should not fail")\n    }\n}`,
        description: "Basic test to verify the test framework is working."
      }, {
        name: "Test basic functionality",
        type: "Functional Test",
        code: `func TestBasicFunctionality(t *testing.T) {\n    // Add your specific tests for package functionality\n    // This is just a placeholder\n    if false {\n        t.Error("This should not fail")\n    }\n}`,
        description: "Tests the overall functionality of the package."
      }],
      'c': [{
        name: "Test basic functionality",
        type: "Positive Case",
        code: `void test_basic_functionality(void) {\n    // This is a basic test to ensure the test framework works\n    TEST_ASSERT_TRUE(1);\n}`,
        description: "Basic test to verify the test framework is working."
      }, {
        name: "Test module initialization",
        type: "Functional Test",
        code: `void test_module_initialization(void) {\n    // Add your specific tests for module initialization\n    // This is just a placeholder\n    TEST_ASSERT_TRUE(1);\n}`,
        description: "Tests that the module initializes correctly."
      }],
      'csharp': [{
        name: "Test class initialization",
        type: "Positive Case",
        code: `[Test]\npublic void Test${moduleName}Initialization()\n{\n    // Arrange & Act\n    var instance = new ${moduleName}();\n    \n    // Assert\n    Assert.IsNotNull(instance);\n}`,
        description: "Verifies that the class can be instantiated successfully."
      }, {
        name: "Test class functionality",
        type: "Functional Test",
        code: `[Test]\npublic void Test${moduleName}Functionality()\n{\n    // Arrange\n    var instance = new ${moduleName}();\n    \n    // Act & Assert\n    // Replace with actual functionality test\n    Assert.IsTrue(true);\n}`,
        description: "Tests the overall functionality of the class."
      }],
      'php': [{
        name: "Test class instantiation",
        type: "Positive Case",
        code: `public function testClassInstantiation(): void\n{\n    // Arrange & Act\n    $instance = new ${moduleName}();\n    \n    // Assert\n    $this->assertInstanceOf(${moduleName}::class, $instance);\n}`,
        description: "Verifies that the class can be instantiated successfully."
      }, {
        name: "Test class functionality",
        type: "Functional Test",
        code: `public function testClassFunctionality(): void\n{\n    // Arrange\n    $instance = new ${moduleName}();\n    \n    // Act & Assert\n    // Replace with actual functionality test\n    $this->assertTrue(true);\n}`,
        description: "Tests the overall functionality of the class."
      }]
    };
    return templates[language] || templates['python'];
  };

  const handleGenerateTests = () => {
    if (!fileContent) return;
    setIsGenerating(true);

    setTimeout(() => {
      const generatedTestCases = generateTestCasesForLanguage();
      setTestCases(generatedTestCases);
      setIsGenerating(false);
    }, 1500);
  };

  const handleRunTests = () => {
    if (!testCases) return;
    setIsRunning(true);

    setTimeout(() => {
      const totalTests = testCases.length;
      const passedTests = Math.floor(totalTests * 0.7) + Math.floor(Math.random() * (totalTests * 0.3));
      const failedTests = totalTests - passedTests;

      const details = testCases.map((test, index) => {
        const passed = index < passedTests || Math.random() > 0.3;
        return {
          id: test.id,
          name: test.name,
          passed: passed,
          message: passed ? "Test passed" : getRandomFailureReason(test.type)
        };
      });

      const coverage = Math.floor(65 + passedTests / totalTests * 25 + Math.random() * 10);
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

  const getRandomFailureReason = (testType: string) => {
    const failures = {
      'Positive Case': ["Assertion failed: Expected 'expected_output', got 'actual_output'", "Function returned null", "Expected true but got false"],
      'Edge Case': ["Function threw unexpected exception", "Empty input handling failed", "Boundary condition not handled correctly"],
      'Exception Handling': ["Expected exception not thrown", "Wrong exception type thrown", "Exception message doesn't match expected pattern"],
      'Performance': ["Execution time exceeded threshold", "Memory usage too high", "Operation timed out"],
      'Concurrency': ["Race condition detected", "Thread deadlock occurred", "Concurrent modification exception"]
    };
    const failureCategory = failures[testType as keyof typeof failures] || failures['Positive Case'];
    return failureCategory[Math.floor(Math.random() * failureCategory.length)];
  };

  if (!fileContent) {
    return <NoCodeMessage>Please upload a file to generate test cases</NoCodeMessage>;
  }

  return <div className="p-4 h-full flex flex-col">
    <div className="mb-3 flex items-center">
      <span className="text-squadrun-gray mr-2 text-sm">Model:</span>
      <ModelPicker value={model} onChange={setModel} />
    </div>
    <div className="mb-4">
      <h1 className="text-2xl font-bold text-white mb-2">Test Case Generator</h1>
      <p className="text-squadrun-gray">
        Generate and run comprehensive test cases for your code to ensure quality and reliability.
      </p>
    </div>
    
    {!testCases ? <div className="flex-1 flex flex-col">
        <Card className="mb-4 border border-squadrun-primary/20 bg-squadrun-darker/50 h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Code to Test</CardTitle>
          </CardHeader>
          <CardContent>
            <CodeDisplay code={fileContent} language={fileName?.split('.').pop() || 'python'} />
          </CardContent>
        </Card>
        
        <Button onClick={handleGenerateTests} className="bg-squadrun-primary hover:bg-squadrun-vivid text-white ml-auto" disabled={isGenerating}>
          {isGenerating ? <>Generating...</> : <>
              <TestTube className="mr-2 h-4 w-4" /> Generate Test Cases
            </>}
        </Button>
      </div> : <div className="flex-1 flex flex-col">
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
                  {testCases.map(test => <div key={test.id} className="border border-squadrun-primary/10 rounded-md p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-medium text-white">{test.name}</h3>
                          <p className="text-xs text-squadrun-gray">{test.type}</p>
                          <p className="text-sm text-squadrun-gray mt-1">{test.description}</p>
                        </div>
                        {testResults && <div>
                            {testResults.details.find((r: any) => r.id === test.id)?.passed ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
                          </div>}
                      </div>
                      <CodeDisplay code={test.code} language={fileName?.split('.').pop() || 'python'} />
                    </div>)}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {testResults && <TabsContent value="results" className="flex-1 mt-0">
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
                      <Progress value={testResults.passed / testResults.total * 100} className="h-2 bg-squadrun-darker" />
                    </div>
                    
                    <div className="bg-squadrun-primary/10 rounded-md p-4">
                      <h3 className="text-sm font-medium text-white mb-1">Code Coverage</h3>
                      <div className="flex justify-between text-sm text-squadrun-gray mb-3">
                        <span>Coverage: {testResults.coverage}%</span>
                      </div>
                      <Progress value={testResults.coverage} className="h-2 bg-squadrun-darker" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {testResults.details.map((result: any) => <div key={result.id} className={`border p-3 rounded-md ${result.passed ? "border-green-500/20 bg-green-500/5" : "border-red-500/20 bg-red-500/5"}`}>
                        <div className="flex items-center">
                          {result.passed ? <CheckCircle className="h-5 w-5 text-green-500 mr-2" /> : <XCircle className="h-5 w-5 text-red-500 mr-2" />}
                          <div>
                            <h3 className="font-medium text-white">{result.name}</h3>
                            <p className="text-xs text-squadrun-gray">{result.message}</p>
                          </div>
                        </div>
                      </div>)}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>}
        </Tabs>
      
        {!testResults ? <Button onClick={handleRunTests} className="bg-squadrun-primary hover:bg-squadrun-vivid text-white mt-4 ml-auto" disabled={isRunning}>
            {isRunning ? <>Running tests...</> : <>
                <PlayCircle className="mr-2 h-4 w-4" /> Run Tests
              </>}
          </Button> : <div className="flex justify-end mt-4">
            
            <Button onClick={handleRunTests} className="bg-squadrun-primary hover:bg-squadrun-vivid text-white" disabled={isRunning}>
              {isRunning ? <>Running tests...</> : <>
                  <PlayCircle className="mr-2 h-4 w-4" /> Run Tests Again
                </>}
            </Button>
          </div>}
      </div>}
  </div>;
}
