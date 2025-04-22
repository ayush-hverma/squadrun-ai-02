
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import CodeRefactor from "@/components/agents/CodeRefactor";
import CodeQuality from "@/components/agents/CodeQuality";
import TestCase from "@/components/agents/TestCase";
import ApiCreator from "@/components/agents/ApiCreator";

const Index = () => {
  const [activeTab, setActiveTab] = useState("refactor");
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleTabChange = (tab: string) => {
    if (tab !== activeTab) {
      setIsTransitioning(true);
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

  const renderActiveAgent = () => {
    switch (activeTab) {
      case "refactor":
        return <CodeRefactor fileContent={fileContent} fileName={fileName} onFileUpload={handleFileUpload} />;
      case "quality":
        return <CodeQuality fileContent={fileContent} fileName={fileName} onFileUpload={handleFileUpload} />;
      case "testcase":
        return <TestCase fileContent={fileContent} fileName={fileName} onFileUpload={handleFileUpload} />;
      case "api":
        return <ApiCreator fileContent={fileContent} fileName={fileName} />;
      default:
        return <CodeRefactor fileContent={fileContent} fileName={fileName} onFileUpload={handleFileUpload} />;
    }
  };

  return (
    <div className="flex h-screen bg-squadrun-dark overflow-hidden">
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className={`flex-1 overflow-auto transition-opacity duration-300 ease-in-out ${
          isTransitioning ? "opacity-0" : "opacity-100"
        }`}>
          {renderActiveAgent()}
        </div>
      </div>
    </div>
  );
};

export default Index;
