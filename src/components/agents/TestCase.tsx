
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PlayCircle, 
  X 
} from "lucide-react";
import CodeDisplay from "../CodeDisplay";

interface TestCaseProps {
  fileContent: string | null;
  fileName: string | null;
}

export default function TestCase({ fileContent, fileName }: TestCaseProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedTestCases, setGeneratedTestCases] = useState<string | null>(null);

  const handleClear = () => {
    setGeneratedTestCases(null);
  };

  const handleGenerateTestCases = () => {
    if (!fileContent) return;
    
    setIsProcessing(true);
    
    const language = fileName?.split('.').pop()?.toLowerCase() || 'python';
    
    setTimeout(() => {
      let testCases = '';
      
      switch(language) {
        case 'js':
        case 'jsx':
        case 'ts':
        case 'tsx':
          testCases = `
// Test Case 1: Basic functionality
test('Basic functionality works', () => {
  // Add your test logic here
  expect(true).toBe(true);
});

// Test Case 2: Edge case handling
test('Handles edge cases correctly', () => {
  // Add your test logic here
  expect(true).toBe(true);
});
          `.trim();
          break;
        case 'py':
          testCases = `
# Test Case 1: Basic functionality
def test_basic_functionality():
    # Add your test logic here
    assert True == True

# Test Case 2: Edge case handling
def test_edge_case_handling():
    # Add your test logic here
    assert True == True
          `.trim();
          break;
        // Add more language-specific test case templates as needed
        default:
          testCases = '# No test case template available for this language';
      }
      
      setGeneratedTestCases(testCases);
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white mb-2">Test Case Generation</h1>
        <p className="text-squadrun-gray">
          Generate test cases for your code to ensure its reliability and correctness.
        </p>
      </div>
      
      {generatedTestCases ? (
        <div className="flex-1 flex flex-col">
          <div className="flex items-center mb-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleClear} 
              className="ml-auto text-white hover:bg-squadrun-primary/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <Card className="border border-squadrun-primary/20 bg-squadrun-darker/50 flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Generated Test Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <CodeDisplay code={generatedTestCases} language={fileName?.split('.').pop() || 'python'} />
            </CardContent>
          </Card>
        </div>
      ) : (
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
            onClick={handleGenerateTestCases}
            className="bg-squadrun-primary hover:bg-squadrun-vivid text-white ml-auto"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>Processing...</>
            ) : (
              <>
                <PlayCircle className="mr-2 h-4 w-4" /> Generate Test Cases
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
