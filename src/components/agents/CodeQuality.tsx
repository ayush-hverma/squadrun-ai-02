
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayCircle, Cpu } from "lucide-react";
import CodeDisplay from "../CodeDisplay";
import { toast } from "sonner";
import { QualityResults } from "@/types/codeQuality";
import { analyzeCodeQuality } from "@/utils/qualityUtils/codeAnalyzer";
import { analyzeCodeQualityWithAI, isOpenAIConfigured } from "@/utils/aiUtils/openAiUtils";
import NoCodeMessage from "./quality/NoCodeMessage";
import AnalysisView from "./quality/AnalysisView";
import OpenAIConfig from "./OpenAIConfig";

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
  const [useAI, setUseAI] = useState<boolean>(false);
  const [isAIConfigured, setIsAIConfigured] = useState<boolean>(isOpenAIConfigured());

  /**
   * Handle the assessment process using either built-in analyzer or OpenAI
   */
  const handleAssess = async () => {
    if (!fileContent) return;
    
    setIsProcessing(true);
    
    try {
      const language = fileName?.split('.').pop() || 'javascript';
      let results: QualityResults;
      
      if (useAI && isAIConfigured) {
        // Use OpenAI for analysis
        const aiResults = await analyzeCodeQualityWithAI(fileContent, language);
        results = aiResults;
      } else {
        // Use built-in analyzer
        results = analyzeCodeQuality(fileContent, language);
      }
      
      setQualityResults(results);
      
      toast.success("Code Quality Assessment Complete", {
        description: `Overall Score: ${results.score}/100`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Quality assessment error:", error);
      toast.error("Error Assessing Code Quality", {
        description: "There was an issue analyzing your code. Please try again.",
        duration: 3000,
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleAIConfigChange = (configured: boolean) => {
    setIsAIConfigured(configured);
    if (configured && !useAI) {
      setUseAI(true);
    }
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
        <div className="flex-1 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Card className="border border-squadrun-primary/20 bg-squadrun-darker/50 h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Code to Analyze</CardTitle>
                </CardHeader>
                <CardContent>
                  <CodeDisplay code={fileContent} language={fileName?.split('.').pop() || 'javascript'} />
                </CardContent>
              </Card>
            </div>
            
            <div className="flex flex-col gap-4">
              <Card className="border border-squadrun-primary/20 bg-squadrun-darker/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Analysis Options</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Cpu className="h-5 w-5 mr-2 text-squadrun-primary" />
                        <span>Use AI-powered analysis</span>
                      </div>
                      <Button 
                        variant={useAI ? "default" : "outline"}
                        onClick={() => setUseAI(!useAI)}
                        size="sm"
                        className={`${useAI ? 'bg-squadrun-primary' : 'border-squadrun-primary/40'}`}
                      >
                        {useAI ? "Enabled" : "Disabled"}
                      </Button>
                    </div>
                    
                    <div className="text-sm text-squadrun-gray">
                      {useAI 
                        ? "AI-powered analysis provides more accurate and detailed code quality metrics."
                        : "Standard analysis uses built-in code analyzers for basic quality metrics."
                      }
                    </div>
                    
                    <Button
                      onClick={handleAssess}
                      className="bg-squadrun-primary hover:bg-squadrun-vivid text-white w-full"
                      disabled={isProcessing || (useAI && !isAIConfigured)}
                    >
                      {isProcessing ? (
                        <>Processing...</>
                      ) : (
                        <>
                          <PlayCircle className="mr-2 h-4 w-4" /> Assess Quality
                        </>
                      )}
                    </Button>
                    
                    {useAI && !isAIConfigured && (
                      <p className="text-sm text-amber-400">
                        OpenAI API key required for AI-powered analysis.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {useAI && (
                <OpenAIConfig onConfigChange={handleAIConfigChange} />
              )}
            </div>
          </div>
        </div>
      ) : (
        // Show analysis results once processing is complete
        <AnalysisView qualityResults={qualityResults} fileName={fileName} />
      )}
    </div>
  );
}
