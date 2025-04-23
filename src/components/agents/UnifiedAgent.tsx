
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
  const selector = useRepoFileSelector(fileContent ?? null, fileName ?? null);
  const effectiveFileContent = selector.selectedFileContent ?? fileContent;
  const effectiveFileName = selector.selectedFileName ?? fileName;

  return (
    <div className="p-6 pt-4 h-full flex flex-col gap-6 animate-fade-in">
      {/* Enhanced header */}
      <div className="mb-1 flex flex-col gap-2 bg-gradient-to-l from-squadrun-primary/20 to-squadrun-darker/30 rounded-xl p-5 border border-squadrun-primary/10 shadow-[0_4px_40px_0_rgba(155,135,245,0.15)]">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2 mb-1 tracking-tight drop-shadow-[0_2px_12px_rgba(155,135,245,0.09)]">
          <span>Code Inspector</span>
          <span className="bg-squadrun-darker/70 rounded-full p-1.5 border border-squadrun-primary/25 shadow pulse-glow">
            <Github className="w-5 h-5 text-squadrun-primary" />
          </span>
        </h1>
        <p className="text-squadrun-gray text-lg">
          Paste a <span className="font-semibold text-squadrun-highlight">GitHub repository URL</span> for direct code analysis, or <span className="font-semibold text-squadrun-highlight">upload a file</span> to get instant insights.
        </p>
      </div>

      <section>
        <RepoFileSelector
          githubUrl={selector.githubUrl}
          setGithubUrl={selector.setGithubUrl}
          repoFiles={selector.repoFiles}
          selectedFile={selector.selectedFile}
          setSelectedFile={selector.setSelectedFile}
          fetchFileContent={selector.fetchFileContent}
          fileDropdownOpen={selector.fileDropdownOpen}
          setFileDropdownOpen={selector.setFileDropdownOpen}
          fetchingFileContent={selector.fetchingFileContent}
          fetchError={selector.fetchError}
          fileInputRef={selector.fileInputRef}
          handleLocalFileChange={selector.handleLocalFileChange}
          handleGithubRepoInput={selector.handleGithubRepoInput}
        />
      </section>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="mb-2 border-b border-squadrun-primary/30 bg-squadrun-primary/10 rounded-lg flex gap-2 p-1 shadow-inner">
          <TabsTrigger value="refactor" className="flex items-center gap-2 data-[state=active]:bg-squadrun-primary data-[state=active]:text-white rounded-md px-4 py-2 focus:scale-102 transition-transform">
            <Code className="h-4 w-4" />
            Refactor
          </TabsTrigger>
          <TabsTrigger value="quality" className="flex items-center gap-2 data-[state=active]:bg-squadrun-primary data-[state=active]:text-white rounded-md px-4 py-2 focus:scale-102 transition-transform">
            <Check className="h-4 w-4" />
            Quality
          </TabsTrigger>
          <TabsTrigger value="testcase" className="flex items-center gap-2 data-[state=active]:bg-squadrun-primary data-[state=active]:text-white rounded-md px-4 py-2 focus:scale-102 transition-transform">
            <TestTube className="h-4 w-4" />
            Test Cases
          </TabsTrigger>
        </TabsList>
        <div className="flex-1 flex flex-col">
          <TabsContent value="refactor" className="flex-1 mt-0">
            {effectiveFileContent
              ? <CodeRefactor fileContent={effectiveFileContent} fileName={effectiveFileName} onClearFile={selector.handleClearFile} />
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
              ? <TestCase fileContent={effectiveFileContent} fileName={effectiveFileName} onClearFile={selector.handleClearFile} />
              : <NoCodeMessage />
            }
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
