import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Check, TestTube, Github } from "lucide-react";
import CodeRefactor from "./CodeRefactor";
import CodeQuality from "./CodeQuality";
import TestCase from "./TestCase";
import NoCodeMessage from "./quality/NoCodeMessage";
import RepoFileSelector from "./RepoFileSelector";
import { useRepoFileSelector } from "./hooks/useRepoFileSelector";

interface UnifiedAgentProps {
  fileContent?: string | null;
  fileName?: string | null;
}

export default function UnifiedAgent({ fileContent, fileName }: UnifiedAgentProps) {
  const [activeTab, setActiveTab] = useState("refactor");

  // Use custom hook for repo & file handling
  const selector = useRepoFileSelector(fileContent ?? null, fileName ?? null);

  // The code to display for the agents
  const effectiveFileContent = selector.selectedFileContent ?? fileContent;
  const effectiveFileName = selector.selectedFileName ?? fileName;

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

      <RepoFileSelector
        githubUrl={selector.githubUrl}
        setGithubUrl={selector.setGithubUrl}
        repoFiles={selector.repoFiles}
        selectedFile={selector.selectedFile}
        selectedFiles={selector.selectedFiles}
        setSelectedFile={selector.setSelectedFile}
        fetchFileContent={selector.fetchFileContent}
        fileDropdownOpen={selector.fileDropdownOpen}
        setFileDropdownOpen={selector.setFileDropdownOpen}
        fetchingFileContent={selector.fetchingFileContent}
        fetchError={selector.fetchError}
        fileInputRef={selector.fileInputRef}
        handleLocalFileChange={selector.handleLocalFileChange}
        handleGithubRepoInput={selector.handleGithubRepoInput}
        loadingFiles={selector.loadingFiles}
        handleClearFile={selector.handleClearFile}
        toggleFileSelection={selector.toggleFileSelection}
        allRepoFilesWithContent={selector.allRepoFilesWithContent}
      />

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
            ? <CodeRefactor fileContent={effectiveFileContent} fileName={effectiveFileName} onClearFile={selector.handleClearFile} />
            : <NoCodeMessage />
          }
        </TabsContent>
        
        <TabsContent value="quality" className="flex-1 mt-0">
          {effectiveFileContent || selector.githubUrl ? (
            <CodeQuality 
              fileContent={effectiveFileContent} 
              fileName={effectiveFileName} 
              repoFiles={selector.allRepoFilesWithContent.map(file => ({
                path: file.path,
                content: file.content || ''
              }))}
              selectedFiles={selector.selectedFiles}
              repoUrl={selector.repositoryName}
              hasRepoUrl={!!selector.githubUrl.trim()}
              githubUrl={selector.githubUrl}
            />
          ) : (
            <NoCodeMessage />
          )}
        </TabsContent>
        
        <TabsContent value="testcase" className="flex-1 mt-0">
          {effectiveFileContent
            ? <TestCase fileContent={effectiveFileContent} fileName={effectiveFileName} onClearFile={selector.handleClearFile} />
            : <NoCodeMessage />
          }
        </TabsContent>
      </Tabs>
    </div>
  );
}
