
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayCircle } from "lucide-react";
import CodeDisplay from "../CodeDisplay";
import { toast } from "@/hooks/use-toast";
import { QualityResults } from "@/types/codeQuality";
import { analyzeCodeQuality } from "@/utils/qualityUtils/codeAnalyzer";
import NoCodeMessage from "./quality/NoCodeMessage";
import AnalysisView from "./quality/AnalysisView";

interface CodeQualityProps {
  fileContent: string | null;
  fileName: string | null;
}

/**
 * Main component for code quality assessment
 */
export default function CodeQuality({ fileContent, fileName }: CodeQualityProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [qualityResults, setQualityResults] = useState<QualityResults | null>(null);

  /**
   * Handle the assessment process
   */
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

  // When no file is selected, show the upload prompt
  if (!fileContent) {
    return <NoCodeMessage />;
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
        // Show code input view when no analysis has been performed yet
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
        // Show analysis results once processing is complete
        <AnalysisView qualityResults={qualityResults} fileName={fileName} />
      )}
    </div>
  );
}
