
import { useState } from "react";
import { refactorCode } from "@/utils/qualityUtils/refactors";
import { refactorCodeWithAI, isOpenAIConfigured } from "@/utils/aiUtils/openAiUtils";
import { toast } from "sonner";

export const useCodeRefactor = () => {
  const [refactoredCode, setRefactoredCode] = useState<string | null>(null);
  const [isRefactoring, setIsRefactoring] = useState(false);

  const handleRefactor = async (fileContent: string, language: string) => {
    if (!fileContent) return;
    
    setIsRefactoring(true);
    
    try {
      const instructions = 'improve readability, enhance maintainability, optimize performance, fix security issues, apply DRY principles';
      
      let result: string;
      
      if (isOpenAIConfigured()) {
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
          result = refactorCode(fileContent, language);
          toast.info("Using built-in refactoring tools", {
            description: "AI refactoring unavailable. Using standard refactoring techniques."
          });
        }
      } else {
        result = refactorCode(fileContent, language);
        toast.success("Refactoring complete", {
          description: "Your code has been refactored successfully."
        });
      }
      
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

  const clearRefactoredCode = () => {
    setRefactoredCode(null);
    toast.success("Refactoring cleared", {
      description: "You can now upload a new file."
    });
  };

  return {
    refactoredCode,
    isRefactoring,
    handleRefactor,
    clearRefactoredCode
  };
};
