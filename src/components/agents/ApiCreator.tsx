
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  PlayCircle, 
  X 
} from "lucide-react";
import CodeDisplay from "../CodeDisplay";
import { useToast } from "@/hooks/use-toast";

interface ApiCreatorProps {
  fileContent: string | null;
  fileName: string | null;
}

export default function ApiCreator({ fileContent, fileName }: ApiCreatorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedApiCode, setGeneratedApiCode] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const { toast } = useToast();

  const handleClear = () => {
    setGeneratedApiCode(null);
  };

  const handleGenerateApi = () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt to generate API code",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate API generation
    setTimeout(() => {
      const sampleApiCode = `
// Generated API for: ${prompt}

import express from 'express';
const router = express.Router();

/**
 * @route   GET /api/items
 * @desc    Get all items
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   POST /api/items
 * @desc    Create a new item
 * @access  Private
 */
router.post('/', auth, async (req, res) => {
  try {
    const newItem = new Item({
      name: req.body.name,
      description: req.body.description,
      user: req.user.id
    });

    const item = await newItem.save();
    res.json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;
      `.trim();
      
      setGeneratedApiCode(sampleApiCode);
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white mb-2">API Creator</h1>
        <p className="text-squadrun-gray">
          Generate API code based on your description.
        </p>
      </div>
      
      {generatedApiCode ? (
        <div className="flex-1 flex flex-col">
          <div className="flex items-center mb-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleClear} 
              className="ml-auto text-white hover:bg-squadrun-primary/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <Card className="border border-squadrun-primary/20 bg-squadrun-darker/50 flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Generated API Code</CardTitle>
            </CardHeader>
            <CardContent>
              <CodeDisplay code={generatedApiCode} language="javascript" />
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <Card className="mb-4 border border-squadrun-primary/20 bg-squadrun-darker/50">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">What API do you want to generate?</h3>
                  <Input 
                    placeholder="Describe the API you want to create (e.g., REST API for a blog with CRUD operations)"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="bg-squadrun-dark border-squadrun-primary/30 text-white"
                  />
                </div>
                
                <Button
                  onClick={handleGenerateApi}
                  className="bg-squadrun-primary hover:bg-squadrun-vivid text-white w-full"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <PlayCircle className="mr-2 h-4 w-4" /> Generate API
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
