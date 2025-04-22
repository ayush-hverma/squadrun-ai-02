
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import CodeRefactor from "@/components/agents/CodeRefactor";
import CodeQuality from "@/components/agents/CodeQuality";
import TestCase from "@/components/agents/TestCase";
import ApiCreator from "@/components/agents/ApiCreator";

const Index = () => {
  const [activeTab, setActiveTab] = useState("refactor");
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

  const renderActiveAgent = () => {
    switch (activeTab) {
      case "refactor":
        return <CodeRefactor />;
      case "quality":
        return <CodeQuality />;
      case "testcase":
        return <TestCase />;
      case "api":
        return <ApiCreator />;
      default:
        return <CodeRefactor />;
    }
  };

  return (
    <div className="flex h-screen bg-squadrun-dark overflow-hidden">
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />

      <div className="flex-1 flex flex-col overflow-hidden">
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
