import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { configureGemini, isGeminiConfigured, getStoredApiKey, clearApiKey } from "@/utils/aiUtils";
import { Key, Cpu, Info, Shield, Eye, EyeOff } from "lucide-react";

interface OpenAIConfigProps {
  onConfigChange?: (isConfigured: boolean) => void;
}

export default function OpenAIConfig({ onConfigChange }: OpenAIConfigProps) {
  const [apiKey, setApiKey] = useState<string>("");
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  const [model, setModel] = useState<string>("gemini-1.5-pro-latest");
  const [useEnhancedAnalysis, setUseEnhancedAnalysis] = useState<boolean>(true);
  
  useEffect(() => {
    // Check if API key is already configured
    const configured = isGeminiConfigured();
    setIsConfigured(configured);
    
    // Load stored key if available
    const storedKey = getStoredApiKey();
    if (storedKey) {
      setApiKey(storedKey);
    }
    
    // Inform parent component of configuration status
    if (onConfigChange) {
      onConfigChange(configured);
    }
  }, [onConfigChange]);
  
  const handleSaveConfig = () => {
    if (!apiKey.trim()) {
      toast.error("API Key Required", {
        description: "Please enter your Google Gemini API key to continue."
      });
      return;
    }
    
    try {
      configureGemini({
        apiKey: apiKey.trim(),
        model,
        temperature: useEnhancedAnalysis ? 0.1 : 0.3,
        maxOutputTokens: 8192
      });
      
      setIsConfigured(true);
      
      toast.success("Gemini Configuration Saved", {
        description: "Your API key has been securely stored for this session."
      });
      
      if (onConfigChange) {
        onConfigChange(true);
      }
    } catch (error) {
      console.error("Failed to save API key:", error);
      toast.error("Configuration Failed", {
        description: "There was an error saving your configuration."
      });
    }
  };
  
  const handleClearConfig = () => {
    clearApiKey();
    setApiKey("");
    setIsConfigured(false);
    
    toast.info("API Key Cleared", {
      description: "Your Gemini API key has been removed."
    });
    
    if (onConfigChange) {
      onConfigChange(false);
    }
  };

  return (
    <Card className="border border-squadrun-primary/20 bg-squadrun-darker/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Cpu className="mr-2 h-5 w-5 text-squadrun-primary" />
          Google Gemini Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="apiKey" className="text-sm flex items-center">
              API Key
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 ml-1 text-squadrun-gray" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-80">
                    Your API key is stored locally in your browser and never sent to our servers.
                    It's only used to make direct requests to Google Gemini API from your browser.
                  </p>
                </TooltipContent>
              </Tooltip>
            </Label>
            <div className="flex items-center">
              <Shield className="h-4 w-4 mr-1 text-squadrun-primary" />
              <span className="text-xs text-squadrun-gray">Stored locally</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                type={showApiKey ? "text" : "password"}
                placeholder="YOUR_GEMINI_API_KEY"
                className="bg-squadrun-darker border-squadrun-primary/20 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-squadrun-gray hover:text-white"
              >
                {showApiKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            
            {isConfigured && (
              <Button 
                variant="outline" 
                size="icon"
                className="border-red-500/50 hover:border-red-500 hover:bg-red-950/20"
                onClick={handleClearConfig}
              >
                <Key className="h-4 w-4 text-red-400" />
              </Button>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="model" className="text-sm">Model</Label>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger className="bg-squadrun-darker border-squadrun-primary/20">
              <SelectValue placeholder="Select Gemini model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gemini-1.5-pro-latest">Gemini 1.5 Pro (Most Capable)</SelectItem>
              <SelectItem value="gemini-1.5-flash-latest">Gemini 1.5 Flash (Faster)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="enhanced-analysis" className="text-sm">Enhanced Analysis</Label>
            <p className="text-xs text-squadrun-gray">
              More detailed code inspection with lower randomness
            </p>
          </div>
          <Switch 
            id="enhanced-analysis"
            checked={useEnhancedAnalysis}
            onCheckedChange={setUseEnhancedAnalysis}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSaveConfig} 
          className="w-full bg-squadrun-primary hover:bg-squadrun-vivid text-white"
          disabled={!apiKey.trim()}
        >
          {isConfigured ? "Update Configuration" : "Save API Key"}
        </Button>
      </CardFooter>
    </Card>
  );
}
