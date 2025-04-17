import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { toast } from "sonner";
import NoFileMessage from "@/components/refactor/NoFileMessage";

interface TestCaseProps {
  fileContent: string | null;
  fileName: string | null;
}

export default function TestCase({ fileContent, fileName }: TestCaseProps) {
  const [testResults, setTestResults] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Existing generateTestCases method would remain the same

  // New clear method to reset the state
  const handleClear = () => {
    setTestResults(null);
    toast.success("Test cases cleared", {
      description: "You can now upload a new file."
    });
  };

  if (!fileContent) {
    return <NoFileMessage />;
  }

  return (
    <div className="p-4 h-full flex flex-col">
      {/* Existing content */}
      {testResults && (
        <div className="mt-4 flex justify-center">
          <Button 
            onClick={handleClear} 
            variant="destructive"
            className="bg-red-500 hover:bg-red-600"
          >
            <X className="mr-2 h-4 w-4" />
            Clear Test Cases
          </Button>
        </div>
      )}
    </div>
  );
}
