import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, ArrowDown, File, Loader2, Upload } from "lucide-react";
import React from "react";
import type { FileEntry } from "./hooks/useRepoFileSelector";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import TokenCountDisplay from "./TokenCountDisplay";

interface RepoFileSelectorProps {
  githubUrl: string;
  setGithubUrl: (val: string) => void;
  repoFiles: FileEntry[];
  selectedFile: FileEntry | null;
  selectedFiles?: FileEntry[];
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
  handleClearFile?: () => void;
  toggleFileSelection?: (file: FileEntry) => void;
  allRepoFilesWithContent?: FileEntry[];
}

export default function RepoFileSelector({
  githubUrl,
  setGithubUrl,
  repoFiles,
  selectedFile,
  selectedFiles = [],
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
  handleClearFile,
  toggleFileSelection,
  allRepoFilesWithContent = []
}: RepoFileSelectorProps) {
  return (
    <div>
      <form onSubmit={handleGithubRepoInput} className="mb-4 flex gap-2 items-center relative">
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
          accept="*"
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

      {fetchError && (
        <Alert variant="destructive" className="mb-4 py-2 bg-destructive/10 border-destructive/30">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription className="text-sm ml-2">{fetchError}</AlertDescription>
        </Alert>
      )}

      {/* Show repository token count immediately after loading files */}
      {allRepoFilesWithContent.length > 0 && (
        <div className="mb-4">
          <TokenCountDisplay 
            files={allRepoFilesWithContent} 
            label="Repository" 
          />
        </div>
      )}

      {repoFiles.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-4">
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
                  : selectedFiles && selectedFiles.length > 0 
                    ? `${selectedFiles.length} files selected` 
                    : "Select files from repo" }
              </span>
            </Button>

            {/* Show selected files token count when files are selected */}
            {selectedFiles && selectedFiles.length > 0 && (
              <TokenCountDisplay 
                files={selectedFiles} 
                label="Selected Files" 
              />
            )}
          </div>
          
          {fileDropdownOpen && (
            <div className="max-h-64 overflow-auto rounded border bg-popover mt-2 shadow z-10 absolute w-[400px]">
              {repoFiles.map(entry => (
                <div
                  key={entry.path}
                  tabIndex={0}
                  className={`flex items-center px-3 py-2 cursor-pointer hover:bg-squadrun-primary/10 ${
                    selectedFile?.path === entry.path ? "bg-squadrun-primary/20" : ""
                  }`}
                  onClick={() => {
                    setSelectedFile(entry);
                    fetchFileContent(entry);
                  }}
                >
                  {toggleFileSelection && (
                    <div 
                      className="mr-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFileSelection(entry);
                      }}
                    >
                      <Checkbox 
                        checked={entry.selected} 
                        onCheckedChange={() => toggleFileSelection(entry)}
                        aria-label={`Select ${entry.path}`}
                      />
                    </div>
                  )}
                  <File className="mr-2 w-4 h-4" />
                  <span className="truncate">{entry.path}</span>
                </div>
              ))}
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
