
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  AlertTriangle, 
  BookOpen, 
  CircleCheck, 
  CircleAlert, 
  PlayCircle,
  Download
} from "lucide-react";
import CodeDisplay from "../CodeDisplay";
import { toast } from "@/hooks/use-toast";

interface CodeQualityProps {
  fileContent: string | null;
  fileName: string | null;
}

interface QualityMetrics {
  lineLength: number;
  commentRatio: number;
  complexityScore: number;
  securityScore: number;
  consistencyScore: number;
}

interface CodeSnippet {
  title: string;
  code: string;
  suggestion: string;
}

interface CategoryScore {
  name: string;
  score: number;
  icon: React.ElementType;
}

interface QualityResults {
  score: number;
  summary: string;
  categories: CategoryScore[];
  recommendations: string[];
  snippets: CodeSnippet[];
  refactoredCode: string;
}

export default function CodeQuality({ fileContent, fileName }: CodeQualityProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [qualityResults, setQualityResults] = useState<QualityResults | null>(null);

  // Function to analyze code and generate a quality score based on content
  const analyzeCodeQuality = (code: string, language: string): QualityResults => {
    // Generate refactored version of the code with best practices
    const refactoredCode = refactorCode(code, language);
    
    // Calculate metrics for the refactored code
    const metrics = calculateCodeMetrics(refactoredCode);
    
    // Calculate category scores based on code characteristics
    const categories = generateCategoryScores(metrics);
    
    // Calculate overall score (weighted average)
    const weights = [0.25, 0.25, 0.2, 0.2, 0.1];
    const overallScore = Math.round(
      categories.reduce((sum, category, index) => sum + (category.score * weights[index]), 0)
    );
    
    // Generate recommendations based on scores
    const recommendations = generateRecommendations(metrics, overallScore);
    
    // Generate code snippets based on the issues found
    const snippets = generateCodeSnippets(metrics, language);
    
    // Summary based on overall score
    const summary = generateSummary(overallScore, categories);
    
    return {
      score: overallScore,
      summary,
      categories,
      recommendations,
      snippets,
      refactoredCode
    };
  };

  const calculateCodeMetrics = (code: string): QualityMetrics => {
    // Split code into lines
    const lines = code.split('\n');
    
    // Calculate average line length (shorter is often better)
    const totalChars = code.length;
    const lineLength = Math.min(100, 100 - Math.min(30, Math.max(0, (totalChars / lines.length - 40) / 2)));
    
    // Check for comments
    const commentLines = lines.filter(line => 
      line.trim().startsWith('//') || 
      line.trim().startsWith('#') || 
      line.trim().startsWith('/*') || 
      line.includes('*/')
    ).length;
    const commentRatio = Math.min(100, (commentLines / lines.length) * 300);
    
    // Simple complexity heuristic (fewer nested blocks is better)
    const bracesCount = (code.match(/{/g) || []).length;
    const indentationLevel = Math.max(1, bracesCount / Math.max(1, lines.length) * 10);
    const complexityScore = Math.max(50, 100 - indentationLevel * 5);
    
    // Check for potential security issues (very basic check)
    const securityIssues = [
      'eval(', 'exec(', '.innerHTML', 'document.write(', 
      'sql.query(', 'unvalidated', 'unsanitized'
    ];
    const securityIssueCount = securityIssues.reduce((count, issue) => 
      count + (code.includes(issue) ? 1 : 0), 0);
    const securityScore = Math.max(50, 100 - securityIssueCount * 10);
    
    // Check for consistency in code style
    const mixedQuotes = (code.includes("'") && code.includes('"'));
    const mixedIndentation = (code.includes('    ') && code.includes('\t'));
    const consistencyScore = mixedQuotes || mixedIndentation ? 70 : 95;
    
    return {
      lineLength,
      commentRatio,
      complexityScore,
      securityScore,
      consistencyScore
    };
  };

  const generateCategoryScores = (metrics: QualityMetrics): CategoryScore[] => {
    return [
      { 
        name: "Readability", 
        score: Math.round((metrics.lineLength + metrics.commentRatio + metrics.consistencyScore) / 3), 
        icon: BookOpen 
      },
      { 
        name: "Maintainability", 
        score: Math.round((metrics.commentRatio + metrics.complexityScore) / 2), 
        icon: CircleCheck 
      },
      { 
        name: "Performance", 
        score: Math.round(metrics.complexityScore), 
        icon: CircleCheck 
      },
      { 
        name: "Security", 
        score: Math.round(metrics.securityScore), 
        icon: CircleAlert 
      },
      { 
        name: "Code Smell", 
        score: Math.round((metrics.consistencyScore + metrics.complexityScore) / 2), 
        icon: AlertTriangle 
      }
    ];
  };

  const generateRecommendations = (metrics: QualityMetrics, overallScore: number): string[] => {
    const recommendations = [];
    
    if (metrics.commentRatio < 70) {
      recommendations.push("Add more comments to explain complex logic and improve code understanding");
    }
    
    if (metrics.lineLength < 70) {
      recommendations.push("Consider breaking long lines of code into more readable, shorter segments");
    }
    
    if (metrics.complexityScore < 80) {
      recommendations.push("Refactor complex functions into smaller, more focused ones");
    }
    
    if (metrics.securityScore < 80) {
      recommendations.push("Review code for potential security vulnerabilities and add input validation");
    }
    
    if (metrics.consistencyScore < 80) {
      recommendations.push("Standardize code style (quotes, indentation, naming conventions)");
    }
    
    // Always recommend error handling as it's good practice
    if (overallScore < 95) {
      recommendations.push("Add error handling for potential exceptions");
    }
    
    return recommendations;
  };

  const generateCodeSnippets = (metrics: QualityMetrics, language: string): CodeSnippet[] => {
    const snippets: CodeSnippet[] = [];
    
    if (metrics.securityScore < 80) {
      snippets.push({
        title: "Improve Security with Validation",
        code: "function getData() {\n  return fetch(url).then(res => res.json());\n  // Missing error handling\n}",
        suggestion: "function getData() {\n  return fetch(url)\n    .then(res => {\n      if (!res.ok) throw new Error('Network response failed');\n      return res.json();\n    })\n    .catch(error => {\n      console.error('Fetch error:', error);\n      throw error;\n    });\n}"
      });
    }
    
    if (metrics.complexityScore < 80) {
      snippets.push({
        title: "Simplify Complex Logic",
        code: "function process(data) {\n  let result;\n  if (data.type === 'A') {\n    if (data.value > 10) {\n      result = data.value * 2;\n    } else {\n      result = data.value;\n    }\n  } else {\n    result = 0;\n  }\n  return result;\n}",
        suggestion: "function process(data) {\n  // Early return pattern\n  if (data.type !== 'A') return 0;\n  \n  // Simplified conditional logic\n  return data.value > 10 ? data.value * 2 : data.value;\n}"
      });
    }
    
    return snippets;
  };

  const generateSummary = (overallScore: number, categories: CategoryScore[]): string => {
    if (overallScore >= 90) {
      return "Excellent code quality with good practices. Minor improvements possible.";
    } else if (overallScore >= 75) {
      return "Good code quality with some areas needing improvement, particularly in " + 
        categories.filter(c => c.score < 75).map(c => c.name.toLowerCase()).join(" and ") + ".";
    } else if (overallScore >= 60) {
      return "Moderate code quality with several areas requiring attention, especially " + 
        categories.filter(c => c.score < 70).map(c => c.name.toLowerCase()).join(" and ") + ".";
    } else {
      return "Code needs significant improvement across multiple dimensions for better maintainability and reliability.";
    }
  };

  // Function to refactor code based on language
  const refactorCode = (code: string, language: string): string => {
    switch(language) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return refactorJavaScript(code);
      case 'py':
        return refactorPython(code);
      case 'cpp':
      case 'c':
      case 'h':
        return refactorCPP(code);
      case 'java':
        return refactorJava(code);
      default:
        return refactorGeneric(code);
    }
  };

  const refactorJavaScript = (code: string): string => {
    let refactored = code;
    
    // Replace var with const/let
    refactored = refactored.replace(/var\s+([a-zA-Z0-9_]+)\s*=\s*([^;]+);/g, 'const $1 = $2;');
    
    // Convert function declarations to arrow functions where appropriate
    refactored = refactored.replace(/function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s*{/g, 'const $1 = ($2) => {');
    
    // Replace for loops with array methods where possible
    refactored = refactored.replace(
      /for\s*\(\s*let\s+([a-zA-Z0-9_]+)\s*=\s*0;\s*\1\s*<\s*([a-zA-Z0-9_]+)\.length;\s*\1\+\+\s*\)\s*{\s*([^}]*)\s*}/g,
      '$2.forEach((item, index) => {$3})'
    );
    
    // Convert callbacks to async/await style
    refactored = refactored.replace(
      /([a-zA-Z0-9_]+)\s*\.\s*then\s*\(\s*(?:function\s*\(([^)]*)\)|(?:\(([^)]*)\)\s*=>))\s*{([^}]*)}\s*\)/g, 
      'const $2 = await $1'
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
    
    // Add useful comments and docstrings
    refactored = refactored.replace(
      /function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/g, 
      '/**\n * $1 function\n * @param {$2} - Function parameters\n */\nfunction $1($2)'
    );
    
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
    
    // Add docstrings to functions
    refactored = refactored.replace(
      /def\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\):/g,
      'def $1($2):\n    """$1 function.\n    \n    Args:\n        $2\n    """\n'
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
    
    // Add comprehensive error handling
    refactored = refactored.replace(
      /try\s*{([^}]*)}(\s*)catch\s*\(([^)]*)\)\s*{([^}]*)}/g,
      'try {\n$1\n}$2catch (const $3& e) {\n    std::cerr << "Error: " << e.what() << std::endl;\n$4\n}'
    );
    
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
    
    // Add robust javadoc
    refactored = refactored.replace(
      /public\s+([a-zA-Z0-9_<>]+)\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/g,
      '/**\n * $2 method\n *\n * @param $3\n * @return $1\n */\npublic $1 $2($3)'
    );
    
    return refactored;
  };

  const refactorGeneric = (code: string): string => {
    let refactored = code;
    
    // Remove multiple blank lines
    refactored = refactored.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    // Add consistent spacing around operators
    refactored = refactored.replace(/([a-zA-Z0-9_])([\+\-\*\/=])/g, '$1 $2');
    refactored = refactored.replace(/([\+\-\*\/=])([a-zA-Z0-9_])/g, '$1 $2');
    
    // Add consistent indentation
    const lines = refactored.split('\n');
    let indentLevel = 0;
    refactored = lines.map(line => {
      // Decrease indent for closing brackets
      if (line.trim().startsWith('}') || line.trim().startsWith(')')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      
      const indentedLine = ' '.repeat(indentLevel * 2) + line.trim();
      
      // Increase indent after opening brackets
      if (line.includes('{') || line.endsWith('(')) {
        indentLevel += 1;
      }
      
      return indentedLine;
    }).join('\n');
    
    return refactored;
  };

  const handleAssess = () => {
    if (!fileContent) return;
    
    setIsProcessing(true);
    
    // Simulate processing delay
    setTimeout(() => {
      try {
        const language = fileName?.split('.').pop() || 'javascript';
        const results = analyzeCodeQuality(fileContent, language);
        setQualityResults(results);
        
        toast({
          title: "Code Quality Assessment Complete",
          description: `Overall Score: ${results.score}/100`,
          duration: 3000,
        });
      } catch (error) {
        console.error("Quality assessment error:", error);
        toast({
          title: "Error Assessing Code Quality",
          description: "There was an issue analyzing your code. Please try again.",
          variant: "destructive",
          duration: 3000,
        });
      } finally {
        setIsProcessing(false);
      }
    }, 2000);
  };

  const handleDownload = () => {
    if (!qualityResults || !fileName) return;
    
    const blob = new Blob([qualityResults.refactoredCode], { type: "text/plain" });
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
    
    toast({
      title: "Refactored Code Downloaded",
      description: `Saved as ${newFileName}`,
      duration: 3000,
    });
  };

  if (!fileContent) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="w-96 bg-squadrun-darker/50 border border-squadrun-primary/20">
          <CardContent className="p-6 text-center">
            <p className="text-squadrun-gray">
              Please upload a code file to assess quality
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white mb-2">Code Quality Assessment</h1>
        <p className="text-squadrun-gray">
          Analyze your code for readability, maintainability, performance, security and more.
        </p>
      </div>
      
      {!qualityResults ? (
        <div className="flex-1 flex flex-col">
          <Card className="mb-4 border border-squadrun-primary/20 bg-squadrun-darker/50 flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Code to Analyze</CardTitle>
            </CardHeader>
            <CardContent>
              <CodeDisplay code={fileContent} language={fileName?.split('.').pop() || 'python'} />
            </CardContent>
          </Card>
          
          <Button
            onClick={handleAssess}
            className="bg-squadrun-primary hover:bg-squadrun-vivid text-white ml-auto"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>Processing...</>
            ) : (
              <>
                <PlayCircle className="mr-2 h-4 w-4" /> Assess Quality
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-4 overflow-auto">
          <div className="grid grid-cols-5 gap-4">
            <Card className="border border-squadrun-primary/20 bg-squadrun-darker/50 col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Overall Score</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center pt-4">
                <div className="w-32 h-32 rounded-full border-8 border-squadrun-primary flex items-center justify-center mb-4">
                  <span className="text-4xl font-bold text-white">{qualityResults.score}</span>
                </div>
                <p className="text-sm text-center text-squadrun-gray">
                  {qualityResults.summary}
                </p>
              </CardContent>
            </Card>
            
            <Card className="border border-squadrun-primary/20 bg-squadrun-darker/50 col-span-3">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {qualityResults.categories.map((category: CategoryScore, index: number) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center">
                          <category.icon className="h-4 w-4 mr-2 text-squadrun-primary" />
                          <span className="text-sm text-white">{category.name}</span>
                        </div>
                        <span className="text-sm text-squadrun-gray">{category.score}/100</span>
                      </div>
                      <Progress 
                        value={category.score} 
                        className="h-2 bg-squadrun-darker"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Card className="border border-squadrun-primary/20 bg-squadrun-darker/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2 text-squadrun-gray">
                  {qualityResults.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="text-sm">{rec}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border border-squadrun-primary/20 bg-squadrun-darker/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Code Snippets & Suggestions</CardTitle>
              </CardHeader>
              <CardContent className="max-h-[300px] overflow-auto space-y-4">
                {qualityResults.snippets.map((snippet: CodeSnippet, index: number) => (
                  <div key={index}>
                    <h3 className="text-sm font-medium text-white mb-2">{snippet.title}</h3>
                    <div className="mb-2 text-xs">
                      <p className="text-squadrun-gray mb-1">Original:</p>
                      <CodeDisplay code={snippet.code} language={fileName?.split('.').pop() || 'javascript'} />
                    </div>
                    <div className="text-xs">
                      <p className="text-squadrun-gray mb-1">Suggestion:</p>
                      <CodeDisplay code={snippet.suggestion} language={fileName?.split('.').pop() || 'javascript'} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <Card className="border border-squadrun-primary/20 bg-squadrun-darker/50">
              <CardHeader className="pb-2 flex flex-row justify-between items-center">
                <CardTitle className="text-lg">Refactored Code</CardTitle>
                <Button
                  onClick={handleDownload}
                  className="bg-squadrun-primary hover:bg-squadrun-vivid text-white"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" /> Download
                </Button>
              </CardHeader>
              <CardContent className="max-h-[300px] overflow-auto">
                <CodeDisplay code={qualityResults.refactoredCode} language={fileName?.split('.').pop() || 'javascript'} />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
