import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import FileUpload from "@/components/FileUpload";
import UnifiedAgent from "@/components/agents/UnifiedAgent";
import ApiCreator from "@/components/agents/ApiCreator";
const Index = () => {
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeTab, setActiveTab] = useState("inspector");
  const handleTabChange = (tab: string) => {
    // Only transition if we're changing tabs
    if (tab !== activeTab) {
      setIsTransitioning(true);
      // Wait for transition animation before changing tab
      setTimeout(() => {
        setActiveTab(tab);
        setIsTransitioning(false);
      }, 300);
    }
  };
  const handleFileUpload = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = e => {
      const content = e.target?.result as string;
      setFileContent(content);
    };
    reader.readAsText(file);
  };
  return <div className="flex h-screen bg-squadrun-dark overflow-hidden">
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />

      <div className="flex-1 flex flex-col overflow-hidden">
        

        <div className={`flex-1 overflow-auto transition-opacity duration-300 ease-in-out ${isTransitioning ? "opacity-0" : "opacity-100"}`}>
          {activeTab === "inspector" ? <UnifiedAgent fileContent={fileContent} fileName={fileName} /> : <ApiCreator />}
        </div>
      </div>
    </div>;
};
export default Index;