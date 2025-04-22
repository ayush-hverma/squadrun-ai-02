
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
    <>
      <div className="flex flex-row gap-4 items-center">
        <Button 
          onClick={onDownload} 
          variant="outline"
          className="border-squadrun-primary text-squadrun-primary hover:bg-squadrun-primary/10"
        >
          <Download className="mr-2 h-4 w-4" />
          Download Refactored Code
        </Button>
        <Button 
          onClick={onClear}
          variant="destructive"
        >
          <X className="mr-2 h-4 w-4" />
          Clear & Start Over
        </Button>
      </div>
      <div className="flex-1 overflow-hidden">
        <CodeComparison 
          originalCode={originalCode} 
          refactoredCode={refactoredCode} 
          language={language} 
        />
      </div>
    </>
  );
};
