
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import FileUpload from "@/components/FileUpload";
import CodeInspector from "@/components/agents/CodeInspector";
import ApiCreator from "@/components/agents/ApiCreator";

const Index = () => {
  const [activeTab, setActiveTab] = useState("inspector");
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleFileUpload = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = e => {
      const content = e.target?.result as string;
      setFileContent(content);
    };
    reader.readAsText(file);
  };

  const handleTabChange = (tab: string) => {
    if (tab !== activeTab) {
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveTab(tab);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const renderActiveAgent = () => {
    switch (activeTab) {
      case "inspector":
        return <CodeInspector fileContent={fileContent} fileName={fileName} />;
      case "api":
        return <ApiCreator fileContent={fileContent} fileName={fileName} />;
      default:
        return <CodeInspector fileContent={fileContent} fileName={fileName} />;
    }
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
          {renderActiveAgent()}
        </div>
      </div>
    </div>
  );
};

export default Index;
