
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import FileUpload from "@/components/FileUpload";
import UnifiedAgent from "@/components/agents/UnifiedAgent";

const Index = () => {
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Only one agent present -- UnifiedAgent
  const activeTab = "inspector";
  const handleTabChange = () => {};

  const handleFileUpload = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = e => {
      const content = e.target?.result as string;
      setFileContent(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex h-screen bg-squadrun-dark overflow-hidden">
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-1 border-b border-squadrun-primary/20 bg-squadrun-darker/50 py-1 px-1 mx-0 my-0">
          <FileUpload onFileUpload={handleFileUpload} />
        </div>

        <div
          className={`flex-1 overflow-auto transition-opacity duration-300 ease-in-out ${
            isTransitioning ? "opacity-0" : "opacity-100"
          }`}
        >
          <UnifiedAgent fileContent={fileContent} fileName={fileName} />
        </div>
      </div>
    </div>
  );
};

export default Index;

