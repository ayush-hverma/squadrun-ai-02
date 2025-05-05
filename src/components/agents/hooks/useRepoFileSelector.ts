import { useState, useRef } from "react";
import { toast } from "sonner";
import { calculateTotalTokens } from "@/utils/aiUtils/tokenCounter";

export interface FileEntry {
  path: string;
  type: "file" | "dir";
  size?: number;
  content?: string;
  selected?: boolean; // New property to track selection state
}

export const useRepoFileSelector = (initialFileContent: string | null, initialFileName: string | null) => {
  const [githubUrl, setGithubUrl] = useState("");
  const [repoFiles, setRepoFiles] = useState<FileEntry[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileEntry | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileEntry[]>([]); // New state for multiple selected files
  const [selectedFileContent, setSelectedFileContent] = useState<string | null>(initialFileContent);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(initialFileName);
  const [fileDropdownOpen, setFileDropdownOpen] = useState(false);
  const [fetchingFileContent, setFetchingFileContent] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Track repository files with content for bulk analysis
  const [allRepoFilesWithContent, setAllRepoFilesWithContent] = useState<FileEntry[]>([]);
  const [repositoryName, setRepositoryName] = useState<string | null>(null);
  
  // Extract owner and repo from GitHub URL
  const extractRepoInfo = (url: string): { owner: string; repo: string } | null => {
    try {
      // Parse different GitHub URL formats
      const githubRegex = /github\.com\/([^\/]+)\/([^\/]+)/;
      const matches = url.match(githubRegex);
      
      if (matches && matches.length >= 3) {
        const owner = matches[1];
        // Remove .git suffix if present
        let repo = matches[2];
        if (repo.endsWith('.git')) {
          repo = repo.slice(0, -4);
        }
        return { owner, repo };
      }
      return null;
    } catch (error) {
      console.error("Error parsing GitHub URL:", error);
      return null;
    }
  };

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
    setAllRepoFilesWithContent([]);

    try {
      const repoInfo = extractRepoInfo(githubUrl);
      if (!repoInfo) {
        throw new Error("Invalid GitHub repository URL");
      }

      const { owner, repo } = repoInfo;
      setRepositoryName(`${owner}/${repo}`);
      
      // Fetch repository contents using GitHub API
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`);
      
      if (!response.ok) {
        // Try with master branch if main doesn't exist
        const masterResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/master?recursive=1`);
        if (!masterResponse.ok) {
          throw new Error("Failed to fetch repository files. Repository may be private or doesn't exist.");
        }
        
        const data = await masterResponse.json();
        processRepoFiles(data, owner, repo, "master");
      } else {
        const data = await response.json();
        processRepoFiles(data, owner, repo, "main");
      }
      
    } catch (error) {
      setFetchError(error instanceof Error ? error.message : "Failed to fetch repository files");
      toast.error("Failed to fetch repository files");
    } finally {
      setLoadingFiles(false);
    }
  };

  // Process repository files from GitHub API response
  const processRepoFiles = async (data: any, owner: string, repo: string, branch: string) => {
    if (!data.tree || !Array.isArray(data.tree)) {
      setFetchError("Invalid repository data structure");
      return;
    }
    
    // Filter only files, exclude folders, git files, etc.
    const files = data.tree
      .filter((item: any) => 
        item.type === "blob" && 
        !item.path.startsWith('.git/') &&
        !item.path.includes('node_modules/') &&
        !item.path.includes('/dist/') &&
        !item.path.includes('/build/')
      )
      .map((item: any) => ({
        path: item.path,
        type: item.type === "blob" ? "file" : "dir",
        size: item.size,
        selected: false
      }));
    
    if (files.length === 0) {
      setFetchError("No files found in repository");
      return;
    }
    
    setRepoFiles(files);
    toast.success(`${files.length} repository files loaded successfully`);
    setFileDropdownOpen(true);
    
    // Load file contents for bulk analysis
    const filesToAnalyze = files.slice(0, 50);
    
    let filesWithContent: FileEntry[] = [];
    let loadedCount = 0;
    
    const fetchPromises = filesToAnalyze.map(async (file) => {
      try {
        const fileUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${file.path}`;
        const response = await fetch(fileUrl);
        
        if (response.ok) {
          const content = await response.text();
          loadedCount++;
          if (loadedCount % 10 === 0) {
            toast.info(`Loaded ${loadedCount}/${filesToAnalyze.length} files for analysis...`);
          }
          return { ...file, content };
        }
        return file;
      } catch (error) {
        console.error(`Error fetching content for ${file.path}:`, error);
        return file;
      }
    });
    
    const results = await Promise.all(fetchPromises);
    filesWithContent = results.filter(file => file.content) as FileEntry[];
    
    setAllRepoFilesWithContent(filesWithContent);
    
    if (filesWithContent.length > 0) {
      const totalTokens = calculateTotalTokens(filesWithContent);
      toast.success(`Loaded content for ${filesWithContent.length} files (${totalTokens.toLocaleString()} tokens)`);
    }
  };
  
  // Check if file is a code file - retained but not used for filtering anymore
  const isCodeFile = (path: string) => {
    const codeExtensions = [
      '.py', '.js', '.ts', '.jsx', '.tsx', '.java', '.cpp', '.c', '.cs', '.go', 
      '.rb', '.rs', '.php', '.sh', '.sql', '.html', '.css', '.json', '.md'
    ];
    return codeExtensions.some(ext => path.endsWith(ext));
  };

  // Handle file selection and fetch content
  const fetchFileContent = async (file: FileEntry) => {
    setFetchingFileContent(true);
    setFetchError(null);

    try {
      const repoInfo = extractRepoInfo(githubUrl);
      if (!repoInfo) {
        throw new Error("Invalid GitHub repository URL");
      }

      const { owner, repo } = repoInfo;
      
      // Fetch raw file content from GitHub
      const response = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/main/${file.path}`);
      
      if (!response.ok) {
        // Try with master branch if main doesn't exist
        const masterResponse = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/master/${file.path}`);
        if (!masterResponse.ok) {
          throw new Error("Failed to fetch file content");
        }
        const content = await masterResponse.text();
        setSelectedFileContent(content);
      } else {
        const content = await response.text();
        setSelectedFileContent(content);
      }
      
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
    setRepositoryName(null);
    setAllRepoFilesWithContent([]);
    
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

  // New function to toggle selection of a file
  const toggleFileSelection = async (file: FileEntry) => {
    try {
      // If file is being selected, fetch its content
      if (!file.selected) {
        setFetchingFileContent(true);
        const repoInfo = extractRepoInfo(githubUrl);
        if (!repoInfo) {
          throw new Error("Invalid GitHub repository URL");
        }

        const { owner, repo } = repoInfo;
        
        // Fetch raw file content from GitHub
        const response = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/main/${file.path}`);
        
        if (!response.ok) {
          // Try with master branch if main doesn't exist
          const masterResponse = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/master/${file.path}`);
          if (!masterResponse.ok) {
            throw new Error("Failed to fetch file content");
          }
          const content = await masterResponse.text();
          file.content = content;
        } else {
          const content = await response.text();
          file.content = content;
        }
      }

      // Update the file's selected state
      const updatedFiles = repoFiles.map(f => 
        f.path === file.path ? { ...f, selected: !f.selected, content: file.content } : f
      );
      
      setRepoFiles(updatedFiles);
      
      // Update selectedFiles array
      const newSelectedFiles = updatedFiles.filter(f => f.selected);
      setSelectedFiles(newSelectedFiles);
      
      // If files were selected, show a toast with token count
      if (newSelectedFiles.length > 0) {
        const totalTokens = calculateTotalTokens(newSelectedFiles);
        toast.success(`${newSelectedFiles.length} files selected (${totalTokens.toLocaleString()} tokens)`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to fetch file content");
    } finally {
      setFetchingFileContent(false);
    }
  };

  return {
    githubUrl,
    setGithubUrl,
    repoFiles,
    selectedFile,
    setSelectedFile,
    selectedFiles, // New: export selected files array
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
    handleClearFile,
    allRepoFilesWithContent,
    repositoryName,
    toggleFileSelection // New: export toggle selection function
  };
};
