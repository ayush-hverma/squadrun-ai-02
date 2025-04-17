
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowRightCircle, 
  Download, 
  RefreshCw,
  Cpu,
  Check,
  AlertTriangle
} from "lucide-react";
import CodeDisplay from "@/components/CodeDisplay";
import NoFileMessage from "@/components/refactor/NoFileMessage";
import { refactorCode } from "@/utils/refactorUtils";
import { toast } from "sonner";

interface CodeRefactorProps {
  fileContent: string | null;
  fileName: string | null;
}

export default function CodeRefactor({ fileContent, fileName }: CodeRefactorProps) {
  const [refactoredCode, setRefactoredCode] = useState<string | null>(null);
  const [isRefactoring, setIsRefactoring] = useState(false);
  const [language, setLanguage] = useState<string>('js');
  const [userInstructions, setUserInstructions] = useState<string>('');
  const [refactorOptions, setRefactorOptions] = useState({
    optimizeReadability: true,
    improveMaintainability: true,
    enhancePerformance: true,
    fixSecurity: true,
    applyDRY: true
  });
  
  useEffect(() => {
    // Reset states when fileContent changes
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
      // Create refactoring instructions based on selected options
      const instructions = [
        ...(refactorOptions.optimizeReadability ? ['improve readability'] : []),
        ...(refactorOptions.improveMaintainability ? ['enhance maintainability'] : []),
        ...(refactorOptions.enhancePerformance ? ['optimize performance'] : []),
        ...(refactorOptions.fixSecurity ? ['fix security issues'] : []),
        ...(refactorOptions.applyDRY ? ['apply DRY principles'] : []),
        userInstructions
      ].filter(Boolean).join(', ');
      
      // Perform the refactoring operation with the comprehensive utility
      // Small delay to show the processing state
      await new Promise(resolve => setTimeout(resolve, 500));
      const result = refactorCode(fileContent, language, instructions);
      setRefactoredCode(result);
      
      toast.success("Refactoring complete", {
        description: "Your code has been refactored successfully."
      });
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
    
    // Add 'refactored' to the filename before the extension
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

  const toggleOption = (option: keyof typeof refactorOptions) => {
    setRefactorOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  if (!fileContent) {
    return <NoFileMessage />;
  }

  return (
    <div className="p-4 h-full flex flex-col gap-4">
      <Card className="border border-squadrun-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold text-white">Code Refactoring</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-squadrun-gray mb-2">
                Select refactoring options:
              </p>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Button 
                    variant={refactorOptions.optimizeReadability ? "default" : "outline"}
                    size="sm" 
                    className={`${refactorOptions.optimizeReadability ? 'bg-squadrun-primary' : 'border-squadrun-primary/40'} mr-2`}
                    onClick={() => toggleOption('optimizeReadability')}
                  >
                    {refactorOptions.optimizeReadability ? <Check className="h-4 w-4 mr-1" /> : null}
                    Readability
                  </Button>
                  
                  <Button 
                    variant={refactorOptions.improveMaintainability ? "default" : "outline"}
                    size="sm" 
                    className={`${refactorOptions.improveMaintainability ? 'bg-squadrun-primary' : 'border-squadrun-primary/40'} mr-2`}
                    onClick={() => toggleOption('improveMaintainability')}
                  >
                    {refactorOptions.improveMaintainability ? <Check className="h-4 w-4 mr-1" /> : null}
                    Maintainability
                  </Button>
                  
                  <Button 
                    variant={refactorOptions.enhancePerformance ? "default" : "outline"}
                    size="sm" 
                    className={`${refactorOptions.enhancePerformance ? 'bg-squadrun-primary' : 'border-squadrun-primary/40'}`}
                    onClick={() => toggleOption('enhancePerformance')}
                  >
                    {refactorOptions.enhancePerformance ? <Check className="h-4 w-4 mr-1" /> : null}
                    Performance
                  </Button>
                </div>
                
                <div className="flex items-center">
                  <Button 
                    variant={refactorOptions.fixSecurity ? "default" : "outline"}
                    size="sm" 
                    className={`${refactorOptions.fixSecurity ? 'bg-squadrun-primary' : 'border-squadrun-primary/40'} mr-2`}
                    onClick={() => toggleOption('fixSecurity')}
                  >
                    {refactorOptions.fixSecurity ? <Check className="h-4 w-4 mr-1" /> : null}
                    Security
                  </Button>
                  
                  <Button 
                    variant={refactorOptions.applyDRY ? "default" : "outline"}
                    size="sm" 
                    className={`${refactorOptions.applyDRY ? 'bg-squadrun-primary' : 'border-squadrun-primary/40'}`}
                    onClick={() => toggleOption('applyDRY')}
                  >
                    {refactorOptions.applyDRY ? <Check className="h-4 w-4 mr-1" /> : null}
                    DRY Principles
                  </Button>
                </div>
              </div>
            </div>
            
            <div>
              <label className="text-sm text-squadrun-gray mb-2 block">
                Language Detected: <span className="text-squadrun-primary font-semibold">{language.toUpperCase()}</span>
              </label>
              <p className="text-sm text-squadrun-gray">
                Complete code rewrite will be performed while preserving functionality
              </p>
              <div className="mt-4 flex items-center">
                <Cpu className="text-squadrun-primary mr-2 h-5 w-5" />
                <span className="text-sm text-squadrun-gray">
                  {Object.values(refactorOptions).filter(Boolean).length} refactoring options enabled
                </span>
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="text-sm text-squadrun-gray mb-2 block">
              Additional Refactoring Instructions (Optional)
            </label>
            <Textarea 
              placeholder="Enter any specific refactoring instructions here..." 
              value={userInstructions}
              onChange={(e) => setUserInstructions(e.target.value)}
              className="min-h-[80px] bg-squadrun-darker border-squadrun-primary/20 text-white"
            />
            <p className="text-xs text-squadrun-gray mt-1">
              Examples: "focus on function modularization", "improve error handling", "replace deprecated APIs"
            </p>
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
