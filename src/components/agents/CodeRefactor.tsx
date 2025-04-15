import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, PlayCircle } from "lucide-react";
import CodeDisplay from "../CodeDisplay";
import { toast } from "@/hooks/use-toast";
import { refactorJavaScript, refactorPython, refactorCPP, refactorJava } from "@/utils/codeRefactorUtils";

interface CodeRefactorProps {
  fileContent: string | null;
  fileName: string | null;
}

// Function to perform the actual refactoring based on file type
const performRefactoring = (code: string, language: string): string => {
  // Determine which language-specific refactoring to use
  if (language === 'js' || language === 'jsx' || language === 'ts' || language === 'tsx') {
    return refactorJavaScript(code);
  } else if (language === 'py') {
    return refactorPython(code);
  } else if (language === 'cpp' || language === 'c' || language === 'h') {
    return refactorCPP(code);
  } else if (language === 'java') {
    return refactorJava(code);
  }
  
  // If we don't have a specific refactoring for this language, apply some common improvements
  let refactored = code;
  
  // Remove multiple blank lines
  refactored = refactored.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  // Add consistent spacing around operators
  refactored = refactored.replace(/([a-zA-Z0-9_])([\+\-\*\/=])/g, '$1 $2');
  refactored = refactored.replace(/([\+\-\*\/=])([a-zA-Z0-9_])/g, '$1 $2');
  
  return refactored;
};

export default function CodeRefactor({ fileContent, fileName }: CodeRefactorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [refactoredCode, setRefactoredCode] = useState<string | null>(null);
  const [qualityScore, setQualityScore] = useState<number | null>(null);
  const [improvementCount, setImprovementCount] = useState<number>(0);

  const handleRefactor = () => {
    if (!fileContent || !fileName) return;
    
    setIsProcessing(true);
    
    // Get the file extension to determine the language
    const fileExt = fileName.split('.').pop()?.toLowerCase() || '';
    
    setTimeout(() => {
      try {
        // Apply actual code refactoring based on file type
        const refactored = performRefactoring(fileContent, fileExt);
        
        // Calculate the number of improvements made
        const improvements = calculateImprovements(fileContent, refactored);
        
        // Calculate quality score (90-100 range based on improvements)
        const baseScore = 90;
        const maxImprovement = 10;
        const score = Math.min(100, baseScore + Math.min(improvements, maxImprovement));
        
        setRefactoredCode(refactored);
        setQualityScore(score);
        setImprovementCount(improvements);
        
        toast({
          title: "Code Refactored Successfully",
          description: `Quality score: ${score}/100 with ${improvements} improvements`,
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

  // Calculate the number of improvements made
  const calculateImprovements = (original: string, refactored: string): number => {
    if (original === refactored) return 0;
    
    // Count differences that represent improvements
    let count = 0;
    
    // Check for var to const/let conversions
    const varToConstDiff = (original.match(/var\s+/g) || []).length - (refactored.match(/var\s+/g) || []).length;
    count += varToConstDiff;
    
    // Check for function to arrow function conversions
    const funcToArrowDiff = (original.match(/function\s+/g) || []).length - (refactored.match(/function\s+/g) || []).length;
    count += funcToArrowDiff;
    
    // Check for template literal conversions
    const concatOperators = (original.match(/\+\s*(['"])/g) || []).length;
    const templateLiterals = (refactored.match(/\${/g) || []).length;
    count += Math.min(concatOperators, templateLiterals);
    
    // Check for deleted console.logs
    const consoleLogs = (original.match(/console\.log\(/g) || []).length - (refactored.match(/console\.log\(/g) || []).length;
    count += consoleLogs;
    
    // Check for for loops converted to forEach, map, etc.
    const forLoops = (original.match(/for\s*\(/g) || []).length - (refactored.match(/for\s*\(/g) || []).length;
    count += forLoops;
    
    // Check for if-else converted to ternaries
    const ifElseBlocks = (original.match(/if\s*\([^)]*\)\s*{[^}]*}\s*else\s*{[^}]*}/g) || []).length - 
                        (refactored.match(/if\s*\([^)]*\)\s*{[^}]*}\s*else\s*{[^}]*}/g) || []).length;
    count += ifElseBlocks;
    
    // Check for object literal shorthand notation
    const objectLiteralProps = (original.match(/([a-zA-Z0-9_]+)\s*:\s*\1/g) || []).length -
                             (refactored.match(/([a-zA-Z0-9_]+)\s*:\s*\1/g) || []).length;
    count += objectLiteralProps;
    
    // Check for async/await conversions
    const asyncAwaitDiff = (refactored.match(/async|await/g) || []).length - 
                          (original.match(/async|await/g) || []).length;
    count += asyncAwaitDiff > 0 ? Math.ceil(asyncAwaitDiff / 2) : 0;
    
    // Add some base improvements for readability enhancements
    const lineCountDiff = refactored.split('\n').length - original.split('\n').length;
    count += Math.abs(lineCountDiff) > 0 ? 1 : 0;
    
    // Check for docstring/comment additions
    const commentDiff = (refactored.match(/\/\*\*|\*\/|\/\/|#/g) || []).length - 
                        (original.match(/\/\*\*|\*\/|\/\/|#/g) || []).length;
    count += commentDiff > 0 ? Math.ceil(commentDiff / 5) : 0;
    
    // Ensure at least 1 improvement is counted if code changed
    return Math.max(1, count);
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
          <div className="mb-4 flex items-center">
            {qualityScore && (
              <div className="mr-auto bg-squadrun-primary/20 rounded-full px-4 py-1 text-white">
                Quality Score: <span className="font-bold">{qualityScore}/100</span>
                <span className="ml-2 text-sm">({improvementCount} improvements)</span>
              </div>
            )}
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
      )}
    </div>
  );
}
