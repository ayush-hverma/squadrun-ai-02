
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TestTube, PlayCircle } from "lucide-react";
import CodeDisplay from "../CodeDisplay";
import { TestCase as TestCaseType, TestResults } from "@/types/testTypes";
import FileUploadButton from "@/components/FileUploadButton";
import { TestResults as TestResultsComponent } from "./testcase/TestResults";
import { TestCasesList } from "./testcase/TestCasesList";
import { extractFunctionNames, getFileLanguage } from "@/utils/testUtils/testCaseGenerator";
import { useToast } from "@/hooks/use-toast";

interface TestCaseProps {
  fileContent: string | null;
  fileName: string | null;
  onFileUpload: (file: File) => void;
  onClear: () => void;
}

export default function TestCase({
  fileContent,
  fileName,
  onFileUpload,
  onClear
}: TestCaseProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [testCases, setTestCases] = useState<TestCaseType[] | null>(null);
  const [testResults, setTestResults] = useState<TestResults | null>(null);
  const [fileLanguage, setFileLanguage] = useState<string>('python');
  const { toast } = useToast();

  useEffect(() => {
    if (fileContent) {
      setTestCases(null);
      setTestResults(null);
      setFileLanguage(getFileLanguage(fileName));
    }
  }, [fileContent, fileName]);

  const handleGenerateTests = () => {
    if (!fileContent) return;
    setIsGenerating(true);
    setTimeout(() => {
      const functionNames = extractFunctionNames(fileContent, fileLanguage);
      // Mock test case generation for now
      const mockTestCases: TestCaseType[] = [
        {
          id: 1,
          name: "Test valid input",
          type: "Positive Case",
          code: "def test_valid_input():\n    assert True",
          description: "Basic test case"
        }
      ];
      setTestCases(mockTestCases);
      setIsGenerating(false);
    }, 1500);
  };

  const handleRunTests = () => {
    if (!testCases) return;
    setIsRunning(true);
    setTimeout(() => {
      const totalTests = testCases.length;
      const passedTests = Math.floor(totalTests * 0.7);
      const failedTests = totalTests - passedTests;
      
      const mockResults: TestResults = {
        passed: passedTests,
        failed: failedTests,
        total: totalTests,
        coverage: 80,
        details: testCases.map((test, index) => ({
          id: test.id,
          name: test.name,
          passed: index < passedTests,
          message: index < passedTests ? "Test passed" : "Test failed"
        }))
      };
      
      setTestResults(mockResults);
      setIsRunning(false);
    }, 2000);
  };

  const handleClear = () => {
    setTestCases(null);
    setTestResults(null);
    onClear();
    toast({
      title: "Test cases cleared",
      description: "You can now upload a new file."
    });
  };

  if (!fileContent) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
        <h2 className="text-xl font-bold text-white">Test Case Generation</h2>
        <p className="text-squadrun-gray text-center mb-4">
          Upload a code file to generate test cases
        </p>
        <FileUploadButton onFileUpload={onFileUpload} />
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
              <CodeDisplay code={fileContent} language={fileLanguage} />
            </CardContent>
          </Card>
          
          <div className="flex gap-2 justify-end">
            <Button onClick={handleClear} variant="destructive">
              Clear
            </Button>
            <Button 
              onClick={handleGenerateTests} 
              className="bg-squadrun-primary hover:bg-squadrun-vivid text-white" 
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : (
                <>
                  <TestTube className="mr-2 h-4 w-4" /> Generate Test Cases
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <Tabs defaultValue="testcases" className="flex-1 flex flex-col">
            <TabsList className="mb-4">
              <TabsTrigger value="testcases">Test Cases</TabsTrigger>
              <TabsTrigger value="original">Original Code</TabsTrigger>
              {testResults && (
                <TabsTrigger value="results">Test Results</TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="original" className="flex-1 mt-0">
              <Card className="border border-squadrun-primary/20 bg-squadrun-darker/50 h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Original Code</CardTitle>
                </CardHeader>
                <CardContent className="h-[calc(100%-60px)] overflow-auto">
                  <CodeDisplay code={fileContent} language={fileLanguage} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="testcases" className="flex-1 mt-0">
              <TestCasesList 
                testCases={testCases} 
                testResults={testResults?.details} 
              />
            </TabsContent>
            
            {testResults && (
              <TabsContent value="results" className="flex-1 mt-0">
                <TestResultsComponent results={testResults} />
              </TabsContent>
            )}
          </Tabs>
        
          {!testResults ? (
            <Button 
              onClick={handleRunTests} 
              className="bg-squadrun-primary hover:bg-squadrun-vivid text-white mt-4 ml-auto" 
              disabled={isRunning}
            >
              {isRunning ? 'Running tests...' : (
                <>
                  <PlayCircle className="mr-2 h-4 w-4" /> Run Tests
                </>
              )}
            </Button>
          ) : (
            <div className="flex justify-end mt-4">
              <Button 
                onClick={handleRunTests} 
                className="bg-squadrun-primary hover:bg-squadrun-vivid text-white" 
                disabled={isRunning}
              >
                {isRunning ? 'Running tests...' : (
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

