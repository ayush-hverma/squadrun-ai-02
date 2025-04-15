
import { Button } from "@/components/ui/button";
import { Download, PlayCircle } from "lucide-react";

interface RefactorActionsProps {
  onRefactor: () => void;
  onDownload: () => void;
  isProcessing: boolean;
  isRefactored: boolean;
}

const RefactorActions = ({ 
  onRefactor, 
  onDownload, 
  isProcessing, 
  isRefactored 
}: RefactorActionsProps) => {
  if (isRefactored) {
    return (
      <Button
        onClick={onDownload}
        className="bg-squadrun-primary hover:bg-squadrun-vivid text-white mt-4 ml-auto"
      >
        <Download className="mr-2 h-4 w-4" /> Download Refactored Code
      </Button>
    );
  }

  return (
    <Button
      onClick={onRefactor}
      className="bg-squadrun-primary hover:bg-squadrun-vivid text-white ml-auto"
      disabled={isProcessing}
    >
      {isProcessing ? (
        <>Processing...</>
      ) : (
        <>
          <PlayCircle className="mr-2 h-4 w-4" /> Refactor Code
        </>
      )}
    </Button>
  );
};

export default RefactorActions;
