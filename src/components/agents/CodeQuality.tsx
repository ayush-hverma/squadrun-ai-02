
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  AlertTriangle, 
  BookOpen, 
  CircleCheck, 
  CircleAlert, 
  PlayCircle 
} from "lucide-react";
import CodeDisplay from "../CodeDisplay";

interface CodeQualityProps {
  fileContent: string | null;
  fileName: string | null;
}

export default function CodeQuality({ fileContent, fileName }: CodeQualityProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [qualityResults, setQualityResults] = useState<any | null>(null);

  // Function to analyze code and generate a quality score based on content
  const analyzeCodeQuality = (code: string, language: string) => {
    // Simple metrics to evaluate
    const metrics = {
      lineLength: 0,
      commentRatio: 0,
      complexityScore: 0,
      securityScore: 0,
      consistencyScore: 0
    };

    // Split code into lines
    const lines = code.split('\n');
    
    // Calculate average line length (shorter is often better)
    const totalChars = code.length;
    metrics.lineLength = Math.min(100, 100 - Math.min(30, Math.max(0, (totalChars / lines.length - 40) / 2)));
    
    // Check for comments
    const commentLines = lines.filter(line => 
      line.trim().startsWith('//') || 
      line.trim().startsWith('#') || 
      line.trim().startsWith('/*') || 
      line.includes('*/')
    ).length;
    metrics.commentRatio = Math.min(100, (commentLines / lines.length) * 300);
    
    // Simple complexity heuristic (fewer nested blocks is better)
    const bracesCount = (code.match(/{/g) || []).length;
    const indentationLevel = Math.max(1, bracesCount / Math.max(1, lines.length) * 10);
    metrics.complexityScore = Math.max(50, 100 - indentationLevel * 5);
    
    // Check for potential security issues (very basic check)
    const securityIssues = [
      'eval(', 'exec(', '.innerHTML', 'document.write(', 
      'sql.query(', 'unvalidated', 'unsanitized'
    ];
    const securityIssueCount = securityIssues.reduce((count, issue) => 
      count + (code.includes(issue) ? 1 : 0), 0);
    metrics.securityScore = Math.max(50, 100 - securityIssueCount * 10);
    
    // Check for consistency in code style
    const mixedQuotes = (code.includes("'") && code.includes('"'));
    const mixedIndentation = (code.includes('    ') && code.includes('\t'));
    metrics.consistencyScore = mixedQuotes || mixedIndentation ? 70 : 90;
    
    // Calculate category scores based on code characteristics
    const categories = [
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
    
    // Calculate overall score (weighted average)
    const weights = [0.25, 0.25, 0.2, 0.2, 0.1];
    const overallScore = Math.round(
      categories.reduce((sum, category, index) => sum + (category.score * weights[index]), 0)
    );
    
    // Generate recommendations based on scores
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
    recommendations.push("Add error handling for potential exceptions");
    
    // Generate code snippets based on the issues found
    const snippets = [];
    
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
    
    // Summary based on overall score
    let summary = "";
    if (overallScore >= 90) {
      summary = "Excellent code quality with good practices. Minor improvements possible.";
    } else if (overallScore >= 75) {
      summary = "Good code quality with some areas needing improvement, particularly in " + 
        categories.filter(c => c.score < 75).map(c => c.name.toLowerCase()).join(" and ") + ".";
    } else if (overallScore >= 60) {
      summary = "Moderate code quality with several areas requiring attention, especially " + 
        categories.filter(c => c.score < 70).map(c => c.name.toLowerCase()).join(" and ") + ".";
    } else {
      summary = "Code needs significant improvement across multiple dimensions for better maintainability and reliability.";
    }
    
    return {
      score: overallScore,
      summary: summary,
      categories: categories,
      recommendations: recommendations,
      snippets: snippets
    };
  };

  const handleAssess = () => {
    if (!fileContent) return;
    
    setIsProcessing(true);
    
    // Simulate processing delay
    setTimeout(() => {
      const language = fileName?.split('.').pop() || 'javascript';
      const results = analyzeCodeQuality(fileContent, language);
      setQualityResults(results);
      setIsProcessing(false);
    }, 2000);
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
                  {qualityResults.categories.map((category: any, index: number) => (
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
                {qualityResults.snippets.map((snippet: any, index: number) => (
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
        </div>
      )}
    </div>
  );
}
