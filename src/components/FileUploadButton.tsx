
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useRef } from "react";

interface FileUploadButtonProps {
  onFileUpload: (file: File) => void;
}

const FileUploadButton = ({ onFileUpload }: FileUploadButtonProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      onFileUpload(files[0]);
    }
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".py,.js,.ts,.jsx,.tsx,.java,.cpp,.c,.cs,.go,.rb,.rs,.php,.sh,.sql,.html,.css"
      />
      <Button
        onClick={handleBrowseClick}
        className="bg-squadrun-primary hover:bg-squadrun-vivid text-white"
      >
        <Upload className="h-4 w-4 mr-2" />
        Browse Files
      </Button>
    </>
  );
};

export default FileUploadButton;
