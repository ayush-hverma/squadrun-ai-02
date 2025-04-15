
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface OpenAIKeyManagerProps {
  onKeySet: (key: string) => void;
}

export const OpenAIKeyManager: React.FC<OpenAIKeyManagerProps> = ({ onKeySet }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [isValidKey, setIsValidKey] = useState<boolean>(false);

  useEffect(() => {
    // Check for existing key in localStorage on component mount
    const storedKey = localStorage.getItem('openai_api_key');
    if (storedKey) {
      setApiKey(storedKey);
      onKeySet(storedKey);
    }
  }, []);

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
    // Basic validation (not foolproof, just a quick check)
    setIsValidKey(e.target.value.trim().length > 40);
  };

  const saveApiKey = () => {
    if (isValidKey) {
      localStorage.setItem('openai_api_key', apiKey);
      onKeySet(apiKey);
      toast({
        title: "OpenAI API Key",
        description: "API Key has been securely stored in your browser",
        duration: 3000,
      });
    } else {
      toast({
        title: "Invalid API Key",
        description: "Please enter a valid OpenAI API key",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const removeApiKey = () => {
    localStorage.removeItem('openai_api_key');
    setApiKey('');
    onKeySet('');
    toast({
      title: "OpenAI API Key",
      description: "API Key has been removed",
      duration: 3000,
    });
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex space-x-2">
        <Input 
          type="password" 
          placeholder="Enter OpenAI API Key" 
          value={apiKey}
          onChange={handleKeyChange}
          className="flex-grow"
        />
        <Button 
          onClick={saveApiKey} 
          disabled={!isValidKey}
          className="bg-squadrun-primary hover:bg-squadrun-vivid"
        >
          Save Key
        </Button>
        <Button 
          onClick={removeApiKey} 
          variant="destructive"
        >
          Remove
        </Button>
      </div>
      {apiKey && (
        <p className="text-xs text-squadrun-gray">
          API Key is stored securely in your browser's local storage
        </p>
      )}
    </div>
  );
};
