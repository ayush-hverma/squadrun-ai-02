import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Eraser } from "lucide-react";
import FileUploadButton from "@/components/FileUploadButton";

interface TestCaseProps {
  fileContent: string | null;
  fileName: string | null;
  onFileUpload: (file: File) => void;
}

export default function TestCase({
  fileContent,
  fileName,
  onFileUpload
}: TestCaseProps) {
  const [testCases, setTestCases] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleClear = () => {
    setTestCases([]);
    toast.success("Test cases cleared", {
      description: "You can now upload a new file."
    });
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
      
    </div>
  );
}
