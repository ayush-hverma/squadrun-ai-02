
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import UnifiedAgent from "@/components/agents/UnifiedAgent";
import ApiCreator from "@/components/agents/ApiCreator";

const Index = () => {
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeTab, setActiveTab] = useState("inspector");

  const handleTabChange = (tab: string) => {
    if (tab !== activeTab) {
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveTab(tab);
        setIsTransitioning(false);
      }, 300);
    }
  };

  // Stylized background gradient + subtle grid
  return (
    <div className="flex h-screen bg-squadrun-dark overflow-hidden relative">
      {/* Decorative gradient background */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-squadrun-dark via-squadrun-primary/20 to-squadrun-secondary/30 opacity-80" />
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <div
          className={`flex-1 overflow-auto transition-opacity duration-300 ease-in-out ${isTransitioning ? "opacity-0" : "opacity-100"} px-0 md:px-4 py-8 md:py-12`}
        >
          <div className="h-full glass-effect rounded-2xl shadow-2xl border border-squadrun-primary/15 max-w-6xl mx-auto">
            {activeTab === "inspector" ? (
              <UnifiedAgent fileContent={fileContent} fileName={fileName} />
            ) : (
              <ApiCreator />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
