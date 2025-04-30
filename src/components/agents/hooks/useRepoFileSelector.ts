
import { useState, useRef, useCallback } from "react";

export interface FileEntry {
  name: string;
  path: string;
  type: string;
  url?: string;
}

export const useRepoFileSelector = (initialFileContent: string | null, initialFileName: string | null) => {
  const [githubUrl, setGithubUrl] = useState<string>("");
  const [repoFiles, setRepoFiles] = useState<FileEntry[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileEntry | null>(null);
  const [selectedFileContent, setSelectedFileContent] = useState<string | null>(initialFileContent);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(initialFileName);
  const [fileDropdownOpen, setFileDropdownOpen] = useState<boolean>(false);
  const [loadingFiles, setLoadingFiles] = useState<boolean>(false);
  const [fetchingFileContent, setFetchingFileContent] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const fetchRepoFiles = useCallback(async (url: string) => {
    setLoadingFiles(true);
    setFetchError(null);
    
    try {
      // Extract owner and repo from GitHub URL
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      
      if (urlObj.hostname !== 'github.com' || pathParts.length < 3) {
        throw new Error('Invalid GitHub repository URL');
      }
      
      const owner = pathParts[1];
      const repo = pathParts[2];
      
      // Fetch repository contents
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`);
      
      if (!response.ok) {
        // Try master branch if main doesn't exist
        const masterResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/master?recursive=1`);
        
        if (!masterResponse.ok) {
          throw new Error('Failed to fetch repository contents');
        }
        
        const data = await masterResponse.json();
        processRepoData(data, owner, repo);
      } else {
        const data = await response.json();
        processRepoData(data, owner, repo);
      }
      
    } catch (error) {
      console.error('Error fetching repository:', error);
      setFetchError(error instanceof Error ? error.message : 'Failed to fetch repository');
      setRepoFiles([]);
    } finally {
      setLoadingFiles(false);
    }
  }, []);
  
  const processRepoData = (data: any, owner: string, repo: string) => {
    if (!data.tree) {
      setFetchError('Repository structure not found');
      return;
    }
    
    // Filter for code files only
    const codeExtensions = ['.py', '.js', '.ts', '.jsx', '.tsx', '.html', '.css', '.java', '.cpp', '.c', '.cs', '.go'];
    
    const files = data.tree
      .filter((item: any) => 
        item.type === 'blob' && 
        codeExtensions.some(ext => item.path.toLowerCase().endsWith(ext))
      )
      .map((item: any) => ({
        name: item.path.split('/').pop(),
        path: item.path,
        type: 'file',
        url: `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${item.path}`
      }));
    
    setRepoFiles(files);
    
    if (files.length === 0) {
      setFetchError('No code files found in repository');
    }
  };
  
  const fetchFileContent = useCallback(async (file: FileEntry) => {
    if (!file.url) return;
    
    setFetchingFileContent(true);
    setFetchError(null);
    
    try {
      const response = await fetch(file.url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch file content');
      }
      
      const content = await response.text();
      setSelectedFileContent(content);
      setSelectedFileName(file.name);
      
    } catch (error) {
      console.error('Error fetching file content:', error);
      setFetchError(error instanceof Error ? error.message : 'Failed to fetch file content');
      
    } finally {
      setFetchingFileContent(false);
    }
  }, []);
  
  const handleGithubRepoInput = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (githubUrl.trim()) {
      fetchRepoFiles(githubUrl.trim());
    }
  }, [githubUrl, fetchRepoFiles]);
  
  const handleLocalFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setSelectedFileContent(content);
      setSelectedFileName(file.name);
      setSelectedFile(null);
      setRepoFiles([]);
    };
    
    reader.onerror = () => {
      setFetchError('Error reading file');
    };
    
    reader.readAsText(file);
  }, []);
  
  return {
    githubUrl,
    setGithubUrl,
    repoFiles,
    selectedFile,
    setSelectedFile,
    selectedFileContent,
    selectedFileName,
    fetchFileContent,
    fileDropdownOpen,
    setFileDropdownOpen,
    fetchingFileContent,
    fetchError,
    fileInputRef,
    handleLocalFileChange,
    handleGithubRepoInput,
    loadingFiles
  };
};
