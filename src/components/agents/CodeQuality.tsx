
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cpu, Search } from "lucide-react";
import CodeDisplay from "../CodeDisplay";
import { toast } from "sonner";
import { QualityResults } from "@/types/codeQuality";
import { analyzeCodeQuality } from "@/utils/qualityUtils/codeAnalyzer";
import { analyzeCodeQualityWithAI, isOpenAIConfigured } from "@/utils/aiUtils/openAiUtils";
import NoCodeMessage from "./quality/NoCodeMessage";
import AnalysisView from "./quality/AnalysisView";
import { Button } from "@/components/ui/button";

interface CodeQualityProps {
  fileContent: string | null;
  fileName: string | null;
}

export default function CodeQuality({ fileContent, fileName }: CodeQualityProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [qualityResults, setQualityResults] = useState<QualityResults | null>(null);
  
  // Manually trigger code quality assessment
  const handleAssessQuality = async () => {
    if (!fileContent) return;
    
    setIsProcessing(true);
    setQualityResults(null);
    
    try {
      const language = fileName?.split('.').pop() || 'javascript';
      let results: QualityResults;
      
      // Check if file is small enough for quick analysis
      const isSmallFile = fileContent.split('\n').length < 500;
      
      if (isOpenAIConfigured() && !isSmallFile) {
        try {
          toast.info("Analyzing code with AI...", {
            description: "This may take a moment for larger files.",
          });
          
          results = await analyzeCodeQualityWithAI(fileContent, language);
          toast.success("AI-powered analysis complete", {
            description: `Overall Score: ${results.score}/100`,
          });
        } catch (error) {
          console.warn("AI analysis failed, using built-in analyzer:", error);
          results = analyzeCodeQuality(fileContent, language);
          toast.info("Using built-in analyzer", {
            description: "AI analysis unavailable. Using standard tools.",
          });
        }
      } else {
        // Use the faster built-in analyzer
        results = analyzeCodeQuality(fileContent, language);
        toast.success("Analysis Complete", {
          description: `Overall Score: ${results.score}/100`,
        });
      }
      
      setQualityResults(results);
      
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Error Assessing Code Quality", {
        description: "Please try again with a different file.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Clear the current analysis
  const handleClear = () => {
    setQualityResults(null);
    toast.success("Analysis Cleared", {
      description: "You can now upload a new file.",
    });
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
          Analyzing your code for readability, maintainability, performance, security and code smell.
        </p>
      </div>
      
      {!qualityResults ? (
        // Show analysis button when no results are present
        <div className="flex-1 flex flex-col items-center justify-center">
          <Button 
            onClick={handleAssessQuality} 
            disabled={isProcessing}
            className="bg-squadrun-primary hover:bg-squadrun-vivid text-white"
          >
            <Search className="mr-2 h-4 w-4" />
            Assess Quality
          </Button>
          {isProcessing && (
            <div className="mt-4 flex flex-col items-center">
              <div className="animate-spin mb-4">
                <Cpu className="h-16 w-16 text-squadrun-primary" />
              </div>
              <h2 className="text-xl font-medium text-white mb-2">Analyzing Code Quality</h2>
              <p className="text-squadrun-gray text-center max-w-md">
                We're examining your code for quality metrics including
                readability, maintainability, performance, security, and code smell.
              </p>
            </div>
          )}
        </div>
      ) : (
        // Show analysis results once processing is complete
        <div className="flex-1 flex flex-col">
          <AnalysisView qualityResults={qualityResults} fileName={fileName} />
          <div className="mt-4 flex justify-center">
            <Button 
              onClick={handleClear} 
              variant="destructive"
              className="w-full max-w-md"
            >
              Clear Analysis
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

