
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Cpu, Code } from "lucide-react";
import { toast } from "sonner";
import ModelPicker from "@/components/ModelPicker";
import { Textarea } from "@/components/ui/textarea";

export default function ApiCreator() {
  const [codeInput, setCodeInput] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiSpec, setApiSpec] = useState<string | null>(null);
  const [model, setModel] = useState<"gemini" | "openai" | "groq">("openai");

  const handleGenerateApi = async () => {
    if (!codeInput.trim()) {
      toast.error("Please enter some code first");
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Simulate API generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock API spec generation
      const mockApiSpec = `openapi: 3.0.0
info:
  title: Generated API Specification
  version: 1.0.0
  description: API automatically generated from source code
paths:
  /api/resource:
    get:
      summary: Get resources
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Resource'
    post:
      summary: Create resource
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ResourceInput'
      responses:
        '201':
          description: Resource created
components:
  schemas:
    Resource:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        createdAt:
          type: string
          format: date-time
    ResourceInput:
      type: object
      required:
        - name
      properties:
        name:
          type: string`;
      
      setApiSpec(mockApiSpec);
      toast.success("API specification generated", {
        description: "OpenAPI 3.0 specification created successfully."
      });
      
    } catch (error) {
      console.error("API generation error:", error);
      toast.error("API generation failed", {
        description: error instanceof Error ? error.message : "An error occurred during API generation."
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!apiSpec) {
    return (
      <div className="p-4 h-full flex flex-col">
        <div className="mb-3 flex items-center">
          <span className="text-squadrun-gray mr-2 text-sm">Model:</span>
          <ModelPicker value={model} onChange={setModel} />
        </div>
        <div className="flex-1 flex flex-col">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-white mb-2">API Specification Generator</h1>
            <p className="text-squadrun-gray">
              Enter your code below and generate OpenAPI specifications. This tool analyzes your code structure and creates API endpoints.
            </p>
          </div>
          <Textarea
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            placeholder="Paste your code here..."
            className="flex-1 mb-4 min-h-[300px] bg-squadrun-darker text-white font-mono"
          />
          <Button 
            onClick={handleGenerateApi} 
            disabled={isGenerating}
            className="bg-squadrun-primary hover:bg-squadrun-vivid text-white w-fit"
          >
            {isGenerating ? (
              <>
                <Cpu className="mr-2 h-4 w-4 animate-spin" />
                Generating API...
              </>
            ) : (
              <>
                <Code className="mr-2 h-4 w-4" />
                Generate API Specification
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <span className="text-squadrun-gray mr-2 text-sm">Model:</span>
          <ModelPicker value={model} onChange={setModel} />
        </div>
      </div>
      
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white mb-2">API Specification Generator</h1>
        <p className="text-squadrun-gray">
          Generate OpenAPI specifications from your code. This tool analyzes your code structure and creates API endpoints.
        </p>
      </div>
      
      <div className="flex-1 overflow-auto bg-squadrun-darker rounded-md p-4">
        <pre className="text-white font-mono text-sm whitespace-pre-wrap">
          {apiSpec}
        </pre>
      </div>
    </div>
  );
}
