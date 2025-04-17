
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface FileUploadProps {
  onFileUpload: (file: File) => void;
}

export default function FileUpload({ onFileUpload }: FileUploadProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setFileName(files[0].name);
      onFileUpload(files[0]);
    }
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Get accepted file extensions for code files
  const getAcceptedFileTypes = () => {
    return ".py,.js,.ts,.jsx,.tsx,.java,.cpp,.c,.cs,.go,.rb,.rs,.php,.sh,.sql,.html,.css";
  };

  return (
    <Card className="border border-squadrun-primary/20">
      <CardContent className="p-6">
        <div className="flex flex-col items-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept={getAcceptedFileTypes()}
          />
          <Button 
            onClick={handleBrowseClick}
            className="bg-squadrun-primary hover:bg-squadrun-vivid text-white mb-2 w-full"
          >
            <Upload className="mr-2 h-4 w-4" /> Browse Files
          </Button>
          {fileName && (
            <div className="mt-4 px-4 py-2 bg-squadrun-primary/10 rounded-md text-white w-full text-center">
              Selected: {fileName}
            </div>
          )}
          {!fileName && (
            <p className="text-squadrun-gray text-sm mt-2">
              Upload any code file (.py, .js, .java, .cpp, etc.)
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
