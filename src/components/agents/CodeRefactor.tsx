
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRightCircle, Download, RefreshCw } from "lucide-react";
import CodeDisplay from "@/components/CodeDisplay";
import NoFileMessage from "@/components/refactor/NoFileMessage";
import { refactorCode } from "@/utils/refactorUtils";
import { toast } from "@/components/ui/sonner";

interface CodeRefactorProps {
  fileContent: string | null;
  fileName: string | null;
}

export default function CodeRefactor({ fileContent, fileName }: CodeRefactorProps) {
  const [refactoredCode, setRefactoredCode] = useState<string | null>(null);
  const [isRefactoring, setIsRefactoring] = useState(false);
  const [language, setLanguage] = useState<string>('js');
  const [userInstructions, setUserInstructions] = useState<string>('');
  
  useEffect(() => {
    // Reset states when fileContent changes
    setRefactoredCode(null);
    if (fileName) {
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
      setLanguage(fileExtension);
    }
  }, [fileContent, fileName]);

  const handleRefactor = () => {
    if (!fileContent) return;
    
    setIsRefactoring(true);
    
    try {
      // Perform the refactoring operation
      const result = refactorCode(fileContent, language, userInstructions);
      setRefactoredCode(result);
      toast({
        title: "Refactoring complete",
        description: "Your code has been refactored successfully."
      });
    } catch (error) {
      toast({
        title: "Refactoring failed",
        description: "An error occurred during refactoring.",
        variant: "destructive"
      });
      console.error("Refactoring error:", error);
    } finally {
      setIsRefactoring(false);
    }
  };

  const handleDownload = () => {
    if (!refactoredCode || !fileName) return;
    
    const element = document.createElement("a");
    const file = new Blob([refactoredCode], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `refactored-${fileName}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "Download started",
      description: `File saved as refactored-${fileName}`
    });
  };

  if (!fileContent) {
    return <NoFileMessage />;
  }

  return (
    <div className="p-4 h-full flex flex-col gap-4">
      <Card className="border border-squadrun-primary/20">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">Code Refactoring</h2>
          <div className="mb-4">
            <label className="text-sm text-squadrun-gray mb-2 block">
              Refactoring Instructions (Optional)
            </label>
            <Textarea 
              placeholder="Enter any specific refactoring instructions here..." 
              value={userInstructions}
              onChange={(e) => setUserInstructions(e.target.value)}
              className="min-h-[80px] bg-squadrun-darker border-squadrun-primary/20 text-white"
            />
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
            {refactoredCode && (
              <Button 
                onClick={handleDownload} 
                variant="outline"
                className="border-squadrun-primary text-squadrun-primary hover:bg-squadrun-primary/10"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Refactored Code
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="original" className="h-full">
          <TabsList className="bg-squadrun-darker">
            <TabsTrigger value="original">Original Code</TabsTrigger>
            <TabsTrigger value="refactored" disabled={!refactoredCode}>
              Refactored Code
            </TabsTrigger>
          </TabsList>
          <TabsContent value="original" className="h-[calc(100%-40px)] overflow-hidden">
            <CodeDisplay code={fileContent} language={language} />
          </TabsContent>
          <TabsContent value="refactored" className="h-[calc(100%-40px)] overflow-hidden">
            {refactoredCode ? (
              <CodeDisplay code={refactoredCode} language={language} />
            ) : (
              <div className="flex items-center justify-center h-full bg-squadrun-darker rounded-md p-4">
                <p className="text-squadrun-gray">Click "Refactor Code" to see the refactored version</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
