
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  PlayCircle, 
  X,
  Server,
  Shield,
  FileText,
  Cloud
} from "lucide-react";
import CodeDisplay from "../CodeDisplay";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ApiCreatorProps {
  fileContent: string | null;
  fileName: string | null;
}

export default function ApiCreator({ fileContent, fileName }: ApiCreatorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedApi, setGeneratedApi] = useState<{
    endpoints: string | null;
    documentation: string | null;
    security: string | null;
    deployment: string | null;
  }>({
    endpoints: null,
    documentation: null,
    security: null,
    deployment: null
  });
  const [prompt, setPrompt] = useState("");
  const { toast } = useToast();

  const handleClear = () => {
    setGeneratedApi({
      endpoints: null,
      documentation: null,
      security: null,
      deployment: null
    });
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
      // Endpoints
      const endpointsCode = `
// Generated API Endpoints for: ${prompt}

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
      
      // Documentation
      const documentationCode = `
// API Documentation for: ${prompt}

/**
 * API Documentation
 * 
 * Base URL: /api
 * 
 * Endpoints:
 * 
 * 1. GET /api/items
 *    - Description: Retrieves all items
 *    - Parameters: None
 *    - Response: Array of item objects
 *    - Status Codes:
 *      * 200: Success
 *      * 500: Server error
 * 
 * 2. POST /api/items
 *    - Description: Creates a new item
 *    - Authentication: Required
 *    - Request Body:
 *      * name: String (required)
 *      * description: String (required)
 *    - Response: Newly created item object
 *    - Status Codes:
 *      * 200: Success
 *      * 400: Bad request
 *      * 401: Unauthorized
 *      * 500: Server error
 */
      `.trim();
      
      // Security
      const securityCode = `
// API Security Configuration for: ${prompt}

/**
 * Security Implementation
 * 
 * 1. Authentication Middleware
 */
const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function(req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, config.get('jwtSecret'));
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

/**
 * 2. Rate Limiting
 */
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Apply rate limiting to all API routes
app.use('/api/', apiLimiter);

/**
 * 3. Input Validation
 */
const { check, validationResult } = require('express-validator');

// Example validation for item creation
const validateItem = [
  check('name', 'Name is required').not().isEmpty(),
  check('description', 'Description is required').not().isEmpty()
];

// Use in route
router.post('/', [auth, validateItem], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  // Continue with item creation...
});
      `.trim();
      
      // Deployment - Fixed the template literal issue by escaping the $ character
      const deploymentCode = `
// Deployment Configuration for: ${prompt}

/**
 * Deployment Instructions
 * 
 * 1. Docker Configuration
 */
// Dockerfile
/*
FROM node:14-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
*/

/**
 * 2. Environment Variables
 */
// .env.example
/*
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb://localhost:27017/yourdb
JWT_SECRET=your_jwt_secret
*/

/**
 * 3. CI/CD Pipeline (GitHub Actions)
 */
// .github/workflows/deploy.yml
/*
name: Deploy API

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Use Node.js
        uses: actions/setup-node@v1
        with:
          node-version: '14'
      - run: npm ci
      - run: npm test
      - name: Deploy to production
        uses: some-deployment-action@v1
        with:
          api_token: \${{ secrets.DEPLOY_TOKEN }}
*/
      `.trim();
      
      setGeneratedApi({
        endpoints: endpointsCode,
        documentation: documentationCode,
        security: securityCode,
        deployment: deploymentCode
      });
      setIsProcessing(false);
    }, 2000);
  };

  const hasGeneratedContent = generatedApi.endpoints || 
    generatedApi.documentation || 
    generatedApi.security || 
    generatedApi.deployment;

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white mb-2">API Creator</h1>
        <p className="text-squadrun-gray">
          Generate API code based on your description.
        </p>
      </div>
      
      {hasGeneratedContent ? (
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
              <CardTitle className="text-lg">Generated API</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="endpoints" className="w-full">
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="endpoints" className="flex items-center gap-1">
                    <Server className="h-4 w-4" /> Endpoints
                  </TabsTrigger>
                  <TabsTrigger value="documentation" className="flex items-center gap-1">
                    <FileText className="h-4 w-4" /> Documentation
                  </TabsTrigger>
                  <TabsTrigger value="security" className="flex items-center gap-1">
                    <Shield className="h-4 w-4" /> Security
                  </TabsTrigger>
                  <TabsTrigger value="deployment" className="flex items-center gap-1">
                    <Cloud className="h-4 w-4" /> Deployment
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="endpoints">
                  <CodeDisplay code={generatedApi.endpoints || ""} language="javascript" />
                </TabsContent>
                
                <TabsContent value="documentation">
                  <CodeDisplay code={generatedApi.documentation || ""} language="javascript" />
                </TabsContent>
                
                <TabsContent value="security">
                  <CodeDisplay code={generatedApi.security || ""} language="javascript" />
                </TabsContent>
                
                <TabsContent value="deployment">
                  <CodeDisplay code={generatedApi.deployment || ""} language="javascript" />
                </TabsContent>
              </Tabs>
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
