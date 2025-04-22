
import { useState, useRef, DragEvent } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  className?: string;
  compact?: boolean;
}

export default function FileUpload({
  onFileUpload,
  className = "",
  compact = false
}: FileUploadProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAcceptedFileTypes = () => {
    return ".py,.js,.ts,.jsx,.tsx,.java,.cpp,.c,.cs,.go,.rb,.rs,.php,.sh,.sql,.html,.css";
  };

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

  return (
    <div className={className}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept={getAcceptedFileTypes()}
      />
      <Button 
        onClick={handleBrowseClick}
        className="bg-squadrun-primary hover:bg-squadrun-vivid transition-all duration-300 shadow-md hover:shadow-lg text-white w-full"
      >
        <Upload className="mr-2 h-4 w-4" />
        Browse Files
      </Button>
      {fileName && (
        <div className="mt-2 px-4 py-2 bg-squadrun-primary/10 rounded-md text-white text-sm">
          <span className="text-squadrun-primary font-medium">Selected:</span> {fileName}
        </div>
      )}
    </div>
  );
}
