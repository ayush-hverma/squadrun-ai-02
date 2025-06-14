
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowRightCircle, 
  Download, 
  RefreshCw,
  Cpu,
  X
} from "lucide-react";
import CodeDisplay from "@/components/CodeDisplay";
import { toast } from "sonner";
import { refactorCodeWithAI } from "@/utils/aiUtils";
import HighlightedCodeCompare from "@/components/HighlightedCodeCompare";

interface CodeRefactorProps {
  fileContent: string | null;
  fileName: string | null;
  onClearFile?: () => void;
}

export default function CodeRefactor({ fileContent, fileName, onClearFile }: CodeRefactorProps) {
  const [refactoredCode, setRefactoredCode] = useState<string | null>(null);
  const [isRefactoring, setIsRefactoring] = useState(false);
  const [language, setLanguage] = useState<string>('js');

  useEffect(() => {
    setRefactoredCode(null);
    if (fileName) {
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
      setLanguage(fileExtension);
    }
  }, [fileContent, fileName]);

  const handleRefactor = async () => {
    if (!fileContent) return;
    
    setIsRefactoring(true);
    
    try {
      toast.info("Starting AI-powered refactoring", {
        description: "This may take a moment for larger files."
      });
      
      const result = await refactorCodeWithAI(fileContent, language);
      
      toast.success("AI-powered refactoring complete", {
        description: "Your code has been refactored using advanced AI techniques."
      });
      
      setRefactoredCode(result);
      
    } catch (error) {
      console.error("Refactoring error:", error);
      toast.error("Refactoring failed", {
        description: error instanceof Error ? error.message : "An error occurred during refactoring."
      });
    } finally {
      setIsRefactoring(false);
    }
  };

  const handleDownload = () => {
    if (!refactoredCode || !fileName) return;
    
    const element = document.createElement("a");
    const file = new Blob([refactoredCode], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    
    const fileNameParts = fileName.split(".");
    const extension = fileNameParts.pop();
    const newFileName = fileNameParts.join(".") + "-refactored." + extension;
    
    element.download = newFileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast.success("Download started", {
      description: `File saved as ${newFileName}`
    });
  };

  const handleClear = () => {
    setRefactoredCode(null);
    if (onClearFile) {
      onClearFile();
    } else {
      toast.success("Refactoring cleared", {
        description: "You can now upload a new file."
      });
    }
  };

  if (!fileContent) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <Cpu className="h-16 w-16 text-squadrun-primary mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">No Code Selected</h2>
        <p className="text-squadrun-gray text-center">
          Please upload a file or select a file from a repository to start refactoring.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 h-full flex flex-col gap-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">AI-Powered Code Refactoring</h2>
          <p className="text-sm text-squadrun-gray">Using advanced AI to improve your code quality</p>
        </div>
      </div>
      
      {!refactoredCode ? (
        <Card className="border border-squadrun-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-bold text-white">Code Refactoring</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-squadrun-gray mb-2">
                  The AI refactoring engine will automatically apply best practices for:
                </p>
                <div className="space-y-2">
                  <ul className="list-disc list-inside text-squadrun-gray">
                    <li>Enhancing readability</li>
                    <li>Improving maintainability</li>
                    <li>Optimizing performance</li>
                    <li>Fixing security issues</li>
                    <li>Applying DRY principles</li>
                  </ul>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-squadrun-gray mb-2">
                  Language Detected: <span className="text-squadrun-primary font-semibold">{language.toUpperCase()}</span>
                </p>
                <p className="text-sm text-squadrun-gray">
                  Complete code rewrite will be performed while preserving functionality
                </p>
                <div className="mt-4 flex items-center">
                  <Cpu className="text-squadrun-primary mr-2 h-5 w-5" />
                  <span className="text-sm text-squadrun-gray">
                    AI-powered refactoring engine
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleRefactor} 
                className="bg-squadrun-primary hover:bg-squadrun-vivid text-white"
                disabled={isRefactoring}
              >
                {isRefactoring ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Refactoring...
                  </>
                ) : (
                  <>
                    <ArrowRightCircle className="mr-2 h-4 w-4" />
                    Refactor Code
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-row gap-4 items-center">
          <Button 
            onClick={handleDownload} 
            variant="outline"
            className="border-squadrun-primary text-squadrun-primary hover:bg-squadrun-primary/10"
          >
            <Download className="mr-2 h-4 w-4" />
            Download Refactored Code
          </Button>
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
        {refactoredCode ? (
          <HighlightedCodeCompare originalCode={fileContent} refactoredCode={refactoredCode} language={language} />
        ) : (
          <CodeDisplay code={fileContent} language={language} />
        )}
      </div>
    </div>
  );
}
