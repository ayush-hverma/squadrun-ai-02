
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import FileUpload from "@/components/FileUpload";
import CodeRefactor from "@/components/agents/CodeRefactor";
import CodeQuality from "@/components/agents/CodeQuality";
import TestCase from "@/components/agents/TestCase";
import ApiCreator from "@/components/agents/ApiCreator";

const Index = () => {
  const [activeTab, setActiveTab] = useState("refactor");
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isChangingTab, setIsChangingTab] = useState(false);

  const handleTabChange = (tab: string) => {
    setIsChangingTab(true);
    setTimeout(() => {
      setActiveTab(tab);
      setIsChangingTab(false);
    }, 200);
  };

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

  useEffect(() => {
    // Add page transition effect when component mounts
    const contentEl = document.querySelector('.content-container');
    if (contentEl) {
      contentEl.classList.add('opacity-0');
      setTimeout(() => {
        contentEl.classList.remove('opacity-0');
        contentEl.classList.add('animate-in');
      }, 100);
    }
  }, []);

  return (
    <div className="flex h-screen bg-squadrun-dark overflow-hidden">
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-squadrun-primary/20">
          <FileUpload onFileUpload={handleFileUpload} />
        </div>
        
        <div className={`flex-1 overflow-auto content-container transition-opacity duration-300 ${isChangingTab ? 'opacity-0' : 'opacity-100'}`}>
          {renderActiveAgent()}
        </div>
      </div>
    </div>
  );
};

export default Index;
