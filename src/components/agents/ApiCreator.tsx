import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlayCircle, Server, FileDown, ChevronsUpDown } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import CodeDisplay from "../CodeDisplay";
import { useToast } from "@/hooks/use-toast";
import { AutogrowingTextarea } from "@/components/ui/autogrowing-textarea";
import ModelPicker from "@/components/ModelPicker";
import { callGeminiApi } from "@/utils/aiUtils";
import { systemInstructionTemplate, getApiPlanPrompt } from "@/utils/aiUtils/apiPromptTemplates";
import { toast } from "sonner";

interface ApiCreatorProps {
  fileContent?: string | null;
  fileName?: string | null;
}

interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
  
  requestBody: string;
  response: string;
}

interface DataModel {
  name: string;
  schema: string;
}

interface ApiPlan {
  overview: {
    purpose: string;
    techStack: string;
    architecture: string;
  };
  endpoints: ApiEndpoint[];
  dataModels: DataModel[];
  implementation: {
    setup: string;
    authentication?: string;
    middleware?: string;
    routes?: string;
  };
  security: string[];
  deployment: string[];
}

export default function ApiCreator({ fileContent, fileName }: ApiCreatorProps) {
  const { toast } = useToast();
  const [description, setDescription] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiPlan, setApiPlan] = useState<ApiPlan | null>(null);
  const [model, setModel] = useState<"gemini" | "openai" | "groq">("gemini");
  const [error, setError] = useState<string | null>(null);

  const validateApiPlan = (plan: any): plan is ApiPlan => {
    try {
      // Check if plan is an object
      if (!plan || typeof plan !== 'object') {
        console.error("Plan is not a valid object");
        return false;
      }

      // Ensure basic structure exists
      const requiredSections = ['overview', 'endpoints', 'dataModels', 'implementation', 'security', 'deployment'];
      for (const section of requiredSections) {
        if (!(section in plan)) {
          console.error(`Missing required section: ${section}`);
          return false;
        }
      }

      // Validate overview (allow partial data)
      if (!plan.overview || typeof plan.overview !== 'object') {
        console.error("Invalid overview section");
        return false;
      }

      // Validate endpoints (allow empty array)
      if (!Array.isArray(plan.endpoints)) {
        console.error("Endpoints must be an array");
        return false;
      }

      // Validate data models (allow empty array)
      if (!Array.isArray(plan.dataModels)) {
        console.error("Data models must be an array");
        return false;
      }

      // Validate implementation (allow partial data)
      if (!plan.implementation || typeof plan.implementation !== 'object') {
        console.error("Invalid implementation section");
        return false;
      }

      // Validate security and deployment (allow empty arrays)
      if (!Array.isArray(plan.security)) {
        console.error("Security must be an array");
        return false;
      }
      if (!Array.isArray(plan.deployment)) {
        console.error("Deployment must be an array");
        return false;
      }

      // Ensure at least one endpoint exists
      if (plan.endpoints.length === 0) {
        console.error("At least one endpoint is required");
        return false;
      }

      // Validate each endpoint has required fields
      for (const endpoint of plan.endpoints) {
        if (!endpoint.method || !endpoint.path) {
          console.error("Endpoint missing required fields (method or path)");
          return false;
        }
      }

      // Ensure at least one data model exists
      if (plan.dataModels.length === 0) {
        console.error("At least one data model is required");
        return false;
      }

      // Validate each data model has required fields
      for (const model of plan.dataModels) {
        if (!model.name) {
          console.error("Data model missing required field (name)");
          return false;
        }
      }

      // Ensure implementation has setup
      if (!plan.implementation.setup) {
        console.error("Implementation missing setup");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error validating API plan:", error);
      return false;
    }
  };

  const generateApiPlanWithAI = async (prompt: string): Promise<ApiPlan> => {
    try {
      const systemInstruction = systemInstructionTemplate;
      const response = await callGeminiApi(
        prompt,
        systemInstruction,
        { temperature: 0.2, maxOutputTokens: 8192 }
      );

      // Try to parse the response as JSON
      let parsedResponse;
      try {
        // Find JSON content in the response - look for the first { and the last }
        const jsonStart = response.indexOf('{');
        const jsonEnd = response.lastIndexOf('}') + 1;
        
        if (jsonStart >= 0 && jsonEnd > jsonStart) {
          const jsonContent = response.substring(jsonStart, jsonEnd);
          parsedResponse = JSON.parse(jsonContent);
        } else {
          throw new Error("Could not find valid JSON in the response");
        }
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError);
        console.log("Raw response:", response);
        throw new Error("Failed to parse AI response as JSON");
      }

      // Validate the parsed response
      if (!validateApiPlan(parsedResponse)) {
        console.error("Invalid API plan structure:", parsedResponse);
        throw new Error("Generated API plan does not match the required structure. Please try again.");
      }

      return parsedResponse as ApiPlan;
    } catch (error) {
      console.error("Error generating API plan:", error);
      throw error;
    }
  };

  const handleCreateApi = async () => {
    if (!description.trim()) {
      toast({
        title: "Error",
        description: "Please enter a description for your API",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // Generate the prompt for the API plan
      const prompt = getApiPlanPrompt(description, fileContent);
      
      // Call Gemini API to generate the plan
      const generatedApiPlan = await generateApiPlanWithAI(prompt);
      setApiPlan(generatedApiPlan);
      
      toast({
        title: "API Plan Generated",
        description: "Your custom API plan has been created based on your requirements.",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Error generating API plan:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!apiPlan) {
    return (
      <div className="p-4 h-full flex flex-col">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-white mb-2">API Creator</h1>
          <p className="text-squadrun-gray">
            Convert code or natural language descriptions into production-ready API designs and implementation plans.
          </p>
        </div>
        
        <Card className="flex-1 border border-squadrun-primary/20 bg-squadrun-darker/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Describe Your API Requirements</CardTitle>
          </CardHeader>
          <CardContent className="h-[calc(100%-60px)]">
            <AutogrowingTextarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the API you want to create. You can include details about endpoints, data models, authentication requirements, etc."
              className="bg-squadrun-darker border-squadrun-primary/20 text-white"
            />
          </CardContent>
        </Card>
        
        <div className="flex justify-between items-center">
          <ModelPicker
            value={model}
            onChange={setModel}
          />
          <Button
            onClick={handleCreateApi}
            className="bg-squadrun-primary hover:bg-squadrun-vivid text-white mt-4 ml-auto"
            disabled={isProcessing || description.trim() === ""}
          >
            {isProcessing ? (
              <>Processing...</>
            ) : (
              <>
                <Server className="mr-2 h-4 w-4" /> Generate API Plan
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="mb-3 flex items-center">
        <span className="text-squadrun-gray mr-2 text-sm">Model:</span>
        <ModelPicker value={model} onChange={setModel} />
      </div>
      
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white mb-2">API Implementation Plan</h1>
        <p className="text-squadrun-gray">
          Complete roadmap for implementing a production-ready API based on your requirements.
        </p>
      </div>
      
      <div className="flex-1 overflow-auto">
        <Tabs defaultValue="overview" className="flex-1">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
            <TabsTrigger value="data-models">Data Models</TabsTrigger>
            <TabsTrigger value="implementation">Implementation</TabsTrigger>
            <TabsTrigger value="security-deployment">Security & Deployment</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-0">
            <Card className="border border-squadrun-primary/20 bg-squadrun-darker/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">API Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-white mb-1">Purpose</h3>
                    <p className="text-sm text-squadrun-gray">{apiPlan.overview.purpose}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white mb-1">Recommended Tech Stack</h3>
                    <p className="text-sm text-squadrun-gray">{apiPlan.overview.techStack}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white mb-1">Architecture</h3>
                    <p className="text-sm text-squadrun-gray">{apiPlan.overview.architecture}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="endpoints" className="mt-0">
            <Card className="border border-squadrun-primary/20 bg-squadrun-darker/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">API Endpoints</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {apiPlan.endpoints.map((endpoint: ApiEndpoint, index: number) => (
                    <div key={index} className="border border-squadrun-primary/10 rounded-md p-4">
                      <div className="flex items-center mb-2">
                        <span className={`px-2 py-1 text-xs rounded mr-2 ${
                          endpoint.method === 'GET' ? 'bg-blue-500/20 text-blue-300' :
                          endpoint.method === 'POST' ? 'bg-green-500/20 text-green-300' :
                          endpoint.method === 'PUT' ? 'bg-yellow-500/20 text-yellow-300' :
                          endpoint.method === 'DELETE' ? 'bg-red-500/20 text-red-300' :
                          'bg-purple-500/20 text-purple-300'
                        }`}>
                          {endpoint.method}
                        </span>
                        <span className="text-white font-mono">{endpoint.path}</span>
                      </div>
                      <p className="text-sm text-squadrun-gray mb-3">{endpoint.description}</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-xs text-squadrun-gray mb-1">Request</h4>
                          <div className="bg-squadrun-darker rounded p-2">
                            <pre className="text-xs text-white whitespace-pre-wrap">
                              {typeof endpoint.requestBody === 'object' 
                                ? JSON.stringify(endpoint.requestBody, null, 2)
                                : endpoint.requestBody}
                            </pre>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-xs text-squadrun-gray mb-1">Response</h4>
                          <div className="bg-squadrun-darker rounded p-2">
                            <pre className="text-xs text-white whitespace-pre-wrap">
                              {typeof endpoint.response === 'object'
                                ? JSON.stringify(endpoint.response, null, 2)
                                : endpoint.response}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="data-models" className="mt-0">
            <Card className="border border-squadrun-primary/20 bg-squadrun-darker/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Data Models</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {apiPlan.dataModels.map((model: DataModel, index: number) => (
                    <div key={index} className="border border-squadrun-primary/10 rounded-md p-4">
                      <h3 className="text-sm font-medium text-white mb-2">{model.name} Schema</h3>
                      <CodeDisplay 
                        code={typeof model.schema === 'string' ? model.schema : JSON.stringify(model.schema, null, 2)} 
                        language="javascript" 
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="implementation" className="mt-0">
            <Card className="border border-squadrun-primary/20 bg-squadrun-darker/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Implementation Guide</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="setup">
                    <AccordionTrigger className="text-sm font-medium text-white">
                      Project Setup
                    </AccordionTrigger>
                    <AccordionContent>
                      <CodeDisplay code={apiPlan.implementation.setup} language="javascript" />
                    </AccordionContent>
                  </AccordionItem>
                  {apiPlan.implementation.authentication && (
                    <AccordionItem value="auth">
                      <AccordionTrigger className="text-sm font-medium text-white">
                        User Authentication
                      </AccordionTrigger>
                      <AccordionContent>
                        <CodeDisplay 
                          code={typeof apiPlan.implementation.authentication === 'string' 
                            ? apiPlan.implementation.authentication 
                            : JSON.stringify(apiPlan.implementation.authentication, null, 2)} 
                          language="javascript" 
                        />
                      </AccordionContent>
                    </AccordionItem>
                  )}
                  {apiPlan.implementation.middleware && (
                    <AccordionItem value="middleware">
                      <AccordionTrigger className="text-sm font-medium text-white">
                        Authentication Middleware
                      </AccordionTrigger>
                      <AccordionContent>
                        <CodeDisplay 
                          code={typeof apiPlan.implementation.middleware === 'string' 
                            ? apiPlan.implementation.middleware 
                            : JSON.stringify(apiPlan.implementation.middleware, null, 2)} 
                          language="javascript" 
                        />
                      </AccordionContent>
                    </AccordionItem>
                  )}
                  {apiPlan.implementation.routes && (
                    <AccordionItem value="routes">
                      <AccordionTrigger className="text-sm font-medium text-white">
                        Route Implementation
                      </AccordionTrigger>
                      <AccordionContent>
                        <CodeDisplay 
                          code={typeof apiPlan.implementation.routes === 'string' 
                            ? apiPlan.implementation.routes 
                            : JSON.stringify(apiPlan.implementation.routes, null, 2)} 
                          language="javascript" 
                        />
                      </AccordionContent>
                    </AccordionItem>
                  )}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security-deployment" className="mt-0">
            <div className="grid grid-cols-2 gap-4">
              <Card className="border border-squadrun-primary/20 bg-squadrun-darker/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Security Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-2 text-squadrun-gray">
                    {apiPlan.security.map((item: string, index: number) => (
                      <li key={index} className="text-sm">{item}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="border border-squadrun-primary/20 bg-squadrun-darker/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Deployment Strategy</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-2 text-squadrun-gray">
                    {apiPlan.deployment.map((item: string, index: number) => (
                      <li key={index} className="text-sm">{item}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="flex justify-end mt-4">
        <Button
          variant="outline" 
          className="text-squadrun-gray mr-2 border-squadrun-primary/20 hover:bg-squadrun-primary/10"
          onClick={() => setApiPlan(null)}
        >
          <ChevronsUpDown className="mr-2 h-4 w-4" /> Edit Requirements
        </Button>
        <Button
          className="bg-squadrun-primary hover:bg-squadrun-vivid text-white"
        >
          <FileDown className="mr-2 h-4 w-4" /> Download API Blueprint
        </Button>
      </div>
    </div>
  );
}
