import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlayCircle, TestTube, X } from "lucide-react";
import NoCodeMessage from "@/components/agents/quality/NoCodeMessage";
import { getFileLanguage } from "./utils/languageDetection";
import { generateTestCasesForLanguage, getRandomFailureReason } from "./utils/testGenerator";
import { TestCase, TestCaseProps, TestResults } from "./types";
import TestCaseList from "./components/TestCaseList";
import OriginalCode from "./components/OriginalCode";
import TestResultsSummary from "./components/TestResultsSummary";

export default function TestCaseGenerator({ fileContent, fileName, onClearFile }: TestCaseProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [testCases, setTestCases] = useState<TestCase[] | null>(null);
  const [testResults, setTestResults] = useState<TestResults | null>(null);
  const [fileLanguage, setFileLanguage] = useState<string>('python');

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
      const generatedTestCases = generateTestCasesForLanguage(fileContent, fileName, fileLanguage);
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

  const handleClear = () => {
    setTestCases(null);
    setTestResults(null);
    setIsGenerating(false);
    setIsRunning(false);
    if (onClearFile) onClearFile();
  };

  if (!fileContent) {
    return <NoCodeMessage />;
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
          <OriginalCode fileContent={fileContent} fileName={fileName} />
          
          <Button 
            onClick={handleGenerateTests} 
            className="bg-squadrun-primary hover:bg-squadrun-vivid text-white ml-auto mt-4" 
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
          <Button onClick={handleClear} variant="destructive" className="mt-4 ml-auto">
            <X className="mr-2 h-4 w-4" />
            Clear
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
              <OriginalCode fileContent={fileContent} fileName={fileName} />
            </TabsContent>
            
            <TabsContent value="testcases" className="flex-1 mt-0">
              <TestCaseList testCases={testCases} testResults={testResults} fileName={fileName} />
            </TabsContent>
            
            {testResults && (
              <TabsContent value="results" className="flex-1 mt-0">
                <TestResultsSummary testResults={testResults} />
              </TabsContent>
            )}
          </Tabs>
        
          {!testResults ? (
            <div className="flex gap-2 mt-4 justify-end">
              <Button 
                onClick={handleRunTests} 
                className="bg-squadrun-primary hover:bg-squadrun-vivid text-white" 
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
              <Button onClick={handleClear} variant="destructive">
                <X className="mr-2 h-4 w-4" />
                Clear
              </Button>
            </div>
          ) : (
            <div className="flex gap-2 justify-end mt-4">
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
              <Button onClick={handleClear} variant="destructive">
                <X className="mr-2 h-4 w-4" />
                Clear
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
