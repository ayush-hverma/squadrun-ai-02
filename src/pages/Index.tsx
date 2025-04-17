
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { FileUpload } from "@/components/ui/file-upload";
import CodeRefactor from "@/components/agents/CodeRefactor";
import CodeQuality from "@/components/agents/CodeQuality";
import TestCase from "@/components/agents/TestCase";
import ApiCreator from "@/components/agents/ApiCreator";

const Index = () => {
  const [activeTab, setActiveTab] = useState("refactor");
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileUpload = (files: File[]) => {
    if (files && files.length > 0) {
      setFileName(files[0].name);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setFileContent(content);
      };
      reader.readAsText(files[0]);
    }
  };

  const renderActiveAgent = () => {
    switch (activeTab) {
      case "refactor":
        return <CodeRefactor fileContent={fileContent} fileName={fileName} />;
      case "quality":
        return <CodeQuality fileContent={fileContent} fileName={fileName} />;
      case "testcase":
        return <TestCase fileContent={fileContent} fileName={fileName} />;
      case "api":
        return <ApiCreator fileContent={fileContent} fileName={fileName} />;
      default:
        return <CodeRefactor fileContent={fileContent} fileName={fileName} />;
    }
  };

  return (
    <div className="flex h-screen bg-squadrun-dark overflow-hidden">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-squadrun-primary/20">
          <FileUpload onChange={handleFileUpload} />
        </div>
        
        <div className="flex-1 overflow-auto">
          {renderActiveAgent()}
        </div>
      </div>
    </div>
  );
};

export default Index;
