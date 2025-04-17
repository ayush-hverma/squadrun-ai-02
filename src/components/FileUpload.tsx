
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileType, Check, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFileUpload: (file: File) => void;
}

export default function FileUpload({ onFileUpload }: FileUploadProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setFileName(files[0].name);
      onFileUpload(files[0]);
      toast({
        title: "File uploaded",
        description: `${files[0].name} has been uploaded successfully.`,
        duration: 3000,
      });
    }
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      
      if (isAcceptedFileType(fileExtension)) {
        setFileName(file.name);
        onFileUpload(file);
        toast({
          title: "File uploaded",
          description: `${file.name} has been uploaded successfully.`,
          duration: 3000,
        });
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a code file.",
          variant: "destructive",
        });
      }
    }
  };

  // Get accepted file extensions for code files
  const getAcceptedFileTypes = () => {
    return ".py,.js,.ts,.jsx,.tsx,.java,.cpp,.c,.cs,.go,.rb,.rs,.php,.sh,.sql,.html,.css";
  };
  
  const isAcceptedFileType = (extension: string) => {
    const acceptedTypes = getAcceptedFileTypes().split(',').map(t => t.replace('.', ''));
    return acceptedTypes.includes(extension);
  };

  return (
    <Card className={`border ${isDragging ? 'pulse-border border-squadrun-primary/50' : 'border-squadrun-primary/20'} transition-all duration-300 hover:shadow-md`}>
      <CardContent className="p-6">
        <div
          className="flex flex-col items-center"
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
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={handleBrowseClick} 
                  className={`${
                    isDragging 
                      ? 'bg-squadrun-vivid scale-105' 
                      : 'bg-squadrun-primary hover:bg-squadrun-vivid'
                  } text-white mb-2 w-full transition-all duration-300`}
                >
                  <Upload className="mr-2 h-4 w-4" /> 
                  {isDragging ? 'Drop file here' : 'Browse Files'}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Click to browse or drag a file here</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {fileName && (
            <div className="mt-4 px-4 py-3 bg-squadrun-primary/10 rounded-md text-white w-full animate-in">
              <div className="flex items-center">
                <FileType className="h-5 w-5 mr-2 text-squadrun-primary" />
                <span className="truncate flex-1">{fileName}</span>
                <Check className="h-4 w-4 text-green-400 ml-2" />
              </div>
            </div>
          )}
          
          {!fileName && !isDragging && (
            <div className="mt-4 text-sm text-squadrun-gray text-center animate-in">
              <AlertCircle className="h-4 w-4 mx-auto mb-2 opacity-50" />
              <p>Supported file types: code files (.js, .py, .java, etc.)</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
