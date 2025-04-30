import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Cpu, Search, FolderOpen } from "lucide-react";
import { toast } from "sonner";
import { QualityResults } from "@/types/codeQuality";
import { analyzeCodeWithAI, analyzeRepositoryWithAI } from "@/utils/aiUtils/codeAnalysis";
import AnalysisView from "./quality/AnalysisView";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface CodeQualityProps {
  fileContent: string | null;
  fileName: string | null;
  repoFiles?: Array<{path: string, content: string}> | null;
  repoUrl?: string | null;
  hasRepoUrl?: boolean; // New prop to indicate if a repo URL is present
}

export default function CodeQuality({ fileContent, fileName, repoFiles, repoUrl, hasRepoUrl }: CodeQualityProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [qualityResults, setQualityResults] = useState<QualityResults | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [isRepoAnalysis, setIsRepoAnalysis] = useState(false);

  const handleAssessQuality = async () => {
    if (!fileContent) return;

    setIsProcessing(true);
    setQualityResults(null);

    try {
      const language = fileName?.split(".").pop() || "javascript";
      const results = await analyzeCodeWithAI(fileContent, language);

      toast.success("Analysis Complete", {
        description: `Overall Score: ${results.score}/100`,
      });

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

  const handleRepoAssessQuality = async () => {
    if (!repoFiles || repoFiles.length === 0) {
      toast.info("Repository files are being fetched in the background", {
        description: "The analysis will begin once files are loaded. Please wait.",
      });
      return;
    }

    setIsProcessing(true);
    setQualityResults(null);
    setIsRepoAnalysis(true);
    
    try {
      // Process files in batches of 7
      const batchSize = 7;
      const totalBatches = Math.ceil(repoFiles.length / batchSize);
      let overallResults: QualityResults = {
        score: 0,
        readabilityScore: 0,
        maintainabilityScore: 0,
        performanceScore: 0,
        securityScore: 0,
        codeSmellScore: 0,
        issues: [],
        recommendations: []
      };
      
      let processedBatches = 0;
      
      // Process files in batches
      for (let i = 0; i < repoFiles.length; i += batchSize) {
        const batch = repoFiles.slice(i, i + batchSize);
        setProcessingProgress(Math.floor((processedBatches / totalBatches) * 100));
        
        // Create a combined analysis request for the batch
        const results = await analyzeRepositoryWithAI(batch);
        
        // Aggregate results
        overallResults.score += results.score;
        overallResults.readabilityScore += results.readabilityScore;
        overallResults.maintainabilityScore += results.maintainabilityScore;
        overallResults.performanceScore += results.performanceScore;
        overallResults.securityScore += results.securityScore;
        overallResults.codeSmellScore += results.codeSmellScore;
        overallResults.issues = [...overallResults.issues, ...results.issues];
        overallResults.recommendations = [...overallResults.recommendations, ...results.recommendations];
        
        processedBatches++;
        setProcessingProgress(Math.floor((processedBatches / totalBatches) * 100));
      }
      
      // Calculate averages
      overallResults.score = Math.round(overallResults.score / totalBatches);
      overallResults.readabilityScore = Math.round(overallResults.readabilityScore / totalBatches);
      overallResults.maintainabilityScore = Math.round(overallResults.maintainabilityScore / totalBatches);
      overallResults.performanceScore = Math.round(overallResults.performanceScore / totalBatches);
      overallResults.securityScore = Math.round(overallResults.securityScore / totalBatches);
      overallResults.codeSmellScore = Math.round(overallResults.codeSmellScore / totalBatches);
      
      // Deduplicate recommendations and issues
      overallResults.recommendations = Array.from(new Set(overallResults.recommendations));
      overallResults.issues = overallResults.issues.slice(0, 10); // Limit to top 10 issues

      toast.success("Repository Analysis Complete", {
        description: `Overall Score: ${overallResults.score}/100`,
      });

      setQualityResults(overallResults);
    } catch (error) {
      console.error("Repository analysis error:", error);
      toast.error("Error Assessing Repository Quality", {
        description: "Please try again with a different repository.",
      });
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  const handleClear = () => {
    setQualityResults(null);
    setIsRepoAnalysis(false);
    toast.success("Analysis Cleared", {
      description: "You can now upload a new file or repository.",
    });
  };

  if (!fileContent && !repoFiles?.length && !hasRepoUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <Cpu className="h-16 w-16 text-squadrun-primary mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">No Code Selected</h2>
        <p className="text-squadrun-gray text-center">
          Please upload a file or select a GitHub repository to start quality assessment.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white mb-2">AI Code Quality Assessment</h1>
        <p className="text-squadrun-gray">
          Analyzing your code for readability, maintainability, performance, security, and code smell using advanced AI.
        </p>
      </div>

      {!qualityResults ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="flex gap-4 mb-8">
            {fileContent && (
              <Button
                onClick={handleAssessQuality}
                disabled={isProcessing}
                className="bg-squadrun-primary hover:bg-squadrun-vivid text-white"
              >
                <Search className="mr-2 h-4 w-4" />
                Assess File Quality
              </Button>
            )}
            
            {hasRepoUrl && (
              <Button
                onClick={handleRepoAssessQuality}
                disabled={isProcessing}
                className="bg-squadrun-vivid hover:bg-squadrun-primary text-white"
              >
                <FolderOpen className="mr-2 h-4 w-4" />
                Assess Repository Quality
              </Button>
            )}
          </div>

          {isProcessing && (
            <div className="mt-4 flex flex-col items-center w-full max-w-lg">
              <div className="animate-spin mb-4">
                <Cpu className="h-16 w-16 text-squadrun-primary" />
              </div>
              <h2 className="text-xl font-medium text-white mb-2">
                {isRepoAnalysis ? "Analyzing Repository Quality" : "Analyzing File Quality"}
              </h2>
              
              {isRepoAnalysis && (
                <div className="w-full mb-4">
                  <Progress value={processingProgress} className="h-2 bg-squadrun-darker" />
                  <p className="text-squadrun-gray text-center mt-1 text-xs">
                    Processing files in batches ({processingProgress}% complete)
                  </p>
                </div>
              )}
              
              <p className="text-squadrun-gray text-center max-w-md">
                We're examining your {isRepoAnalysis ? "repository" : "code"} for quality metrics including
                readability, maintainability, performance, security, and code smell.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <Card className="bg-squadrun-darker/50 border-squadrun-primary/20 mb-4">
            <CardContent className="p-4">
              <h2 className="text-lg font-bold text-white mb-2">
                {isRepoAnalysis ? (
                  <>Repository Analysis: <span className="text-squadrun-primary">{repoUrl || "GitHub Repository"}</span></>
                ) : (
                  <>File Analysis: <span className="text-squadrun-primary">{fileName}</span></>
                )}
              </h2>
              <p className="text-sm text-squadrun-gray">
                {isRepoAnalysis 
                  ? `Analyzed ${repoFiles?.length || 0} files with batch processing` 
                  : "Individual file analysis"}
              </p>
            </CardContent>
          </Card>
          
          <AnalysisView qualityResults={qualityResults} fileName={isRepoAnalysis ? "Repository" : fileName} />
          
          <div className="mt-4 flex justify-center">
            <Button onClick={handleClear} variant="destructive" className="w-full max-w-md">
              Clear Analysis
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
