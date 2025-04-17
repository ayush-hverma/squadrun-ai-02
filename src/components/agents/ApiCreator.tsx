import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { toast } from "sonner";
import NoFileMessage from "@/components/refactor/NoFileMessage";

interface ApiCreatorProps {
  fileContent: string | null;
  fileName: string | null;
}

export default function ApiCreator({ fileContent, fileName }: ApiCreatorProps) {
  const [generatedApi, setGeneratedApi] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Existing generateApi method would remain the same

  // New clear method to reset the state
  const handleClear = () => {
    setGeneratedApi(null);
    toast.success("API generation cleared", {
      description: "You can now upload a new file."
    });
  };

  if (!fileContent) {
    return <NoFileMessage />;
  }

  return (
    <div className="p-4 h-full flex flex-col">
      {/* Existing content */}
      {generatedApi && (
        <div className="mt-4 flex justify-center">
          <Button 
            onClick={handleClear} 
            variant="destructive"
            className="bg-red-500 hover:bg-red-600"
          >
            <X className="mr-2 h-4 w-4" />
            Clear API Generation
          </Button>
        </div>
      )}
    </div>
  );
}
