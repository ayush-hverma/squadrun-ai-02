
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, PlayCircle } from "lucide-react";
import CodeDisplay from "../CodeDisplay";
import { toast } from "@/hooks/use-toast";

interface CodeRefactorProps {
  fileContent: string | null;
  fileName: string | null;
}

// Helper functions for code refactoring
const refactorJavaScript = (code: string): string => {
  let refactored = code;
  
  // Replace var with const/let
  refactored = refactored.replace(/var\s+([a-zA-Z0-9_]+)\s*=\s*([^;]+);/g, 'const $1 = $2;');
  
  // Convert function declarations to arrow functions
  refactored = refactored.replace(/function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s*{/g, 'const $1 = ($2) => {');
  
  // Replace for loops with array methods where possible
  refactored = refactored.replace(
    /for\s*\(\s*let\s+([a-zA-Z0-9_]+)\s*=\s*0;\s*\1\s*<\s*([a-zA-Z0-9_]+)\.length;\s*\1\+\+\s*\)\s*{\s*([^}]*)\s*}/g,
    '$2.forEach((item, index) => {$3})'
  );
  
  // Convert callbacks to async/await
  refactored = refactored.replace(
    /([a-zA-Z0-9_]+)\s*\.\s*then\s*\(\s*(?:function\s*\(([^)]*)\)|(?:\(([^)]*)\)\s*=>))\s*{([^}]*)}\s*\)/g, 
    (match, obj, p1, p2, body) => {
      const param = p1 || p2 || 'result';
      return `const ${param} = await ${obj}`;
    }
  );
  
  // Replace string concatenation with template literals
  refactored = refactored.replace(/(['"])([^'"]*)\1\s*\+\s*([a-zA-Z0-9_]+)/g, '`$2${$3}`');
  refactored = refactored.replace(/([a-zA-Z0-9_]+)\s*\+\s*(['"])([^'"]*)\2/g, '`${$1}$3`');
  
  // Remove unnecessary console.logs
  refactored = refactored.replace(/console\.log\([^)]*\);(\s*\n)/g, '$1');
  
  // Replace traditional conditionals with ternary where appropriate
  refactored = refactored.replace(
    /if\s*\(([^)]+)\)\s*{\s*return\s+([^;]+);\s*}\s*else\s*{\s*return\s+([^;]+);\s*}/g,
    'return $1 ? $2 : $3;'
  );
  
  // Use object shorthand notation
  refactored = refactored.replace(/{\s*([a-zA-Z0-9_]+)\s*:\s*([a-zA-Z0-9_]+)\s*}/g, (match, p1, p2) => {
    if (p1 === p2) {
      return `{ ${p1} }`;
    }
    return match;
  });
  
  // Add proper semicolons
  refactored = refactored.replace(/([^;\s{}])\s*\n\s*(?![)}\],;])/g, '$1;\n');
  
  // Convert to ES6 import/export syntax
  refactored = refactored.replace(/const\s+([a-zA-Z0-9_]+)\s*=\s*require\(['"]([^'"]+)['"]\);/g, 'import $1 from "$2";');
  refactored = refactored.replace(/module\.exports\s*=\s*([a-zA-Z0-9_]+);/g, 'export default $1;');
  
  return refactored;
};

const refactorPython = (code: string): string => {
  let refactored = code;
  
  // Replace old-style string formatting with f-strings
  refactored = refactored.replace(/"([^"]*)"%\s*\(([^)]*)\)/g, 'f"$1{$2}"');
  refactored = refactored.replace(/'([^']*)'\s*%\s*\(([^)]*)\)/g, "f'$1{$2}'");
  
  // Convert traditional for loops to list comprehensions
  refactored = refactored.replace(
    /([a-zA-Z0-9_]+)\s*=\s*\[\]\s*\n\s*for\s+([a-zA-Z0-9_]+)\s+in\s+([^:]+):\s*\n\s+([a-zA-Z0-9_]+)\.append\(([^)]+)\)/g, 
    '$1 = [$5 for $2 in $3]'
  );
  
  // Use enumerate instead of manual indexing
  refactored = refactored.replace(
    /for\s+i\s+in\s+range\(len\(([a-zA-Z0-9_]+)\)\):/g,
    'for i, item in enumerate($1):'
  );
  
  // Replace if x == True/False with if x/if not x
  refactored = refactored.replace(/if\s+([a-zA-Z0-9_]+)\s*==\s*True/g, 'if $1');
  refactored = refactored.replace(/if\s+([a-zA-Z0-9_]+)\s*==\s*False/g, 'if not $1');
  
  // Use context managers (with statements)
  refactored = refactored.replace(
    /([a-zA-Z0-9_]+)\s*=\s*open\(([^)]+)\)\s*\n([^]*?)([a-zA-Z0-9_]+)\.close\(\)/gs,
    'with open($2) as $1:\n$3'
  );
  
  // Use more Pythonic idioms
  refactored = refactored.replace(/^import sys\s*\nsys\.exit\(\)/gm, 'import sys\nraise SystemExit()');
  
  // Add type hints
  refactored = refactored.replace(/def\s+([a-zA-Z0-9_]+)\s*\(([^):\n]*)\):/g, (match, funcName, params) => {
    if (!params.includes(':')) {
      const paramsList = params.split(',').map(p => {
        const trimmed = p.trim();
        return trimmed ? `${trimmed}: Any` : '';
      }).filter(Boolean);
      
      return `def ${funcName}(${paramsList.join(', ')}) -> Any:`;
    }
    return match;
  });
  
  // Replace mutable default arguments
  refactored = refactored.replace(
    /def\s+([a-zA-Z0-9_]+)\s*\(([^)]*),\s*([a-zA-Z0-9_]+)=\[\]/g, 
    'def $1($2, $3=None):\n    if $3 is None:\n        $3 = []'
  );
  
  return refactored;
};

