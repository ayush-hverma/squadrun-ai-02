
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowDown, File, Upload } from "lucide-react";
import React from "react";
import type { FileEntry } from "./hooks/useRepoFileSelector";

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
  handleGithubRepoInput
}: RepoFileSelectorProps) {
  return (
    <div>
      <form onSubmit={handleGithubRepoInput} className="mb-4 flex gap-2 items-center relative">
        <Input
          value={githubUrl}
          onChange={e => setGithubUrl(e.target.value)}
          placeholder="Enter GitHub repository URL (public repo)..."
          className="text-base flex-1 shadow-sm focus:shadow-lg transition-shadow"
        />
        <Button type="submit" variant="secondary" className="font-medium shadow hover:scale-105 focus:ring-2 focus:ring-squadrun-primary">
          Load Files
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
          className="ml-2 flex items-center gap-1 px-2 font-medium shadow hover:scale-105"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Browse local files"
        >
          <Upload className="w-4 h-4" />
          Browse Files
        </Button>
      </form>
      {fetchError && <div className="text-destructive text-sm mb-2">{fetchError}</div>}

      {repoFiles.length > 0 && (
        <div className="mb-4 relative">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex items-center gap-2 font-medium shadow hover:scale-105"
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
            <div className="max-h-64 overflow-auto rounded border border-squadrun-primary/20 bg-squadrun-darker/95 shadow-2xl mt-2 absolute w-[420px] left-0 z-40 animate-fade-in">
              {repoFiles.map(entry =>
                <div
                  key={entry.path}
                  tabIndex={0}
                  className={`flex items-center px-3 py-2 cursor-pointer hover:bg-squadrun-primary/10 focus:outline-none focus:bg-squadrun-primary/10 ${selectedFile?.path === entry.path ? "bg-squadrun-primary/20 font-semibold text-white" : ""}`}
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
          {fetchingFileContent && <div className="text-xs text-squadrun-gray mt-1 pl-2">Loading file...</div>}
        </div>
      )}
    </div>
  );
}
