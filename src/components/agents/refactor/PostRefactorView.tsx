
import React from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import CodeComparison from "@/components/CodeComparison";

interface PostRefactorViewProps {
  originalCode: string;
  refactoredCode: string;
  language: string;
  onDownload: () => void;
  onClear: () => void;
}

export const PostRefactorView = ({
  originalCode,
  refactoredCode,
  language,
  onDownload,
  onClear
}: PostRefactorViewProps) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-row gap-4 items-center">
        <Button 
          onClick={onDownload} 
          variant="outline"
          className="bg-squadrun-darker hover:bg-squadrun-primary/20 border-squadrun-primary/30 text-squadrun-primary hover:text-squadrun-primary transition-all duration-200 hover:scale-102 shadow-sm hover:shadow-squadrun-primary/20"
        >
          <Download className="mr-2 h-4 w-4" />
          Download Refactored Code
        </Button>
        <Button 
          onClick={onClear}
          variant="outline"
          className="border-destructive/30 text-destructive hover:bg-destructive/20 transition-all duration-200"
        >
          <X className="mr-2 h-4 w-4" />
          Clear & Start Over
        </Button>
      </div>
      <div className="flex-1 overflow-hidden rounded-lg border border-squadrun-primary/10 bg-squadrun-darker/50 backdrop-blur-sm shadow-lg">
        <CodeComparison 
          originalCode={originalCode} 
          refactoredCode={refactoredCode} 
          language={language} 
        />
      </div>
    </div>
  );
};
