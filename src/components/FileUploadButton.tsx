
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";

interface FileUploadButtonProps {
  onFileUpload: (file: File) => void;
  className?: string;
}

const FileUploadButton = ({ onFileUpload, className = "" }: FileUploadButtonProps) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      onFileUpload(files[0]);
      toast.success("File uploaded successfully");
    }
  };

  const getAcceptedFileTypes = () => {
    return ".py,.js,.ts,.jsx,.tsx,.java,.cpp,.c,.cs,.go,.rb,.rs,.php,.sh,.sql,.html,.css";
  };

  return (
    <div className={className}>
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={handleFileChange}
        accept={getAcceptedFileTypes()}
      />
      <Button
        onClick={() => document.getElementById("file-upload")?.click()}
        className="bg-squadrun-primary hover:bg-squadrun-vivid text-white"
      >
        <Upload className="mr-2 h-4 w-4" />
        Browse Files
      </Button>
    </div>
  );
};

export default FileUploadButton;
