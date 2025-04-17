
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cpu } from "lucide-react";
import CodeDisplay from "../CodeDisplay";
import { toast } from "sonner";
import { QualityResults } from "@/types/codeQuality";
import { analyzeCodeQuality } from "@/utils/qualityUtils/codeAnalyzer";
import { analyzeCodeQualityWithAI, isOpenAIConfigured } from "@/utils/aiUtils/openAiUtils";
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
  
  // When a file is loaded, automatically analyze it
  const analyzeCode = async () => {
    if (!fileContent) return;
    
    setIsProcessing(true);
    
    try {
      const language = fileName?.split('.').pop() || 'javascript';
      let results: QualityResults;
      
      // Try to use AI-powered analysis first, fall back to built-in analyzer
      if (isOpenAIConfigured()) {
        try {
          results = await analyzeCodeQualityWithAI(fileContent, language);
          toast.success("AI-powered code quality analysis complete", {
            description: `Overall Score: ${results.score}/100`,
          });
        } catch (error) {
          console.warn("AI analysis failed, falling back to built-in analyzer:", error);
          results = analyzeCodeQuality(fileContent, language);
          toast.info("Using built-in code analyzer", {
            description: "AI analysis unavailable. Using standard analysis tools.",
          });
        }
      } else {
        // Use the built-in analyzer if OpenAI is not configured
        results = analyzeCodeQuality(fileContent, language);
        toast.success("Code Quality Assessment Complete", {
          description: `Overall Score: ${results.score}/100`,
        });
      }
      
      setQualityResults(results);
      
    } catch (error) {
      console.error("Quality assessment error:", error);
      toast.error("Error Assessing Code Quality", {
        description: "There was an issue analyzing your code. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Automatically analyze when a file is loaded
  useState(() => {
    if (fileContent && !qualityResults && !isProcessing) {
      analyzeCode();
    }
  });

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
        // Show loading view during analysis
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="animate-spin mb-4">
            <Cpu className="h-16 w-16 text-squadrun-primary" />
          </div>
          <h2 className="text-xl font-medium text-white mb-2">Analyzing Code Quality</h2>
          <p className="text-squadrun-gray text-center max-w-md">
            We're examining your code for quality metrics across multiple dimensions including
            readability, maintainability, performance, security, and code smell.
          </p>
        </div>
      ) : (
        // Show analysis results once processing is complete
        <AnalysisView qualityResults={qualityResults} fileName={fileName} />
      )}
    </div>
  );
}
