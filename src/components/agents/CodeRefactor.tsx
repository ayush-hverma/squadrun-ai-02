
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, PlayCircle } from "lucide-react";
import CodeDisplay from "../CodeDisplay";

interface CodeRefactorProps {
  fileContent: string | null;
  fileName: string | null;
}

export default function CodeRefactor({ fileContent, fileName }: CodeRefactorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [refactoredCode, setRefactoredCode] = useState<string | null>(null);

  const handleRefactor = () => {
    if (!fileContent) return;
    
    setIsProcessing(true);
    
    // Simulate processing delay
    setTimeout(() => {
      // Mock refactored code - in a real app, this would come from an API
      const mockRefactoredCode = fileContent + "\n\n# Refactored for better performance\n# Reduced complexity\n# Added proper documentation";
      setRefactoredCode(mockRefactoredCode);
      setIsProcessing(false);
    }, 2000);
  };

  const handleDownload = () => {
    if (!refactoredCode || !fileName) return;
    
    const blob = new Blob([refactoredCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    
    // Add 'refactored' to the filename before the extension
    const fileNameParts = fileName.split(".");
    const extension = fileNameParts.pop();
    const newFileName = fileNameParts.join(".") + "-refactored." + extension;
    
    a.download = newFileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!fileContent) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="w-96 bg-squadrun-darker/50 border border-squadrun-primary/20">
          <CardContent className="p-6 text-center">
            <p className="text-squadrun-gray">
              Please upload a code file to start refactoring
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white mb-2">Code Refactor</h1>
        <p className="text-squadrun-gray">
          Optimize your code for best practices, improved performance, and readability.
        </p>
      </div>
      
      {!refactoredCode ? (
        <div className="flex-1 flex flex-col">
          <Card className="mb-4 border border-squadrun-primary/20 bg-squadrun-darker/50 flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Original Code</CardTitle>
            </CardHeader>
            <CardContent>
              <CodeDisplay code={fileContent} language={fileName?.split('.').pop() || 'python'} />
            </CardContent>
          </Card>
          
          <Button
            onClick={handleRefactor}
            className="bg-squadrun-primary hover:bg-squadrun-vivid text-white ml-auto"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>Processing...</>
            ) : (
              <>
                <PlayCircle className="mr-2 h-4 w-4" /> Refactor Code
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <Tabs defaultValue="refactored" className="flex-1 flex flex-col">
            <TabsList className="mb-4">
              <TabsTrigger value="original">Original Code</TabsTrigger>
              <TabsTrigger value="refactored">Refactored Code</TabsTrigger>
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
            
            <TabsContent value="refactored" className="flex-1 mt-0">
              <Card className="border border-squadrun-primary/20 bg-squadrun-darker/50 h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Refactored Code</CardTitle>
                </CardHeader>
                <CardContent className="h-[calc(100%-60px)] overflow-auto">
                  <CodeDisplay code={refactoredCode} language={fileName?.split('.').pop() || 'python'} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <Button
            onClick={handleDownload}
            className="bg-squadrun-primary hover:bg-squadrun-vivid text-white mt-4 ml-auto"
          >
            <Download className="mr-2 h-4 w-4" /> Download Refactored Code
          </Button>
        </div>
      )}
    </div>
  );
}
