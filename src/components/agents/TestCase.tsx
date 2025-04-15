
import { useState } from "react";
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

  const handleGenerateTests = () => {
    if (!fileContent) return;
    
    setIsGenerating(true);
    
    // Simulate processing delay
    setTimeout(() => {
      // Mock test cases - in a real app, this would come from an API
      const mockTestCases = [
        {
          id: 1,
          name: "Test valid input",
          type: "Positive Case",
          code: `def test_valid_input():\n    result = process_data("valid_input")\n    assert result == "expected_output"\n    assert result is not None`,
        },
        {
          id: 2,
          name: "Test empty input",
          type: "Edge Case",
          code: `def test_empty_input():\n    result = process_data("")\n    assert result == ""\n    assert isinstance(result, str)`,
        },
        {
          id: 3,
          name: "Test invalid input",
          type: "Exception Handling",
          code: `def test_invalid_input():\n    with pytest.raises(ValueError):\n        process_data(None)`,
        },
        {
          id: 4,
          name: "Test large dataset",
          type: "Performance",
          code: `def test_large_dataset():\n    large_input = "x" * 10000\n    start_time = time.time()\n    result = process_data(large_input)\n    end_time = time.time()\n    assert end_time - start_time < 1.0  # Should complete in under 1 second`,
        },
        {
          id: 5,
          name: "Test concurrency",
          type: "Concurrency",
          code: `def test_concurrent_access():\n    results = []\n    def worker():\n        results.append(process_data("worker_input"))\n    threads = [threading.Thread(target=worker) for _ in range(5)]\n    for t in threads:\n        t.start()\n    for t in threads:\n        t.join()\n    assert len(results) == 5`,
        },
      ];
      
      setTestCases(mockTestCases);
      setIsGenerating(false);
    }, 2000);
  };

  const handleRunTests = () => {
    if (!testCases) return;
    
    setIsRunning(true);
    
    // Simulate processing delay
    setTimeout(() => {
      // Mock test results - in a real app, this would come from an API
      const mockResults = {
        passed: 3,
        failed: 2,
        total: 5,
        coverage: 72,
        details: [
          { id: 1, name: "Test valid input", passed: true, message: "Test passed" },
          { id: 2, name: "Test empty input", passed: true, message: "Test passed" },
          { id: 3, name: "Test invalid input", passed: true, message: "Test passed" },
          { id: 4, name: "Test large dataset", passed: false, message: "Assertion failed: Time exceeded 1.0 seconds" },
          { id: 5, name: "Test concurrency", passed: false, message: "AttributeError: 'module' object has no attribute 'Thread'" },
        ]
      };
      
      setTestResults(mockResults);
      setIsRunning(false);
    }, 3000);
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
