import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Cpu, Search, FolderOpen } from "lucide-react";
import { toast } from "sonner";
import { QualityResults } from "@/types/codeQuality";
import { analyzeCodeWithAI, analyzeRepositoryWithAI } from "@/utils/aiUtils/codeAnalysis";
import { isGeminiConfigured } from "@/utils/aiUtils/geminiConfig";
import AnalysisView from "./quality/AnalysisView";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

/**
 * Logging utility for debugging
 */
const log = {
  info: (message: string, data?: any) => {
    console.log(`[CodeQuality] ${message}`, data ? data : '');
  },
  error: (message: string, error?: any) => {
    console.error(`[CodeQuality] ${message}`, error ? error : '');
    if (error instanceof Error) {
      console.error(`[CodeQuality] Stack trace:`, error.stack);
    }
  },
  warn: (message: string, data?: any) => {
    console.warn(`[CodeQuality] ${message}`, data ? data : '');
  },
  debug: (message: string, data?: any) => {
    // Always log in debug mode
    console.debug(`[CodeQuality] ${message}`, data ? data : '');
  }
};

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
  const [error, setError] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState('');
  const [currentBatch, setCurrentBatch] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);

  log.debug('Component rendered', { 
    hasFileContent: !!fileContent, 
    fileName, 
    repoFilesCount: repoFiles?.length,
    repoUrl,
    hasRepoUrl
  });

  useEffect(() => {
    const checkGeminiConfig = async () => {
      try {
        // Since we have a hardcoded API key, this will always return true
        const configured = true;
        log.info('Gemini configuration check', { configured });
      } catch (error) {
        log.error('Error checking Gemini configuration', error);
        setError('Failed to check Gemini configuration');
      }
    };
    checkGeminiConfig();
  }, []);

  const handleAssessQuality = async () => {
    try {
      setError(null);
      setIsProcessing(true);
      setProcessingProgress(0);
      setQualityResults(null);

      log.info('Starting file quality assessment', {
        hasFileContent: !!fileContent,
        contentLength: fileContent?.length
      });

      if (!fileContent) {
        throw new Error('No file content provided');
      }

      const language = fileName?.split(".").pop() || "javascript";
      log.debug('Analyzing file', { fileName, language });
      
      const results = await analyzeCodeWithAI(fileContent, language);
      
      // Log raw Gemini response
      log.info('Gemini API Response - File Analysis', {
        fileName,
        rawResponse: results,
        responseType: typeof results,
        hasScore: 'score' in results,
        hasIssues: 'issues' in results,
        hasRecommendations: 'recommendations' in results
      });
      
      log.info('Analysis complete', { 
        fileName,
        overallScore: results.score,
        metrics: {
          readability: results.readabilityScore,
          maintainability: results.maintainabilityScore,
          performance: results.performanceScore,
          security: results.securityScore,
          codeSmells: results.codeSmellScore
        }
      });

      toast.success("Analysis Complete", {
        description: `Overall Score: ${results.score}/100`,
      });

      setQualityResults(results);
    } catch (error) {
      log.error('Error assessing file quality', error);
      setError(error instanceof Error ? error.message : 'Failed to assess code quality');
      toast.error(error instanceof Error ? error.message : 'Failed to assess code quality');
    } finally {
      setIsProcessing(false);
      setProcessingProgress(100);
    }
  };

  const handleRepoAssessQuality = async () => {
    try {
      setError(null);
      setIsProcessing(true);
      setProcessingProgress(0);
      setQualityResults(null);
      setCurrentFile('');
      setCurrentBatch(0);
      setTotalBatches(0);

      log.info('Starting repository quality assessment', {
        totalFiles: repoFiles?.length,
        repoUrl
      });

      if (!repoFiles || repoFiles.length === 0) {
        throw new Error('No repository files provided');
      }

      const results = await analyzeRepositoryWithAI(repoFiles);
      setQualityResults(results);
      log.info('Repository quality assessment complete', {
        score: results.score,
        issues: results.issues.length,
        recommendations: results.recommendations.length
      });
    } catch (error) {
      log.error('Error assessing repository quality', error);
      setError(error instanceof Error ? error.message : 'Failed to assess repository quality');
      toast.error(error instanceof Error ? error.message : 'Failed to assess repository quality');
    } finally {
      setIsProcessing(false);
      setProcessingProgress(100);
    }
  };

  const handleClear = () => {
    log.info('Clearing analysis results');
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
