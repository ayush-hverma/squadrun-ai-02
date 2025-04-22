import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { X, Cpu, ArrowRightCircle, RefreshCw } from 'lucide-react';
import CodeDisplay from '../CodeDisplay';
import FileUpload from '@/components/FileUpload';
import ModelPicker from '@/components/ModelPicker';

export default function TestCase() {
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [testCases, setTestCases] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [model, setModel] = useState<"gemini" | "openai" | "groq">("openai");

  const handleFileUpload = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = e => {
      const content = e.target?.result as string;
      setFileContent(content);
      setTestCases(null);
    };
    reader.readAsText(file);
  };

  const handleGenerateTests = async () => {
    if (!fileContent) return;
    
    setIsGenerating(true);
    
    try {
      // Simulate test generation - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock test cases - replace with actual implementation
      const mockTestCases = `
import { describe, it, expect } from 'jest';
import { functionFromFile } from './${fileName?.split('.')[0]}';

describe('${fileName?.split('.')[0]} tests', () => {
  it('should handle basic functionality', () => {
    // Arrange
    const input = 'test input';
    
    // Act
    const result = functionFromFile(input);
    
    // Assert
    expect(result).toBeDefined();
  });
  
  it('should handle edge cases', () => {
    // Arrange
    const emptyInput = '';
    
    // Act
    const result = functionFromFile(emptyInput);
    
    // Assert
    expect(result).toEqual(expect.any(String));
  });
  
  it('should throw error for invalid inputs', () => {
    // Arrange
    const invalidInput = null;
    
    // Act & Assert
    expect(() => {
      functionFromFile(invalidInput);
    }).toThrow();
  });
});
      `;
      
      setTestCases(mockTestCases);
      toast.success("Test cases generated", {
        description: "Your test cases are ready to use."
      });
      
    } catch (error) {
      console.error("Test generation error:", error);
      toast.error("Failed to generate test cases", {
        description: error instanceof Error ? error.message : "An unexpected error occurred."
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClear = () => {
    setFileContent(null);
    setFileName(null);
    setTestCases(null);
    toast.success("Test Cases Cleared", {
      description: "You can now upload a new file.",
    });
  };

  if (!fileContent) {
    return (
      <div className="p-4 h-full flex flex-col">
        <div className="mb-3 flex items-center">
          <span className="text-squadrun-gray mr-2 text-sm">Model:</span>
          <ModelPicker value={model} onChange={setModel} />
        </div>
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-white mb-2">Test Case Generator</h1>
          <p className="text-squadrun-gray">
            Upload your code to generate comprehensive test cases.
          </p>
        </div>
        <FileUpload onFileUpload={handleFileUpload} />
      </div>
    );
  }

  return (
    <div className="p-4 h-full flex flex-col gap-4">
      <div className="mb-3 flex items-center">
        <span className="text-squadrun-gray mr-2 text-sm">Model:</span>
        <ModelPicker value={model} onChange={setModel} />
      </div>

      {!testCases ? (
        <Card className="border border-squadrun-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-bold text-white">Test Case Generator</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-squadrun-gray mb-2">
                  The test generator will create comprehensive tests for:
                </p>
                <div className="space-y-2">
                  <ul className="list-disc list-inside text-squadrun-gray">
                    <li>Unit tests for functions</li>
                    <li>Edge case handling</li>
                    <li>Error conditions</li>
                    <li>Input validation</li>
                    <li>Expected outputs</li>
                  </ul>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-squadrun-gray mb-2">
                  File: <span className="text-squadrun-primary font-semibold">{fileName}</span>
                </p>
                <p className="text-sm text-squadrun-gray">
                  Tests will be generated in a format compatible with Jest, Mocha, or your preferred testing framework.
                </p>
                <div className="mt-4 flex items-center">
                  <Cpu className="text-squadrun-primary mr-2 h-5 w-5" />
                  <span className="text-sm text-squadrun-gray">
                    AI-powered test generation
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleGenerateTests} 
                className="bg-squadrun-primary hover:bg-squadrun-vivid text-white"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Generating Tests...
                  </>
                ) : (
                  <>
                    <ArrowRightCircle className="mr-2 h-4 w-4" />
                    Generate Test Cases
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-row gap-4 items-center">
          <Button 
            onClick={handleClear}
            variant="destructive"
          >
            <X className="mr-2 h-4 w-4" />
            Clear & Start Over
          </Button>
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        {testCases ? (
          <CodeDisplay code={testCases} language="javascript" />
        ) : (
          <CodeDisplay code={fileContent} language={fileName?.split('.').pop() || 'javascript'} />
        )}
      </div>
    </div>
  );
}
