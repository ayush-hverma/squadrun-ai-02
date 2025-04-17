
import { useState, useRef, DragEvent } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface FileUploadProps {
  onFileUpload: (file: File) => void;
}

export default function FileUpload({ onFileUpload }: FileUploadProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
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

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      setFileName(files[0].name);
      onFileUpload(files[0]);
    }
  };

  // Get accepted file extensions for code files
  const getAcceptedFileTypes = () => {
    return ".py,.js,.ts,.jsx,.tsx,.java,.cpp,.c,.cs,.go,.rb,.rs,.php,.sh,.sql,.html,.css";
  };

  return (
    <Card className="border border-squadrun-primary/30 shadow-lg transition-all duration-300 hover:shadow-squadrun-primary/20">
      <CardContent className="p-6">
        <div 
          className={`flex flex-col items-center transition-all duration-300 
            ${isDragging ? 'scale-102 border-2 border-dashed border-squadrun-primary bg-squadrun-primary/10 rounded-md' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept={getAcceptedFileTypes()}
          />
          <div className="flex flex-col items-center w-full gap-4 p-4">
            <div className="rounded-full bg-squadrun-primary/20 p-4 transition-all duration-300 hover:bg-squadrun-primary/30">
              <Upload className="h-8 w-8 text-squadrun-primary" />
            </div>
            
            <Button 
              onClick={handleBrowseClick}
              className="bg-squadrun-primary hover:bg-squadrun-vivid transition-all duration-300 shadow-md hover:shadow-lg text-white w-full"
            >
              Browse Files
            </Button>
            
            {!fileName && (
              <p className="text-squadrun-gray text-sm mt-2 text-center">
                Drag and drop any code file here<br />or click Browse Files
              </p>
            )}
          </div>
          
          {fileName && (
            <div className="mt-4 px-4 py-3 bg-squadrun-primary/10 rounded-md text-white w-full text-center animate-fade-in transition-all duration-300 hover:bg-squadrun-primary/20">
              <span className="text-squadrun-primary font-medium">Selected:</span> {fileName}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
