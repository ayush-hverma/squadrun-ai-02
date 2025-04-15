import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, PlayCircle } from "lucide-react";
import CodeDisplay from "../CodeDisplay";
import { toast } from "@/hooks/use-toast";
import {
  refactorJavaScript,
  refactorPython,
  refactorCPP,
  refactorJava,
} from "@/utils/codeRefactorUtils";

interface CodeRefactorProps {
  fileContent: string | null;
  fileName: string | null;
}

// Core logic to determine which language-specific refactoring to use
const performRefactoring = (code: string, extension: string): string => {
  switch (extension) {
    case "js":
    case "jsx":
    case "ts":
    case "tsx":
      return refactorJavaScript(code);
    case "py":
      return refactorPython(code);
    case "cpp":
    case "c":
    case "h":
      return refactorCPP(code);
    case "java":
      return refactorJava(code);
    default:
      // Generic fallback improvements
      return code
        .replace(/\n\s*\n\s*\n/g, "\n\n")
        .replace(/([a-zA-Z0-9_])([\+\-\*\/=])/g, "$1 $2")
        .replace(/([\+\-\*\/=])([a-zA-Z0-9_])/g, "$1 $2");
  }
};

export default function CodeRefactor({ fileContent, fileName }: CodeRefactorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [refactoredCode, setRefactoredCode] = useState<string | null>(null);
  const [qualityScore, setQualityScore] = useState<number | null>(null);
  const [improvementCount, setImprovementCount] = useState<number>(0);

  const getFileExtension = (): string => {
    return fileName?.split(".").pop()?.toLowerCase() || "txt";
  };

  const handleRefactor = () => {
    if (!fileContent || !fileName) return;

    setIsProcessing(true);
    const fileExt = getFileExtension();

    setTimeout(() => {
      try {
        const refactored = performRefactoring(fileContent, fileExt);
        const improvements = calculateImprovements(fileContent, refactored);

        const baseScore = 90;
        const maxImprovement = 10;
        const score = Math.min(100, baseScore + Math.min(improvements, maxImprovement));

        setRefactoredCode(refactored);
        setImprovementCount(improvements);
        setQualityScore(score);

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

  const calculateImprovements = (original: string, refactored: string): number => {
    if (original === refactored) return 0;

    let count = 0;

    const improvements = [
      ["var\\s+", "var"],
      ["function\\s+", "function"],
      ["\\+\\s*(['\"])", "+"],
      ["console\\.log\\(", "console.log"],
      ["for\\s*\\(", "for"],
      ["if\\s*\\([^)]*\\)\\s*{[^}]*}\\s*else\\s*{[^}]*}", "if-else"],
      ["([a-zA-Z0-9_]+)\\s*:\\s*\\1", "object shorthand"],
    ];

    improvements.forEach(([regex]) => {
      const before = (original.match(new RegExp(regex, "g")) || []).length;
      const after = (refactored.match(new RegExp(regex, "g")) || []).length;
      count += Math.max(0, before - after);
    });

    // Async/Await conversion
    const asyncBefore = (original.match(/async|await/g) || []).length;
    const asyncAfter = (refactored.match(/async|await/g) || []).length;
    count += asyncAfter > asyncBefore ? Math.ceil((asyncAfter - asyncBefore) / 2) : 0;

    // Comments/docstrings added
    const commentBefore = (original.match(/\/\*\*|\*\/|\/\/|#/g) || []).length;
    const commentAfter = (refactored.match(/\/\*\*|\*\/|\/\/|#/g) || []).length;
    count += commentAfter > commentBefore ? Math.ceil((commentAfter - commentBefore) / 5) : 0;

    return Math.max(1, count);
  };

  const handleDownload = () => {
    if (!refactoredCode || !fileName) return;

    const blob = new Blob([refactoredCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    const parts = fileName.split(".");
    const ext = parts.pop();
    const base = parts.join(".");
    a.href = url;
    a.download = `${base}-refactored.${ext}`;
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
              <CodeDisplay code={fileContent} language={getFileExtension()} />
            </CardContent>
          </Card>

          <Button
            onClick={handleRefactor}
            className="bg-squadrun-primary hover:bg-squadrun-vivid text-white ml-auto"
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : <><PlayCircle className="mr-2 h-4 w-4" /> Refactor Code</>}
          </Button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <div className="mb-4 flex items-center">
            {qualityScore !== null && (
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
                  <CodeDisplay code={fileContent} language={getFileExtension()} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="refactored" className="flex-1 mt-0">
              <Card className="border border-squadrun-primary/20 bg-squadrun-darker/50 h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Refactored Code</CardTitle>
                </CardHeader>
                <CardContent className="h-[calc(100%-60px)] overflow-auto">
                  <CodeDisplay code={refactoredCode || ""} language={getFileExtension()} />
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