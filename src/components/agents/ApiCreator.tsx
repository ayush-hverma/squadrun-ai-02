
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
  const [description, setDescription] = useState<string>(
    fileContent ? `Create an API based on this code:\n\n${fileContent.substring(0, 200)}...` : ""
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiPlan, setApiPlan] = useState<ApiPlan | null>(null);
  const [model, setModel] = useState<"gemini" | "openai" | "groq">("gemini");
  const [error, setError] = useState<string | null>(null);

  const generateApiPlanWithAI = async (prompt: string): Promise<ApiPlan> => {
    try {
      const systemInstruction = systemInstructionTemplate;
      const response = await callGeminiApi(
        prompt,
        systemInstruction,
        { temperature: 0.2, maxOutputTokens: 8192 }
      );

      console.log("Raw AI response:", response);

      // Enhanced JSON extraction logic
      const extractJSON = (text: string): any => {
        // Try to find JSON using regex patterns
        const jsonPattern = /\{[\s\S]*\}/g;
        const matches = text.match(jsonPattern);
        
        if (!matches || matches.length === 0) {
          console.error("No JSON object found in response");
          throw new Error("Could not find valid JSON in the response");
        }
        
        // Try each match until one works
        for (const match of matches) {
          try {
            return JSON.parse(match);
          } catch (e) {
            console.log("Failed to parse potential JSON match:", match.substring(0, 100) + "...");
            // Continue to next match if this one fails
          }
        }
        
        // If we got here, none of the matches worked
        throw new Error("Failed to parse any JSON objects in the response");
      };

      try {
        // First attempt: Try direct parsing
        let parsedResponse;
        try {
          parsedResponse = JSON.parse(response);
          console.log("Direct JSON parsing successful");
        } catch (e) {
          console.log("Direct JSON parsing failed, trying extraction methods");
          parsedResponse = extractJSON(response);
        }
        
        // Validate the parsed response structure
        if (!parsedResponse.overview || !parsedResponse.endpoints || !parsedResponse.dataModels) {
          console.error("Parsed response is missing required fields", parsedResponse);
          throw new Error("AI response is missing required API plan structure");
        }
        
        return parsedResponse as ApiPlan;
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError);
        console.log("Raw response preview:", response.substring(0, 200));
        throw new Error("Failed to parse AI response as JSON. The response format was unexpected.");
      }
    } catch (error) {
      console.error("Error generating API plan:", error);
      throw error;
    }
  };

  const handleCreateApi = async () => {
    if (description.trim() === "") return;
    
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
      setError(error instanceof Error ? error.message : "An unknown error occurred");
      toast({
        title: "Error",
        description: "Failed to generate API plan. Please try again.",
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
                            <pre className="text-xs text-white whitespace-pre-wrap">{endpoint.requestBody}</pre>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-xs text-squadrun-gray mb-1">Response</h4>
                          <div className="bg-squadrun-darker rounded p-2">
                            <pre className="text-xs text-white whitespace-pre-wrap">{endpoint.response}</pre>
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
                      <CodeDisplay code={model.schema} language="javascript" />
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
                        <CodeDisplay code={apiPlan.implementation.authentication} language="javascript" />
                      </AccordionContent>
                    </AccordionItem>
                  )}
                  {apiPlan.implementation.middleware && (
                    <AccordionItem value="middleware">
                      <AccordionTrigger className="text-sm font-medium text-white">
                        Authentication Middleware
                      </AccordionTrigger>
                      <AccordionContent>
                        <CodeDisplay code={apiPlan.implementation.middleware} language="javascript" />
                      </AccordionContent>
                    </AccordionItem>
                  )}
                  {apiPlan.implementation.routes && (
                    <AccordionItem value="routes">
                      <AccordionTrigger className="text-sm font-medium text-white">
                        Route Implementation
                      </AccordionTrigger>
                      <AccordionContent>
                        <CodeDisplay code={apiPlan.implementation.routes} language="javascript" />
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
