
import { Card, CardContent } from "@/components/ui/card";
import { Upload } from "lucide-react";

/**
 * Component displayed when no code has been uploaded
 */
const NoCodeMessage = () => {
  return (
    <div className="flex h-full items-center justify-center">
      <Card className="w-96 bg-squadrun-darker/80 border border-squadrun-primary/20 shadow-lg glass-effect animate-fade-in">
        <CardContent className="p-8 flex flex-col items-center text-center gap-3">
          <Upload className="text-squadrun-primary/60 h-12 w-12 mb-2 animate-bounce-subtle" />
          <p className="text-lg font-semibold text-white mb-1">No code file selected</p>
          <p className="text-squadrun-gray text-base">
            Please upload a code file or select one from a repository to get started!
          </p>
          <p className="text-xs text-squadrun-gray/70 mt-2">
            Tip: You can use the file uploader or paste a GitHub repository URL above.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default NoCodeMessage;
