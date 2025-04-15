
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

  const handleAssess = () => {
    if (!fileContent) return;
    
    setIsProcessing(true);
    
    // Simulate processing delay
    setTimeout(() => {
      // Mock quality assessment - in a real app, this would come from an API
      const mockResults = {
        score: 78,
        summary: "Code is generally good but has some areas for improvement, particularly in error handling and documentation.",
        categories: [
          { name: "Readability", score: 85, icon: BookOpen },
          { name: "Maintainability", score: 72, icon: CircleCheck },
          { name: "Performance", score: 83, icon: CircleCheck },
          { name: "Security", score: 65, icon: CircleAlert },
          { name: "Code Smell", score: 70, icon: AlertTriangle }
        ],
        recommendations: [
          "Add error handling for potential exceptions",
          "Improve function documentation with clear param and return types",
          "Consider refactoring long functions into smaller, more focused ones",
          "Add input validation to prevent security issues"
        ],
        snippets: [
          {
            title: "Missing Error Handling",
            code: "function getData() {\n  return fetch(url).then(res => res.json());\n  // Missing error handling\n}",
            suggestion: "function getData() {\n  return fetch(url)\n    .then(res => {\n      if (!res.ok) throw new Error('Network response failed');\n      return res.json();\n    })\n    .catch(error => {\n      console.error('Fetch error:', error);\n      throw error;\n    });\n}"
          }
        ]
      };
      
      setQualityResults(mockResults);
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
