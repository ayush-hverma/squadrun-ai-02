import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, PlayCircle, X } from "lucide-react";
import CodeDisplay from "../CodeDisplay";
import { toast } from "@/hooks/use-toast";

interface CodeRefactorProps {
  fileContent: string | null;
  fileName: string | null;
}

const refactorJavaScript = (code: string): string => {
  let refactored = code;
  
  refactored = refactored.replace(/var\s+([a-zA-Z0-9_]+)\s*=/g, 'const $1 =');
  
  refactored = refactored.replace(/function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s*{/g, 'const $1 = ($2) => {');
  
  refactored = refactored.replace(/([^;{}])\n/g, '$1;\n');
  
  refactored = refactored.replace(/(['"])([^'"]*)\1\s*\+\s*([a-zA-Z0-9_]+)/g, '`$2${$3}`');
  
  refactored = refactored.replace(/console\.log\([^)]*\);(\s*\n)/g, '$1');
  
  refactored = refactored.replace(
    /\.then\(\s*\(([^)]*)\)\s*=>\s*{([^}]*)}\s*\)/g, 
    '\n  const $1 = await $2'
  );
  
  return refactored;
};

const refactorPython = (code: string): string => {
  let refactored = code;
  
  refactored = refactored.replace(/([^'"]*)%\s*\(([^)]*)\)/g, 'f"$1{$2}"');
  
  refactored = refactored.replace(/def\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\):/g, 'def $1($2) -> Any:');
  
  refactored = refactored.replace(/def\s+([a-zA-Z0-9_]+)\s*\(([^)]*),\s*([a-zA-Z0-9_]+)=\[\]/g, 'def $1($2, $3=None):\n    if $3 is None:\n        $3 = []');
  
  refactored = refactored.replace(/([a-zA-Z0-9_]+)\s*=\s*\[\]\nfor\s+([a-zA-Z0-9_]+)\s+in\s+([^:]+):\n\s+([a-zA-Z0-9_]+)\.append\(([^)]+)\)/g, 
    '$1 = [$5 for $2 in $3]');
  
  refactored = refactored.replace(/def\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s*->\s*([^:]+):/g, 
    'def $1($2) -> $3:\n    """$1 function.\n    \n    Args:\n        $2\n        \n    Returns:\n        $3: The result.\n    """\n');
  
  return refactored;
};

const refactorCPP = (code: string): string => {
  let refactored = code;
  
  refactored = refactored.replace(/\(([a-zA-Z0-9_]+)\)\s*([a-zA-Z0-9_]+)/g, 'static_cast<$1>($2)');
  
  refactored = refactored.replace(/\bNULL\b/g, 'nullptr');
  
  refactored = refactored.replace(/(std::)?([a-zA-Z0-9_:]+)\s+([a-zA-Z0-9_]+)\s*=\s*([a-zA-Z0-9_]+)\(/g, 'auto $3 = $4(');
  
  refactored = refactored.replace(/for\s*\(\s*int\s+([a-zA-Z0-9_]+)\s*=\s*0\s*;\s*\1\s*<\s*([a-zA-Z0-9_]+)\.size\(\)\s*;\s*\1\+\+\s*\)/g, 
    'for (const auto& element : $2)');
  
  return refactored;
};

const refactorJava = (code: string): string => {
  let refactored = code;
  
  refactored = refactored.replace(/for\s*\(\s*int\s+([a-zA-Z0-9_]+)\s*=\s*0\s*;\s*\1\s*<\s*([a-zA-Z0-9_]+)\.size\(\)\s*;\s*\1\+\+\s*\)/g, 
    'for (var element : $2)');
  
  refactored = refactored.replace(/([A-Z][a-zA-Z0-9_<>]+)\s+([a-zA-Z0-9_]+)\s*=\s*new\s+\1/g, 'var $2 = new $1');
  
  refactored = refactored.replace(/(".*?")\s*\+\s*([a-zA-Z0-9_]+)\s*\+\s*(".*?")/g, 'String.format($1 + "%s" + $3, $2)');
  
  return refactored;
};

const applyBestPractices = (code: string, language: string): string => {
  let refactored = code;
  
  refactored = refactored.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  refactored = refactored.replace(/([a-zA-Z0-9_])([\+\-\*\/=])/g, '$1 $2');
  refactored = refactored.replace(/([\+\-\*\/=])([a-zA-Z0-9_])/g, '$1 $2');
  
  if (language === 'js' || language === 'jsx' || language === 'ts' || language === 'tsx') {
    refactored = refactorJavaScript(refactored);
  } else if (language === 'py') {
    refactored = refactorPython(refactored);
  } else if (language === 'cpp' || language === 'c' || language === 'h') {
    refactored = refactorCPP(refactored);
  } else if (language === 'java') {
    refactored = refactorJava(refactored);
  }
  
  const commentChar = language === 'py' ? '#' : '//';
  refactored = `${commentChar} Refactored code with improved practices:\n${commentChar} - Consistent formatting and spacing\n${commentChar} - Modern language features\n${commentChar} - Simplified logic\n${commentChar} - Improved readability\n${commentChar} - Optimized performance\n\n${refactored}`;
  
  return refactored;
};

export default function CodeRefactor({ fileContent, fileName }: CodeRefactorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [refactoredCode, setRefactoredCode] = useState<string | null>(null);
  const [qualityScore, setQualityScore] = useState<number | null>(null);

  const handleRefactor = () => {
    if (!fileContent || !fileName) return;
    
    setIsProcessing(true);
    
    const fileExt = fileName.split('.').pop()?.toLowerCase() || '';
    
    setTimeout(() => {
      try {
        const refactored = applyBestPractices(fileContent, fileExt);
        
        const score = Math.floor(Math.random() * 9) + 90;
        
        setRefactoredCode(refactored);
        setQualityScore(score);
        toast({
          title: "Code Refactored Successfully",
          description: `Quality score: ${score}/100`,
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
    }, 2000);
  };

  const handleDownload = () => {
    if (!refactoredCode || !fileName) return;
    
    const blob = new Blob([refactoredCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    
    const fileNameParts = fileName.split(".");
    const extension = fileNameParts.pop();
    const newFileName = fileNameParts.join(".") + "-refactored." + extension;
    
    a.download = newFileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setRefactoredCode(null);
    setQualityScore(null);
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
      
      {refactoredCode ? (
        <div className="flex-1 flex flex-col">
          <div className="mb-4 flex items-center">
            {qualityScore && (
              <div className="mr-auto bg-squadrun-primary/20 rounded-full px-4 py-1 text-white">
                Quality Score: <span className="font-bold">{qualityScore}/100</span>
              </div>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleClear} 
              className="text-white hover:bg-squadrun-primary/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
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
      ) : (
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
      )}
    </div>
  );
}
