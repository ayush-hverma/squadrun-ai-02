
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

  const handleClear = () => {
    setFileContent(null);
    setFileName(null);
  };

  const renderActiveAgent = () => {
    const props = {
      fileContent,
      fileName,
      onFileUpload: handleFileUpload,
      onClear: handleClear
    };

    switch (activeTab) {
      case "refactor":
        return <CodeRefactor {...props} />;
      case "quality":
        return <CodeQuality {...props} />;
      case "testcase":
        return <TestCase {...props} />;
      case "api":
        return <ApiCreator fileContent={fileContent} fileName={fileName} />;
      default:
        return <CodeRefactor {...props} />;
    }
  };

  return (
    <div className="flex h-screen bg-squadrun-dark overflow-hidden">
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
      <main className="flex-1 flex flex-col overflow-hidden p-6">
        <div className={`flex-1 overflow-auto transition-all duration-300 ease-in-out rounded-xl bg-squadrun-darker/50 backdrop-blur-sm border border-squadrun-primary/10 p-6 ${
          isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
        }`}>
          {renderActiveAgent()}
        </div>
      </main>
    </div>
  );
};

export default Index;
