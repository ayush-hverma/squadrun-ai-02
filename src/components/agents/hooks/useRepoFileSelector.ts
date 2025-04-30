
import { useState, useRef } from "react";
import { toast } from "sonner";

export interface FileEntry {
  path: string;
  type: "file" | "dir";
  size?: number;
}

export const useRepoFileSelector = (initialFileContent: string | null, initialFileName: string | null) => {
  const [githubUrl, setGithubUrl] = useState("");
  const [repoFiles, setRepoFiles] = useState<FileEntry[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileEntry | null>(null);
  const [selectedFileContent, setSelectedFileContent] = useState<string | null>(initialFileContent);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(initialFileName);
  const [fileDropdownOpen, setFileDropdownOpen] = useState(false);
  const [fetchingFileContent, setFetchingFileContent] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle GitHub repository input
  const handleGithubRepoInput = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!githubUrl.trim()) {
      toast.error("Please enter a GitHub repository URL");
      return;
    }

    setLoadingFiles(true);
    setRepoFiles([]);
    setSelectedFile(null);
    setSelectedFileContent(null);
    setSelectedFileName(null);
    setFetchError(null);

    try {
      // This is a mock implementation
      // In a real app, this would make an API call to fetch repository files
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock repo files for demo purposes
      const mockFiles = [
        { path: "src/index.js", type: "file" as const, size: 1024 },
        { path: "src/components/App.js", type: "file" as const, size: 2048 },
        { path: "src/utils/helpers.js", type: "file" as const, size: 512 },
      ];
      
      setRepoFiles(mockFiles);
      toast.success("Repository files loaded successfully");
      setFileDropdownOpen(true);
    } catch (error) {
      setFetchError(error instanceof Error ? error.message : "Failed to fetch repository files");
      toast.error("Failed to fetch repository files");
    } finally {
      setLoadingFiles(false);
    }
  };

  // Handle file selection and fetch content
  const fetchFileContent = async (file: FileEntry) => {
    setFetchingFileContent(true);
    setFetchError(null);

    try {
      // Mock API call to fetch file content
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock file content
      const mockContent = `// This is mock content for: ${file.path}\n\nconst exampleFunction = () => {\n  console.log("Hello world");\n};\n\nexport default exampleFunction;`;
      
      setSelectedFileContent(mockContent);
      setSelectedFileName(file.path.split('/').pop() || file.path);
    } catch (error) {
      setFetchError(error instanceof Error ? error.message : "Failed to fetch file content");
      toast.error("Failed to fetch file content");
    } finally {
      setFetchingFileContent(false);
    }
  };

  // Handle local file upload
  const handleLocalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset GitHub-related state
    setRepoFiles([]);
    setSelectedFile(null);
    setGithubUrl("");
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setSelectedFileContent(content);
      setSelectedFileName(file.name);
      toast.success(`File "${file.name}" loaded successfully`);
    };
    
    reader.onerror = () => {
      toast.error("Error reading file");
    };
    
    reader.readAsText(file);
  };
  
  // Function to clear the currently selected file
  const handleClearFile = () => {
    setSelectedFileContent(null);
    setSelectedFileName(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return {
    githubUrl,
    setGithubUrl,
    repoFiles,
    selectedFile,
    setSelectedFile,
    selectedFileContent,
    selectedFileName,
    fileDropdownOpen,
    setFileDropdownOpen,
    fetchingFileContent,
    fetchError,
    fileInputRef,
    handleLocalFileChange,
    handleGithubRepoInput,
    fetchFileContent,
    loadingFiles,
    handleClearFile
  };
};
