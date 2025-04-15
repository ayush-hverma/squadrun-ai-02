
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CodeDisplay from "../CodeDisplay";
import { toast } from "@/hooks/use-toast";
import { processCodeRefactoring } from "@/utils/refactorUtils";
import { RefactoringResult } from "@/types/refactor";
import RefactorHeader from "./refactor/RefactorHeader";
import RefactorActions from "./refactor/RefactorActions";
import ImprovementsList from "./refactor/ImprovementsList";
import NoCodeState from "./refactor/NoCodeState";

interface CodeRefactorProps {
  fileContent: string | null;
  fileName: string | null;
}

export default function CodeRefactor({ fileContent, fileName }: CodeRefactorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [refactorResult, setRefactorResult] = useState<RefactoringResult | null>(null);

  // Handle the refactoring process
  const handleRefactor = () => {
    if (!fileContent || !fileName) return;
    
    setIsProcessing(true);
    
    // Get the file extension to determine the language
    const fileExt = fileName.split('.').pop()?.toLowerCase() || '';
    
    setTimeout(() => {
      try {
        // Process the code refactoring
        const result = processCodeRefactoring(fileContent, fileExt);
        
        setRefactorResult(result);
        
        toast({
          title: "Code Refactored Successfully",
          description: `Quality score: ${result.qualityScore}/100 with ${result.improvementCount} improvements`,
          duration: 3000,
        });
      } catch (error) {
        toast({
          title: "Error Refactoring Code",
          description: "There was an issue refactoring your code. Please try again.",
          variant: "destructive",
          duration: 3000,
        });
        console.error("Refactoring error:", error);
      } finally {
        setIsProcessing(false);
      }
    }, 1500);
  };

  const handleDownload = () => {
    if (!refactorResult?.refactoredCode || !fileName) return;
    
    const blob = new Blob([refactorResult.refactoredCode], { type: "text/plain" });
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
    return <NoCodeState />;
  }

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white mb-2">Code Refactor</h1>
        <p className="text-squadrun-gray">
          Optimize your code for best practices, improved performance, and readability.
        </p>
      </div>
      
      {!refactorResult ? (
        <div className="flex-1 flex flex-col">
          <Card className="mb-4 border border-squadrun-primary/20 bg-squadrun-darker/50 flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Original Code</CardTitle>
            </CardHeader>
            <CardContent>
              <CodeDisplay code={fileContent} language={fileName?.split('.').pop() || 'python'} />
            </CardContent>
          </Card>
          
          <RefactorActions 
            onRefactor={handleRefactor}
            onDownload={handleDownload}
            isProcessing={isProcessing}
            isRefactored={false}
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <RefactorHeader 
            qualityScore={refactorResult.qualityScore} 
            improvementCount={refactorResult.improvementCount} 
          />
          
          <Tabs defaultValue="refactored" className="flex-1 flex flex-col">
            <TabsList className="mb-4">
              <TabsTrigger value="original">Original Code</TabsTrigger>
              <TabsTrigger value="refactored">Refactored Code</TabsTrigger>
              <TabsTrigger value="improvements">Improvements ({refactorResult.improvements.length})</TabsTrigger>
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
                  <CodeDisplay 
                    code={refactorResult.refactoredCode} 
                    language={fileName?.split('.').pop() || 'python'} 
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="improvements" className="flex-1 mt-0">
              <ImprovementsList improvements={refactorResult.improvements} />
            </TabsContent>
          </Tabs>
          
          <RefactorActions 
            onRefactor={handleRefactor}
            onDownload={handleDownload}
            isProcessing={isProcessing}
            isRefactored={true}
          />
        </div>
      )}
    </div>
  );
}
