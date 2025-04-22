
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Code, AlertTriangle, TestTube, Server } from "lucide-react";

interface NavItem {
  icon: React.ElementType;
  label: string;
  value: string;
}

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const navItems: NavItem[] = [
    {
      icon: Code,
      label: "Code Refactor",
      value: "refactor"
    },
    {
      icon: AlertTriangle,
      label: "Code Quality",
      value: "quality"
    },
    {
      icon: TestTube,
      label: "Test Cases",
      value: "testcase"
    },
    {
      icon: Server,
      label: "API Creator",
      value: "api"
    }
  ];

  return (
    <div className="h-screen w-64 bg-squadrun-darker/80 backdrop-blur-sm border-r border-squadrun-primary/20 flex flex-col shadow-xl">
      <div className="p-6 border-b border-squadrun-primary/20">
        <h1 className="text-2xl font-bold flex items-center animate-fade-in">
          <span className="bg-gradient-to-r from-squadrun-primary to-squadrun-vivid bg-clip-text text-transparent">Squad</span>
          <span className="text-white">Run</span>
          <span className="bg-gradient-to-r from-squadrun-primary to-squadrun-vivid bg-clip-text text-transparent ml-1">AI</span>
        </h1>
        <p className="text-sm text-squadrun-gray mt-2 animate-fade-in">Code Intelligence Suite</p>
      </div>
      
      <div className="p-4 flex-1">
        <p className="text-xs uppercase text-squadrun-gray mb-4 font-semibold tracking-wider pl-2">AI Agents</p>
        <div className="space-y-2">
          {navItems.map((item, index) => (
            <Button
              key={item.value}
              variant="ghost"
              className={cn(
                "w-full justify-start text-squadrun-gray hover:text-white hover:bg-squadrun-primary/20 transition-all duration-200",
                "animate-fade-in",
                activeTab === item.value && "bg-squadrun-primary/20 text-white shadow-sm hover:shadow-squadrun-primary/20"
              )}
              onClick={() => onTabChange(item.value)}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="p-4 border-t border-squadrun-primary/20 bg-squadrun-darker/50">
        <div className="text-xs text-squadrun-gray text-center">
          © 2025 SquadRun AI
        </div>
      </div>
    </div>
  );
}
