
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import FileUpload from "@/components/FileUpload";
import CodeQuality from "@/components/agents/CodeQuality";
import TestCase from "@/components/agents/TestCase";
import ApiCreator from "@/components/agents/ApiCreator";

const Index = () => {
  const [activeTab, setActiveTab] = useState("quality");
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileUpload = (file: File) => {
    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setFileContent(content);
    };
    reader.readAsText(file);
  };

  const renderActiveAgent = () => {
    switch (activeTab) {
      case "quality":
        return <CodeQuality fileContent={fileContent} fileName={fileName} />;
      case "testcase":
        return <TestCase fileContent={fileContent} fileName={fileName} />;
      case "api":
        return <ApiCreator fileContent={fileContent} fileName={fileName} />;
      default:
        return <CodeQuality fileContent={fileContent} fileName={fileName} />;
    }
  };

  return (
    <div className="flex h-screen bg-squadrun-dark overflow-hidden">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-squadrun-primary/20">
          <FileUpload onFileUpload={handleFileUpload} />
        </div>
        
        <div className="flex-1 overflow-auto">
          {renderActiveAgent()}
        </div>
      </div>
    </div>
  );
};

export default Index;
