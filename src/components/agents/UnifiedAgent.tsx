import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Check, TestTube, Github, ArrowDown, File, Upload } from "lucide-react";
import CodeRefactor from "./CodeRefactor";
import CodeQuality from "./CodeQuality";
import TestCase from "./TestCase";
import NoCodeMessage from "./quality/NoCodeMessage";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type FileEntry = {
  path: string;
  url: string;
  type: string;
  sha: string;
};

interface UnifiedAgentProps {
  fileContent?: string | null;
  fileName?: string | null;
}

export default function UnifiedAgent({ fileContent, fileName }: UnifiedAgentProps) {
  // For tab switching between Refactor/Quality/Test
  const [activeTab, setActiveTab] = useState("refactor");

  // Repo-related state
  const [githubUrl, setGithubUrl] = useState("");
  const [repoValid, setRepoValid] = useState<boolean | null>(null);

  // File list and loading state
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

    // Get default branch and tree SHA
    try {
      const resp = await fetch(`https://api.github.com/repos/${info.owner}/${info.repo}`);
      const repoData = await resp.json();
      const branch = repoData.default_branch;
      const treeRes = await fetch(`https://api.github.com/repos/${info.owner}/${info.repo}/git/trees/${branch}?recursive=1`);
      const treeData = await treeRes.json();
      if (!treeData.tree) throw new Error("Could not retrieve file tree");
      // List files only
      const files = treeData.tree.filter((node: any) => node.type === "blob");
      setRepoFiles(files);
    } catch (e) {
      setRepoFiles([]);
      setFetchError("Error fetching files from repo. Is it public?");
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
      // Get file contents
      const resp = await fetch(`https://api.github.com/repos/${info.owner}/${info.repo}/contents/${entry.path}`);
      const fileData = await resp.json();
      let content = "";
      if (fileData.encoding === "base64") {
        content = atob(fileData.content.replace(/\n/g, ""));
      } else {
        content = fileData.content || "";
      }
      setSelectedFileContent(content);
      setSelectedFileName(entry.path);
    } catch {
      setFetchError("Could not fetch file content.");
      setSelectedFileContent(null);
      setSelectedFileName(null);
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

  // ---- New function to handle clearing all selection and content ----
  function handleClearFile() {
    setSelectedFile(null);
    setSelectedFileContent(null);
    setSelectedFileName(null);
    setRepoFiles([]);
    setGithubUrl("");
    setFetchError(null);
    setFileDropdownOpen(false);
  }

  // The code to display for the agents
  const effectiveFileContent = selectedFileContent ?? fileContent;
  const effectiveFileName = selectedFileName ?? fileName;

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <span>Code Inspector</span>
          <Github className="w-5 h-5 text-squadrun-primary" />
        </h1>
        <p className="text-squadrun-gray">
          Paste a GitHub repository URL to analyze code directly from a public repository, or upload your own files.
        </p>
      </div>

      <form onSubmit={handleGithubRepoInput} className="mb-4 flex gap-2 items-center relative">
        <Input
          value={githubUrl}
          onChange={e => setGithubUrl(e.target.value)}
          placeholder="Enter GitHub repository URL (public repo)..."
          className="text-base flex-1"
        />
        <Button type="submit" variant="secondary">
          Load Files
        </Button>
        {/* Browse Files Button */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".py,.js,.ts,.jsx,.tsx,.java,.cpp,.c,.cs,.go,.rb,.rs,.php,.sh,.sql,.html,.css"
          onChange={handleLocalFileChange}
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="ml-2 flex items-center gap-1 px-2"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Browse local files"
        >
          <Upload className="w-4 h-4" />
          Browse Files
        </Button>
      </form>

      {fetchError && <div className="text-destructive text-sm mb-2">{fetchError}</div>}

      {repoFiles.length > 0 && (
        <div className="mb-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => setFileDropdownOpen(open => !open)}
            aria-expanded={fileDropdownOpen}
          >
            <ArrowDown className={`transition-transform ${fileDropdownOpen ? "rotate-180" : ""}`} />
            <span>
              {selectedFile
                ? <span className="flex items-center gap-2"><File className="w-4 h-4" /> {selectedFile.path}</span>
                : "Select file from repo" }
            </span>
          </Button>
          {fileDropdownOpen && (
            <div className="max-h-64 overflow-auto rounded border bg-popover mt-2 shadow z-10 absolute w-[400px]">
              {repoFiles.map(entry =>
                <div
                  key={entry.path}
                  tabIndex={0}
                  className={`flex items-center px-3 py-2 cursor-pointer hover:bg-squadrun-primary/10 ${selectedFile?.path === entry.path ? "bg-squadrun-primary/20" : ""}`}
                  onClick={() => {
                    setSelectedFile(entry);
                    fetchFileContent(entry);
                    setFileDropdownOpen(false);
                  }}
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      setSelectedFile(entry);
                      fetchFileContent(entry);
                      setFileDropdownOpen(false);
                    }
                  }}
                >
                  <File className="mr-2 w-4 h-4" />
                  <span className="truncate">{entry.path}</span>
                </div>
              )}
            </div>
          )}
          {fetchingFileContent && <div className="text-xs text-squadrun-gray mt-1">Loading file...</div>}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="mb-4">
          <TabsTrigger value="refactor" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Refactor
          </TabsTrigger>
          <TabsTrigger value="quality" className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            Quality
          </TabsTrigger>
          <TabsTrigger value="testcase" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            Test Cases
          </TabsTrigger>
        </TabsList>

        <TabsContent value="refactor" className="flex-1 mt-0">
          {effectiveFileContent
            ? <CodeRefactor fileContent={effectiveFileContent} fileName={effectiveFileName} onClearFile={handleClearFile} />
            : <NoCodeMessage />
          }
        </TabsContent>
        
        <TabsContent value="quality" className="flex-1 mt-0">
          {effectiveFileContent
            ? <CodeQuality fileContent={effectiveFileContent} fileName={effectiveFileName} />
            : <NoCodeMessage />
          }
        </TabsContent>
        
        <TabsContent value="testcase" className="flex-1 mt-0">
          {effectiveFileContent
            ? <TestCase fileContent={effectiveFileContent} fileName={effectiveFileName} onClearFile={handleClearFile} />
            : <NoCodeMessage />
          }
        </TabsContent>
      </Tabs>
    </div>
  );
}
