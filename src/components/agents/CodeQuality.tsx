import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Cpu, Search, X } from "lucide-react";
import { toast } from "sonner";
import { QualityResults } from "@/types/codeQuality";
import { analyzeCodeQuality } from "@/utils/qualityUtils/codeAnalyzer";
import { analyzeCodeQualityWithAI, isOpenAIConfigured } from "@/utils/aiUtils/openAiUtils";
import NoCodeMessage from "./quality/NoCodeMessage";
import AnalysisView from "./quality/AnalysisView";
import ModelPicker from "@/components/ModelPicker";
import FileUploadButton from "@/components/FileUploadButton";

export default function CodeQuality() {
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [qualityResults, setQualityResults] = useState<QualityResults | null>(null);
  const [model, setModel] = useState<"gemini" | "openai" | "groq">("openai");

  const handleFileUpload = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = e => {
      const content = e.target?.result as string;
      setFileContent(content);
      setQualityResults(null);
    };
    reader.readAsText(file);
  };

  const handleAssessQuality = async () => {
    if (!fileContent) return;
    
    setIsProcessing(true);
    setQualityResults(null);
    
    try {
      const language = fileName?.split('.').pop() || 'javascript';
      let results: QualityResults;
      
      const isSmallFile = fileContent.split('\n').length < 500;
      
      // In the future, we can add model-specific logic here based on the selected model
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

  const handleClear = () => {
    setFileContent(null);
    setFileName(null);
    setQualityResults(null);
    toast.success("Analysis cleared", {
      description: "You can now upload a new file.",
    });
  };

  if (!fileContent) {
    return (
      <div className="p-4 h-full flex flex-col">
        <div className="mb-3 flex items-center">
          <span className="text-squadrun-gray mr-2 text-sm">Model:</span>
          <ModelPicker value={model} onChange={setModel} />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <FileUploadButton onFileUpload={handleFileUpload} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <span className="text-squadrun-gray mr-2 text-sm">Model:</span>
          <ModelPicker value={model} onChange={setModel} />
        </div>
        <div className="flex gap-2">
          <FileUploadButton onFileUpload={handleFileUpload} />
          {qualityResults && (
            <Button 
              onClick={handleClear}
              variant="destructive"
            >
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>
      
      {!qualityResults ? (
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
