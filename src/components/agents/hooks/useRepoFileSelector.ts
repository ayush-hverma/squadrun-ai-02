
import { useState, useRef } from "react";

export type FileEntry = {
  path: string;
  url: string;
  type: string;
  sha: string;
};

export function useRepoFileSelector(defaultFileContent: string | null, defaultFileName: string | null) {
  // Repo-related state
  const [githubUrl, setGithubUrl] = useState("");
  const [repoValid, setRepoValid] = useState<boolean | null>(null);
  const [repoFiles, setRepoFiles] = useState<FileEntry[]>([]);
  const [fileDropdownOpen, setFileDropdownOpen] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Selected file state (repo)
  const [selectedFile, setSelectedFile] = useState<FileEntry | null>(null);
  const [selectedFileContent, setSelectedFileContent] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [fetchingFileContent, setFetchingFileContent] = useState(false);

  // Local file state (uploaded file)
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to extract "owner/repo" from the GitHub URL
  function extractRepoInfo(url: string): { owner: string; repo: string } | null {
    try {
      const match = url.match(/github\.com[:/]+([^/]+)\/([^/]+)/i);
      if (match) {
        return { owner: match[1], repo: match[2].replace(/\.git$/, "").replace(/\/$/, "") };
      }
    } catch {
      return null;
    }
    return null;
  }

  // Fetch file tree using the GitHub API
  async function fetchFiles(url: string) {
    setLoadingFiles(true);
    setFetchError(null);
    setRepoFiles([]);
    setSelectedFile(null);
    const info = extractRepoInfo(url);
    if (!info) {
      setRepoValid(false);
      setLoadingFiles(false);
      setFetchError("Invalid GitHub URL");
      return;
    }
    setRepoValid(true);

    try {
      // Try to fetch repository info
      const resp = await fetch(`https://api.github.com/repos/${info.owner}/${info.repo}`);
      
      // Check if we hit a rate limit
      if (resp.status === 403) {
        const rateLimitError = "GitHub API rate limit exceeded. Please try again later or upload a local file.";
        console.error("GitHub API rate limit error:", await resp.json());
        setFetchError(rateLimitError);
        setLoadingFiles(false);
        return;
      }
      
      if (!resp.ok) {
        throw new Error(`Repository not found or is private (${resp.status})`);
      }
      
      const repoData = await resp.json();
      const branch = repoData.default_branch;
      
      // Fetch the file tree
      const treeRes = await fetch(`https://api.github.com/repos/${info.owner}/${info.repo}/git/trees/${branch}?recursive=1`);
      
      if (treeRes.status === 403) {
        setFetchError("GitHub API rate limit exceeded. Please try again later or upload a local file.");
        setLoadingFiles(false);
        return;
      }
      
      if (!treeRes.ok) {
        throw new Error(`Failed to fetch file tree (${treeRes.status})`);
      }
      
      const treeData = await treeRes.json();
      if (!treeData.tree) throw new Error("Could not retrieve file tree");
      const files = treeData.tree.filter((node: any) => node.type === "blob");
      setRepoFiles(files);
    } catch (e: any) {
      setRepoFiles([]);
      if (e.message) {
        setFetchError(e.message);
      } else {
        setFetchError("Error fetching files from repo. Is it public?");
      }
      console.error("GitHub fetch error:", e);
    }
    setLoadingFiles(false);
  }

  // Fetch selected file's raw content
  async function fetchFileContent(entry: FileEntry) {
    if (!githubUrl) return;
    setFetchingFileContent(true);
    setFetchError(null);
    const info = extractRepoInfo(githubUrl);
    if (!info) return;
    try {
      const resp = await fetch(`https://api.github.com/repos/${info.owner}/${info.repo}/contents/${entry.path}`);
      
      if (resp.status === 403) {
        setFetchError("GitHub API rate limit exceeded. Please try again later.");
        setFetchingFileContent(false);
        return;
      }
      
      if (!resp.ok) {
        throw new Error(`Failed to fetch file content (${resp.status})`);
      }
      
      const fileData = await resp.json();
      let content = "";
      if (fileData.encoding === "base64") {
        content = atob(fileData.content.replace(/\n/g, ""));
      } else {
        content = fileData.content || "";
      }
      setSelectedFileContent(content);
      setSelectedFileName(entry.path);
    } catch (e: any) {
      if (e.message) {
        setFetchError(e.message);
      } else {
        setFetchError("Could not fetch file content.");
      }
      setSelectedFileContent(null);
      setSelectedFileName(null);
      console.error("File content fetch error:", e);
    }
    setFetchingFileContent(false);
  }

  // Handle repo input "enter" or blur
  function handleGithubRepoInput(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    fetchFiles(githubUrl);
  }

  // Handle local file upload
  function handleLocalFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = ev => {
        setSelectedFile(null);
        setSelectedFileContent(ev.target?.result as string);
        setSelectedFileName(file.name);
        setRepoFiles([]); // clear repo file selection if uploading local file
        setGithubUrl(""); // clear repo url input since now using local
      };
      reader.readAsText(file);
    }
  }

  function handleClearFile() {
    setSelectedFile(null);
    setSelectedFileContent(null);
    setSelectedFileName(null);
    setRepoFiles([]);
    setGithubUrl("");
    setFetchError(null);
    setFileDropdownOpen(false);
  }

  // Output values and actions for consumption
  return {
    githubUrl, setGithubUrl,
    repoValid, repoFiles, setFileDropdownOpen, fileDropdownOpen,
    loadingFiles, fetchError,
    selectedFile, setSelectedFile, fetchFileContent, fetchingFileContent,
    selectedFileContent, selectedFileName,
    fileInputRef, handleLocalFileChange,
    handleGithubRepoInput, handleClearFile
  };
}
