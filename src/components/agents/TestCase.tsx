
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Eraser, Play, FileCode } from "lucide-react";
import FileUploadButton from "@/components/FileUploadButton";
import CodeDisplay from "@/components/CodeDisplay";

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
  const [testCases, setTestCases] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const handleClear = () => {
    setTestCases([]);
    onClear();
    toast.success("Test cases cleared", {
      description: "You can now upload a new file."
    });
  };

  const handleGenerateTestCases = async () => {
    setIsGenerating(true);
    // This is a placeholder - in a real implementation, you would call your test generation service
    setTimeout(() => {
      setTestCases([
        'test_case_1: Input: x=5, Expected: 10',
        'test_case_2: Input: x=0, Expected: 0'
      ]);
      setIsGenerating(false);
      toast.success("Test cases generated successfully");
    }, 2000);
  };

  const handleRunTestCases = async () => {
    if (testCases.length === 0) {
      toast.error("No test cases to run");
      return;
    }
    
    setIsRunning(true);
    // This is a placeholder - in a real implementation, you would run the tests
    setTimeout(() => {
      setIsRunning(false);
      toast.success("All test cases passed!");
    }, 2000);
  };

  if (!fileContent) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
        <h2 className="text-xl font-bold text-white">Test Case Generator</h2>
        <p className="text-squadrun-gray text-center mb-4">
          Upload a code file to generate test cases
        </p>
        <FileUploadButton onFileUpload={onFileUpload} />
      </div>
    );
  }

  return (
    <div className="p-4 h-full flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Test Case Generator</h1>
        <Button
          onClick={handleClear}
          variant="outline"
          className="border-destructive/30 text-destructive hover:bg-destructive/20 transition-all duration-200"
        >
          <Eraser className="mr-2 h-4 w-4" />
          Clear & Start Over
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        {/* File Preview */}
        <div className="bg-squadrun-darker rounded-lg p-4 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-white">
            <FileCode className="h-5 w-5" />
            <span className="font-medium">File Preview: {fileName}</span>
          </div>
          <div className="flex-1 min-h-[300px] overflow-hidden rounded-md">
            <CodeDisplay 
              code={fileContent}
              language={fileName?.split('.').pop() || 'javascript'}
            />
          </div>
        </div>

        {/* Test Cases */}
        <div className="bg-squadrun-darker rounded-lg p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-medium">Test Cases</h3>
            <div className="flex gap-2">
              <Button
                onClick={handleGenerateTestCases}
                disabled={isGenerating}
                className="bg-squadrun-primary hover:bg-squadrun-primary/90"
              >
                {isGenerating ? "Generating..." : "Generate Test Cases"}
              </Button>
              <Button
                onClick={handleRunTestCases}
                disabled={isRunning || testCases.length === 0}
                variant="outline"
                className="border-squadrun-primary/30 text-squadrun-primary hover:bg-squadrun-primary/20"
              >
                <Play className="mr-2 h-4 w-4" />
                Run Tests
              </Button>
            </div>
          </div>
          <div className="flex-1 bg-black/20 rounded-md p-4 overflow-y-auto">
            {testCases.length > 0 ? (
              <ul className="space-y-2 text-squadrun-gray">
                {testCases.map((testCase, index) => (
                  <li key={index} className="font-mono text-sm">
                    {testCase}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-squadrun-gray text-center">
                No test cases generated yet. Click "Generate Test Cases" to start.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
