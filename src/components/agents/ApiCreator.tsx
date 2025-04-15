
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlayCircle, Server, FileDown, ChevronsUpDown } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import CodeDisplay from "../CodeDisplay";

interface ApiCreatorProps {
  fileContent: string | null;
  fileName: string | null;
}

export default function ApiCreator({ fileContent, fileName }: ApiCreatorProps) {
  const [description, setDescription] = useState<string>(
    fileContent ? `Create an API based on this code:\n\n${fileContent.substring(0, 200)}...` : ""
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiPlan, setApiPlan] = useState<any | null>(null);

  const handleCreateApi = () => {
    if (description.trim() === "") return;
    
    setIsProcessing(true);
    
    // Simulate processing delay
    setTimeout(() => {
      // Mock API plan - in a real app, this would come from an API
      const mockApiPlan = {
        overview: {
          purpose: "User management API for handling authentication and profile data",
          techStack: "Node.js, Express, MongoDB, JWT authentication",
          architecture: "RESTful API with MVC pattern"
        },
        endpoints: [
          { 
            method: "POST", 
            path: "/api/auth/register", 
            description: "Register a new user", 
            requestBody: "{ \"username\": \"string\", \"email\": \"string\", \"password\": \"string\" }",
            response: "{ \"id\": \"string\", \"username\": \"string\", \"email\": \"string\", \"token\": \"string\" }"
          },
          { 
            method: "POST", 
            path: "/api/auth/login", 
            description: "Authenticate a user", 
            requestBody: "{ \"email\": \"string\", \"password\": \"string\" }",
            response: "{ \"id\": \"string\", \"username\": \"string\", \"token\": \"string\" }"
          },
          { 
            method: "GET", 
            path: "/api/users/profile", 
            description: "Get user profile", 
            requestBody: "No body (JWT in Authorization header)",
            response: "{ \"id\": \"string\", \"username\": \"string\", \"email\": \"string\", \"profile\": { ... } }"
          },
          { 
            method: "PUT", 
            path: "/api/users/profile", 
            description: "Update user profile", 
            requestBody: "{ \"username\": \"string\", \"bio\": \"string\", ... }",
            response: "{ \"id\": \"string\", \"username\": \"string\", \"profile\": { ... } }"
          }
        ],
        dataModels: [
          {
            name: "User",
            schema: `const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  profile: {
    bio: String,
    location: String,
    website: String,
    avatar: String
  }
});`
          }
        ],
        implementation: {
          setup: `// Install dependencies
npm init -y
npm install express mongoose jsonwebtoken bcryptjs cors dotenv

// Create server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));`,
          
          authentication: `// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  profile: {
    bio: String,
    location: String,
    website: String,
    avatar: String
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);`,
          
          middleware: `// middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Get token from header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};`
        },
        security: [
          "Use HTTPS in production",
          "Implement rate limiting",
          "Validate all inputs",
          "Apply proper authentication/authorization", 
          "Use environment variables for secrets"
        ],
        deployment: [
          "Set up CI/CD pipeline with GitHub Actions",
          "Deploy API on AWS, Heroku, or similar cloud provider",
          "Configure environment variables in deployment platform",
          "Set up monitoring with tools like New Relic or DataDog"
        ]
      };
      
      setApiPlan(mockApiPlan);
      setIsProcessing(false);
    }, 3000);
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
            <Textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the API you want to create. You can include details about endpoints, data models, authentication requirements, etc."
              className="min-h-[300px] bg-squadrun-darker border-squadrun-primary/20 text-white resize-none"
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
                  {apiPlan.endpoints.map((endpoint: any, index: number) => (
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
                  {apiPlan.dataModels.map((model: any, index: number) => (
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
                  <AccordionItem value="auth">
                    <AccordionTrigger className="text-sm font-medium text-white">
                      User Authentication
                    </AccordionTrigger>
                    <AccordionContent>
                      <CodeDisplay code={apiPlan.implementation.authentication} language="javascript" />
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="middleware">
                    <AccordionTrigger className="text-sm font-medium text-white">
                      Authentication Middleware
                    </AccordionTrigger>
                    <AccordionContent>
                      <CodeDisplay code={apiPlan.implementation.middleware} language="javascript" />
                    </AccordionContent>
                  </AccordionItem>
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
