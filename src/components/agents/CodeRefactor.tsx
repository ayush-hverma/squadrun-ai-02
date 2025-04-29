
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowRightCircle, 
  Download, 
  RefreshCw,
  Cpu,
  X,
  Settings
} from "lucide-react";
import CodeDisplay from "@/components/CodeDisplay";
import CodeComparison from "@/components/CodeComparison";
import NoFileMessage from "@/components/refactor/NoFileMessage";
import { refactorCode, RefactoringOptions, calculateCodeQualityMetrics } from "@/utils/qualityUtils/refactors";
import { refactorCodeWithAI, isGeminiConfigured } from "@/utils/aiUtils/openAiUtils";
import { toast } from "sonner";

interface CodeRefactorProps {
  fileContent: string | null;
  fileName: string | null;
  onClearFile?: () => void;
}

export default function CodeRefactor({ fileContent, fileName, onClearFile }: CodeRefactorProps) {
  const [refactoredCode, setRefactoredCode] = useState<string | null>(null);
  const [isRefactoring, setIsRefactoring] = useState(false);
  const [language, setLanguage] = useState<string>('js');
  const [showSettings, setShowSettings] = useState(false);
  const [refactoringOptions, setRefactoringOptions] = useState<RefactoringOptions>({
    aggressive: false,
    focus: {
      readability: true,
      maintainability: true,
      performance: true,
      security: true,
      codeSmell: true
    },
    techniques: {
      extractConstants: true,
      extractFunctions: true,
      improveNaming: true,
      addTyping: false,
      addComments: true,
      addErrorHandling: false,
      formatCode: true
    }
  });
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    setRefactoredCode(null);
    setMetrics(null);
    if (fileName) {
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
      setLanguage(fileExtension);
    }
  }, [fileContent, fileName]);

  const handleRefactor = async () => {
    if (!fileContent) return;
    
    setIsRefactoring(true);
    
    try {
      const instructions = 'improve readability, enhance maintainability, optimize performance, fix security issues, apply DRY principles';
      
      let result: string;
      
      if (isGeminiConfigured()) {
        try {
          toast.info("Starting AI-powered refactoring", {
            description: "This may take a moment for larger files."
          });
          
          result = await refactorCodeWithAI(fileContent, language);
          
          toast.success("AI-powered refactoring complete", {
            description: "Your code has been refactored using advanced AI techniques."
          });
        } catch (error) {
          console.warn("AI refactoring failed, falling back to built-in refactorer:", error);
          result = refactorCode(fileContent, language, refactoringOptions);
          
          toast.info("Using built-in refactoring tools", {
            description: "AI refactoring unavailable. Using standard refactoring techniques."
          });
        }
      } else {
        result = refactorCode(fileContent, language, refactoringOptions);
        
        toast.success("Refactoring complete", {
          description: "Your code has been refactored successfully."
        });
      }
      
      // Calculate metrics
      const qualityMetrics = calculateCodeQualityMetrics(result, language);
      setMetrics(qualityMetrics);
      
      setRefactoredCode(result);
      
    } catch (error) {
      console.error("Refactoring error:", error);
      toast.error("Refactoring failed", {
        description: error instanceof Error ? error.message : "An error occurred during refactoring."
      });
    } finally {
      setIsRefactoring(false);
    }
  };

  const handleDownload = () => {
    if (!refactoredCode || !fileName) return;
    
    const element = document.createElement("a");
    const file = new Blob([refactoredCode], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    
    const fileNameParts = fileName.split(".");
    const extension = fileNameParts.pop();
    const newFileName = fileNameParts.join(".") + "-refactored." + extension;
    
    element.download = newFileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast.success("Download started", {
      description: `File saved as ${newFileName}`
    });
  };

  const handleClear = () => {
    setRefactoredCode(null);
    setMetrics(null);
    if (onClearFile) {
      onClearFile();
    } else {
      toast.success("Refactoring cleared", {
        description: "You can now upload a new file."
      });
    }
  };

  const toggleOption = (category: keyof RefactoringOptions, option: string) => {
    setRefactoringOptions(prev => {
      const newOptions = { ...prev };
      
      if (category === 'focus' && newOptions.focus) {
        newOptions.focus = {
          ...newOptions.focus,
          [option]: !newOptions.focus[option as keyof typeof newOptions.focus]
        };
      } else if (category === 'techniques' && newOptions.techniques) {
        newOptions.techniques = {
          ...newOptions.techniques,
          [option]: !newOptions.techniques[option as keyof typeof newOptions.techniques]
        };
      } else if (category === 'aggressive') {
        newOptions.aggressive = !newOptions.aggressive;
      }
      
      return newOptions;
    });
  };

  if (!fileContent) {
    return <NoFileMessage />;
  }

  return (
    <div className="p-4 h-full flex flex-col gap-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center">
          {/* Remove ModelPicker UI */}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-1"
        >
          <Settings className="h-4 w-4" />
          <span>Refactoring Options</span>
        </Button>
      </div>
      
      {showSettings && (
        <Card className="border border-squadrun-primary/20 mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-white">Refactoring Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-semibold mb-2 text-squadrun-gray">Focus Areas</h3>
                <div className="space-y-2">
                  {refactoringOptions.focus && Object.keys(refactoringOptions.focus).map(option => (
                    <div key={option} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`focus-${option}`}
                        checked={refactoringOptions.focus[option as keyof typeof refactoringOptions.focus]}
                        onChange={() => toggleOption('focus', option)}
                        className="mr-2 h-4 w-4"
                      />
                      <label htmlFor={`focus-${option}`} className="text-sm text-squadrun-gray capitalize">
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold mb-2 text-squadrun-gray">Refactoring Techniques</h3>
                <div className="space-y-2">
                  {refactoringOptions.techniques && Object.keys(refactoringOptions.techniques).map(option => (
                    <div key={option} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`technique-${option}`}
                        checked={refactoringOptions.techniques[option as keyof typeof refactoringOptions.techniques]}
                        onChange={() => toggleOption('techniques', option)}
                        className="mr-2 h-4 w-4"
                      />
                      <label htmlFor={`technique-${option}`} className="text-sm text-squadrun-gray capitalize">
                        {option.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold mb-2 text-squadrun-gray">Refactoring Intensity</h3>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="aggressive-refactoring"
                    checked={refactoringOptions.aggressive}
                    onChange={() => toggleOption('aggressive', '')}
                    className="mr-2 h-4 w-4"
                  />
                  <label htmlFor="aggressive-refactoring" className="text-sm text-squadrun-gray">
                    Aggressive Refactoring
                  </label>
                </div>
                <p className="text-xs text-squadrun-gray mt-1">
                  Applies more thorough refactoring but may change code behavior more significantly.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {!refactoredCode ? (
        <Card className="border border-squadrun-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-bold text-white">Code Refactoring</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-squadrun-gray mb-2">
                  The refactoring engine will automatically apply best practices for:
                </p>
                <div className="space-y-2">
                  <ul className="list-disc list-inside text-squadrun-gray">
                    <li>Enhancing readability</li>
                    <li>Improving maintainability</li>
                    <li>Optimizing performance</li>
                    <li>Fixing security issues</li>
                    <li>Applying DRY principles</li>
                  </ul>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-squadrun-gray mb-2">
                  Language Detected: <span className="text-squadrun-primary font-semibold">{language.toUpperCase()}</span>
                </p>
                <p className="text-sm text-squadrun-gray">
                  Complete code rewrite will be performed while preserving functionality
                </p>
                <div className="mt-4 flex items-center">
                  <Cpu className="text-squadrun-primary mr-2 h-5 w-5" />
                  <span className="text-sm text-squadrun-gray">
                    {isOpenAIConfigured() ? "AI-powered refactoring available" : "Using built-in refactoring tools"}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleRefactor} 
                className="bg-squadrun-primary hover:bg-squadrun-vivid text-white"
                disabled={isRefactoring}
              >
                {isRefactoring ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Refactoring...
                  </>
                ) : (
                  <>
                    <ArrowRightCircle className="mr-2 h-4 w-4" />
                    Refactor Code
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-row gap-4 items-center">
          <Button 
            onClick={handleDownload} 
            variant="outline"
            className="border-squadrun-primary text-squadrun-primary hover:bg-squadrun-primary/10"
          >
            <Download className="mr-2 h-4 w-4" />
            Download Refactored Code
          </Button>
          <Button 
            onClick={handleClear}
            variant="destructive"
          >
            <X className="mr-2 h-4 w-4" />
            Clear & Start Over
          </Button>
        </div>
      )}

      {!refactoredCode && <div className="flex mt-4">
        <Button
          onClick={handleClear}
          variant="destructive"
          className="ml-auto"
        >
          <X className="mr-2 h-4 w-4" />
          Clear & Start Over
        </Button>
      </div>}

      <div className="flex-1 overflow-hidden">
        {refactoredCode ? (
          <CodeComparison 
            originalCode={fileContent} 
            refactoredCode={metrics ? { code: refactoredCode, metrics } : refactoredCode} 
            language={language} 
          />
        ) : (
          <CodeDisplay code={fileContent} language={language} />
        )}
      </div>
    </div>
  );
}