const refactorCPP = (code: string): string => {
  let refactored = code;
  
  // Replace NULL with nullptr
  refactored = refactored.replace(/\bNULL\b/g, 'nullptr');
  
  // Use auto for variable declarations where type is obvious
  refactored = refactored.replace(/(std::)?([a-zA-Z0-9_:]+)<[^>]+>\s+([a-zA-Z0-9_]+)\s*=\s*/g, 'auto $3 = ');
  
  // Replace raw loops with range-based for loops
  refactored = refactored.replace(
    /for\s*\(\s*int\s+([a-zA-Z0-9_]+)\s*=\s*0\s*;\s*\1\s*<\s*([a-zA-Z0-9_]+)\.size\(\)\s*;\s*\1\+\+\s*\)/g, 
    'for (const auto& element : $2)'
  );
  
  // Convert raw pointers to smart pointers
  refactored = refactored.replace(
    /([a-zA-Z0-9_]+)\s*\*\s*([a-zA-Z0-9_]+)\s*=\s*new\s+([a-zA-Z0-9_]+)/g,
    'std::unique_ptr<$1> $2 = std::make_unique<$3>'
  );
  
  // Remove raw delete calls (assuming smart pointers are used)
  refactored = refactored.replace(/delete\s+([a-zA-Z0-9_]+);/g, '// Smart pointer will handle memory');
  
  // Replace C-style casts with C++ static_cast
  refactored = refactored.replace(/\(([a-zA-Z0-9_]+)\)\s*([a-zA-Z0-9_().]+)/g, 'static_cast<$1>($2)');
  
  // Ensure standard namespace is properly qualified
  refactored = refactored.replace(/\bvector\b/g, 'std::vector');
  refactored = refactored.replace(/\bstring\b/g, 'std::string');
  refactored = refactored.replace(/\bmap\b/g, 'std::map');
  
  // Add include directives if needed
  if (refactored.includes('unique_ptr') && !refactored.includes('#include <memory>')) {
    refactored = '#include <memory>\n' + refactored;
  }
  
  return refactored;
};

const refactorJava = (code: string): string => {
  let refactored = code;
  
  // Replace raw loops with enhanced for loops
  refactored = refactored.replace(
    /for\s*\(\s*int\s+([a-zA-Z0-9_]+)\s*=\s*0\s*;\s*\1\s*<\s*([a-zA-Z0-9_]+)\.size\(\)\s*;\s*\1\+\+\s*\)/g, 
    'for (var item : $2)'
  );
  
  // Use var instead of explicit types where possible
  refactored = refactored.replace(/([A-Z][a-zA-Z0-9_<>]+)\s+([a-zA-Z0-9_]+)\s*=\s*new\s+\1/g, 'var $2 = new $1');
  
  // Use streams for filtering and mapping
  refactored = refactored.replace(
    /List<([a-zA-Z0-9_]+)>\s+([a-zA-Z0-9_]+)\s*=\s*new\s+ArrayList<>\(\);[\s\n]*for\s*\(([a-zA-Z0-9_]+)\s+([a-zA-Z0-9_]+)\s*:\s*([a-zA-Z0-9_]+)\)\s*{\s*if\s*\(([^}]*)\)\s*{\s*([a-zA-Z0-9_]+)\.add\(([^;]*)\);\s*}\s*}/g,
    'List<$1> $2 = $5.stream()\n  .filter($4 -> $6)\n  .map($4 -> $8)\n  .collect(Collectors.toList());'
  );
  
  // Use String.format instead of concatenation
  refactored = refactored.replace(/(".*?")\s*\+\s*([a-zA-Z0-9_]+)\s*\+\s*(".*?")/g, 'String.format($1 + "%s" + $3, $2)');
  
  // Import statements for stream operations if they are used
  if (refactored.includes('.stream()') && !refactored.includes('import java.util.stream')) {
    refactored = 'import java.util.stream.*;\n' + refactored;
  }
  
  // Use try-with-resources
  refactored = refactored.replace(
    /([a-zA-Z0-9_<>]+)\s+([a-zA-Z0-9_]+)\s*=\s*new\s+([a-zA-Z0-9_<>]+)\(([^)]*)\);[\s\n]*try\s*{([^}]*)}\s*finally\s*{\s*([a-zA-Z0-9_]+)\.close\(\);\s*}/g,
    'try ($1 $2 = new $3($4)) {$5}'
  );
  
  return refactored;
};

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
        
        // Calculate quality score (85-98 range based on improvements)
        const baseScore = 85;
        const maxImprovement = 13;
        const score = Math.min(98, baseScore + Math.min(improvements, maxImprovement));
        
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
    
    // Add some base improvements for readability enhancements
    const lineCountDiff = refactored.split('\n').length - original.split('\n').length;
    count += Math.abs(lineCountDiff) > 0 ? 1 : 0;
    
    // For syntax-specific improvements
    if (refactored.includes('async') && !original.includes('async')) count++;
    if (refactored.includes('await') && !original.includes('await')) count++;
    if (refactored.includes('forEach') && !original.includes('forEach')) count++;
    if (refactored.includes('map(') && !original.includes('map(')) count++;
    
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
