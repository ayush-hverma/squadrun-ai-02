import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PlayCircle, 
  X 
} from "lucide-react";
import CodeDisplay from "../CodeDisplay";

interface ApiCreatorProps {
  fileContent: string | null;
  fileName: string | null;
}

export default function ApiCreator({ fileContent, fileName }: ApiCreatorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedApiCode, setGeneratedApiCode] = useState<string | null>(null);

  const handleClear = () => {
    setGeneratedApiCode(null);
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white mb-2">API Creator</h1>
        <p className="text-squadrun-gray">
          Generate API code based on your code.
        </p>
      </div>
      
      {generatedApiCode ? (
        <div className="flex-1 flex flex-col">
          <div className="flex items-center mb-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleClear} 
              className="ml-auto text-white hover:bg-squadrun-primary/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <Card className="border border-squadrun-primary/20 bg-squadrun-darker/50 flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Generated API Code</CardTitle>
            </CardHeader>
            <CardContent>
              <CodeDisplay code={generatedApiCode} language="javascript" />
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="flex h-full items-center justify-center">
          <Card className="w-96 bg-squadrun-darker/50 border border-squadrun-primary/20">
            <CardContent className="p-6 text-center">
              <p className="text-squadrun-gray">
                Upload a code file to generate API endpoints
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
