import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Cpu, Search, FolderOpen } from "lucide-react";
import { toast } from "sonner";
import { QualityResults } from "@/types/codeQuality";
import { analyzeCodeWithAI, analyzeRepositoryWithAI } from "@/utils/aiUtils/codeAnalysis";
import AnalysisView from "./quality/AnalysisView";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileEntry } from "./hooks/useRepoFileSelector";
import FileAnalysisTable from './quality/FileAnalysisTable';
//import { QualityMetrics } from '@/components/agents/quality/QualityMetrics';
//import { QualityIssues } from '@/components/agents/quality/QualityIssues';
//import { QualityRecommendations } from '@/components/agents/quality/QualityRecommendations';

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
    console.debug(`[CodeQuality] ${message}`, data ? data : '');
  }
};

interface CodeQualityProps {
  fileContent: string | null;
  fileName: string | null;
  repoFiles?: Array<{path: string, content: string}> | null;
  selectedFiles?: FileEntry[]; // New prop for selected files
  repoUrl?: string | null;
  hasRepoUrl?: boolean;
  githubUrl?: string;
}

export default function CodeQuality({ 
  fileContent, 
  fileName, 
  repoFiles, 
  selectedFiles = [], // Default to empty array
  repoUrl, 
  hasRepoUrl,
  githubUrl 
}: CodeQualityProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [qualityResults, setQualityResults] = useState<QualityResults | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [isRepoAnalysis, setIsRepoAnalysis] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState('');
  const [currentBatch, setCurrentBatch] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);
  const [repositoryName, setRepositoryName] = useState<string | null>(null);
  const [selectedFileIndex, setSelectedFileIndex] = useState<number | null>(null);
  const [fileResults, setFileResults] = useState<QualityResults[]>([]);

  // Check if GitHub URL is entered (not empty)
  const hasGithubUrl = Boolean(githubUrl?.trim());

  log.debug('Component rendered', { 
    hasFileContent: !!fileContent, 
    fileName, 
    repoFilesCount: repoFiles?.length,
    selectedFilesCount: selectedFiles?.length,
    repoUrl,
    hasRepoUrl,
    githubUrl,
    hasGithubUrl
  });

  useEffect(() => {
    // Extract repository name from GitHub URL if available
    if (githubUrl) {
      try {
        const url = new URL(githubUrl);
        const pathParts = url.pathname.split('/').filter(Boolean);
        if (pathParts.length >= 2) {
          setRepositoryName(`${pathParts[0]}/${pathParts[1]}`);
        } else {
          setRepositoryName(url.hostname);
        }
      } catch (e) {
        setRepositoryName(githubUrl);
      }
    } else if (repoUrl) {
      setRepositoryName(repoUrl);
    }
  }, [githubUrl, repoUrl]);

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

  const handleRepoAssessQuality = async (analyzeAll: boolean = false) => {
    try {
      setError(null);
      setIsProcessing(true);
      setProcessingProgress(0);
      setQualityResults(null);
      setCurrentFile('');
      setCurrentBatch(0);
      setTotalBatches(0);
      setIsRepoAnalysis(analyzeAll);
      setSelectedFileIndex(null);

      // For selected files analysis
      if (!analyzeAll) {
        if (!selectedFiles || selectedFiles.length === 0) {
          throw new Error('No files selected for analysis');
        }

        const validFiles = selectedFiles.filter(f => f.content && f.content.trim().length > 0);
        
        if (validFiles.length === 0) {
          throw new Error('No valid files with content to analyze');
        }

        setTotalBatches(validFiles.length);
        
        // Analyze each selected file individually using code analysis
        const results = await Promise.all(
          validFiles.map(async (file) => {
            const language = file.path.split('.').pop() || 'javascript';
            return analyzeCodeWithAI(file.content || '', language);
          })
        );

        setFileResults(results);

        // Combine results from individual file analyses
        const combinedResults: QualityResults = {
          score: Math.round(results.reduce((sum, result) => sum + result.score, 0) / results.length),
          issues: results.flatMap(result => result.issues),
          recommendations: results.flatMap(result => result.recommendations),
          readabilityScore: Math.round(results.reduce((sum, result) => sum + (result.readabilityScore || 0), 0) / results.length),
          maintainabilityScore: Math.round(results.reduce((sum, result) => sum + (result.maintainabilityScore || 0), 0) / results.length),
          performanceScore: Math.round(results.reduce((sum, result) => sum + (result.performanceScore || 0), 0) / results.length),
          securityScore: Math.round(results.reduce((sum, result) => sum + (result.securityScore || 0), 0) / results.length),
          codeSmellScore: Math.round(results.reduce((sum, result) => sum + (result.codeSmellScore || 0), 0) / results.length)
        };

        setCurrentFile(validFiles[0]?.path || '');
        setProcessingProgress(100);
        setQualityResults(combinedResults);

        log.info('Selected files quality assessment complete', {
          score: combinedResults.score,
          issues: combinedResults.issues.length,
          recommendations: combinedResults.recommendations.length,
          analyzedFileCount: validFiles.length,
          analyzedFiles: validFiles.map(f => f.path)
        });

        toast.success(`Analysis Complete for ${validFiles.length} selected files`, {
          description: `Overall Score: ${combinedResults.score}/100`,
        });
        return;
      }

      // For full repository analysis
      if (!repoFiles || repoFiles.length === 0) {
        throw new Error('No files found in repository');
      }

      const validFiles = repoFiles.filter(f => f.content && f.content.trim().length > 0);
      
      if (validFiles.length === 0) {
        throw new Error('No valid files with content to analyze');
      }

      setTotalBatches(validFiles.length);
      const results = await analyzeRepositoryWithAI(validFiles);
      setCurrentFile(validFiles[0]?.path || '');
      setProcessingProgress(100);
      setQualityResults(results);

      log.info('Repository quality assessment complete', {
        score: results.score,
        issues: results.issues.length,
        recommendations: results.recommendations.length,
        analyzedFileCount: validFiles.length,
        analyzeAll
      });
      
      toast.success(`Analysis Complete for ${validFiles.length} files`, {
        description: `Overall Score: ${results.score}/100`,
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

  const handleFileSelect = (index: number) => {
    setSelectedFileIndex(index);
    if (fileResults[index]) {
      setQualityResults(fileResults[index]);
    }
  };

  const handleReset = () => {
    setSelectedFileIndex(null);
    if (fileResults.length > 0) {
      const combinedResults: QualityResults = {
        score: Math.round(fileResults.reduce((sum, result) => sum + result.score, 0) / fileResults.length),
        issues: fileResults.flatMap(result => result.issues),
        recommendations: fileResults.flatMap(result => result.recommendations),
        readabilityScore: Math.round(fileResults.reduce((sum, result) => sum + (result.readabilityScore || 0), 0) / fileResults.length),
        maintainabilityScore: Math.round(fileResults.reduce((sum, result) => sum + (result.maintainabilityScore || 0), 0) / fileResults.length),
        performanceScore: Math.round(fileResults.reduce((sum, result) => sum + (result.performanceScore || 0), 0) / fileResults.length),
        securityScore: Math.round(fileResults.reduce((sum, result) => sum + (result.securityScore || 0), 0) / fileResults.length),
        codeSmellScore: Math.round(fileResults.reduce((sum, result) => sum + (result.codeSmellScore || 0), 0) / fileResults.length)
      };
      setQualityResults(combinedResults);
    }
  };

  if (!fileContent && !repoFiles?.length && !hasRepoUrl && !hasGithubUrl) {
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
            
            {/* Show different buttons based on selection state */}
            {(hasRepoUrl || hasGithubUrl) && (
              <>
                {selectedFiles && selectedFiles.length > 0 && (
                  <Button
                    onClick={() => handleRepoAssessQuality(false)}
                    disabled={isProcessing}
                    className="bg-squadrun-vivid hover:bg-squadrun-primary text-white"
                  >
                    <FolderOpen className="mr-2 h-4 w-4" />
                    Assess {selectedFiles.length} Selected Files
                  </Button>
                )}
              <Button
                  onClick={() => handleRepoAssessQuality(true)}
                disabled={isProcessing}
                className="bg-squadrun-vivid hover:bg-squadrun-primary text-white"
              >
                <FolderOpen className="mr-2 h-4 w-4" />
                  Assess All Repository Files
              </Button>
              </>
            )}
          </div>

          {/* Show selected files count */}
          {selectedFiles && selectedFiles.length > 0 && (
            <div className="text-sm text-squadrun-primary mb-4">
              {selectedFiles.length} {selectedFiles.length === 1 ? 'file' : 'files'} selected for analysis
            </div>
          )}

          {isProcessing && (
            <div className="mt-4 flex flex-col items-center w-full max-w-lg">
              <div className="animate-spin mb-4">
                <Cpu className="h-16 w-16 text-squadrun-primary" />
              </div>
              <h2 className="text-xl font-medium text-white mb-2">
                {isRepoAnalysis 
                  ? "Analyzing Repository Quality" 
                  : `Analyzing ${selectedFiles.length} Files Quality`}
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
                We're examining your {isRepoAnalysis ? "repository" : "selected files"} for quality metrics including
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
                  <>Repository Analysis: <span className="text-squadrun-primary">{repositoryName}</span></>
                ) : (
                  <>Files Analysis: <span className="text-squadrun-primary">{selectedFiles.map(f => f.path).join(', ')}</span></>
                )}
              </h2>
              <p className="text-sm text-squadrun-gray">
                {isRepoAnalysis 
                  ? `Analyzed ${repoFiles?.length || 0} files with batch processing` 
                  : `Analyzed ${selectedFiles.length} selected files`}
              </p>
            </CardContent>
          </Card>
          
          {qualityResults && !isRepoAnalysis && (
            <div className="space-y-6">
              <FileAnalysisTable
                files={selectedFiles}
                fileResults={fileResults}
                selectedFileIndex={selectedFileIndex}
                onFileSelect={handleFileSelect}
                onReset={handleReset}
              />
              
              <Card className="bg-squadrun-darker/50 border border-squadrun-primary/20 transition-all duration-300 ease-in-out">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-white mb-4 transition-all duration-300 ease-in-out">
                    {selectedFileIndex !== null 
                      ? `Quality Assessment: ${selectedFiles[selectedFileIndex]?.path}`
                      : 'Overall Quality Assessment'}
                  </h2>
                  <div className="transition-opacity duration-300 ease-in-out">
                    <AnalysisView 
                      qualityResults={qualityResults} 
                      fileName={selectedFileIndex !== null ? selectedFiles[selectedFileIndex]?.path : undefined}
                      isRepositoryAnalysis={isRepoAnalysis} 
                      repositoryName={repositoryName} 
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {qualityResults && isRepoAnalysis && (
            <div className="space-y-6">
              <AnalysisView 
                qualityResults={qualityResults} 
                fileName={fileName} 
                isRepositoryAnalysis={isRepoAnalysis} 
                repositoryName={repositoryName} 
              />
            </div>
          )}

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
