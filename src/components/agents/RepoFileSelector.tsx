
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, ArrowDown, File, Loader2, Upload, Lock, Unlock } from "lucide-react";
import React, { useEffect, useState } from "react";
import type { FileEntry } from "./hooks/useRepoFileSelector";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RepoFileSelectorProps {
  githubUrl: string;
  setGithubUrl: (val: string) => void;
  repoFiles: FileEntry[];
  selectedFile: FileEntry | null;
  setSelectedFile: (file: FileEntry) => void;
  fetchFileContent: (file: FileEntry) => void;
  fileDropdownOpen: boolean;
  setFileDropdownOpen: (v: boolean | ((v: boolean) => boolean)) => void;
  fetchingFileContent: boolean;
  fetchError: string | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleLocalFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleGithubRepoInput: (e: React.FormEvent<HTMLFormElement>) => void;
  loadingFiles: boolean;
  githubToken: string;
  setGithubToken: (token: string) => void;
  handleClearGithubToken: () => void;
}

export default function RepoFileSelector({
  githubUrl,
  setGithubUrl,
  repoFiles,
  selectedFile,
  setSelectedFile,
  fetchFileContent,
  fileDropdownOpen,
  setFileDropdownOpen,
  fetchingFileContent,
  fetchError,
  fileInputRef,
  handleLocalFileChange,
  handleGithubRepoInput,
  loadingFiles,
  githubToken,
  setGithubToken,
  handleClearGithubToken,
}: RepoFileSelectorProps) {
  const [tokenInput, setTokenInput] = useState("");

  useEffect(() => {
    setTokenInput(githubToken);
  }, [githubToken]);

  const handleSaveToken = () => {
    setGithubToken(tokenInput.trim());
  };

  return (
    <div>
      <form onSubmit={handleGithubRepoInput} className="mb-2 flex gap-2 items-center relative">
        <Input
          value={githubUrl}
          onChange={e => setGithubUrl(e.target.value)}
          placeholder="Enter GitHub repository URL (public repo)..."
          className="text-base flex-1"
        />
        <Button 
          type="submit" 
          variant="secondary"
          disabled={loadingFiles}
        >
          {loadingFiles ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Loading...
            </>
          ) : "Load Files"}
        </Button>
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
      {/* Token input UI */}
      <div className="flex gap-2 mb-4 items-center">
        <Input
          type="password"
          value={tokenInput}
          onChange={e => setTokenInput(e.target.value)}
          placeholder="GitHub Personal Access Token (for private or rate limit)"
          className="text-xs py-1 bg-squadrun-darker border-squadrun-primary/20"
          style={{ maxWidth: 300 }}
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="flex items-center gap-1 px-2"
          onClick={handleSaveToken}
          disabled={tokenInput.trim().length === 0 || tokenInput === githubToken}
        >
          <Lock className="w-3 h-3" />
          Save Token
        </Button>
        {githubToken && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="flex items-center gap-1 px-2 border-red-500 hover:bg-red-950/10"
            onClick={handleClearGithubToken}
          >
            <Unlock className="w-3 h-3 text-red-500" />
            Remove
          </Button>
        )}
        <span className="text-xs text-squadrun-gray">
          {githubToken ? "Token saved in your browser" : "No token stored"}
        </span>
      </div>

      {fetchError && (
        <Alert variant="destructive" className="mb-4 py-2 bg-destructive/10 border-destructive/30">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription className="text-sm ml-2">{fetchError}</AlertDescription>
        </Alert>
      )}

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
          {fetchingFileContent && (
            <div className="text-xs text-squadrun-gray mt-1 flex items-center">
              <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Loading file...
            </div>
          )}
        </div>
      )}
    </div>
  );
}

