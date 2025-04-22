
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRightCircle, RefreshCw, Code, AlertTriangle, TestTube } from "lucide-react";
import CodeRefactor from "./CodeRefactor";
import CodeQuality from "./CodeQuality";
import TestCase from "./TestCase";
import NoCodeMessage from "./quality/NoCodeMessage";
import FileUpload from "@/components/FileUpload";

interface CodeInspectorProps {
  fileContent: string | null;
  fileName: string | null;
  onFileUpload: (file: File) => void;
}

export default function CodeInspector({ fileContent, fileName, onFileUpload }: CodeInspectorProps) {
  const [activeTab, setActiveTab] = useState("refactor");

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white mb-2">Code Inspector</h1>
        <p className="text-squadrun-gray">
          Analyze, refactor, and test your code with AI assistance.
        </p>
      </div>

      {/* Small Browse Files button if no file is uploaded */}
      {!fileContent && (
        <div className="mb-3 w-fit">
          <FileUpload onFileUpload={onFileUpload} />
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="mb-4">
          <TabsTrigger value="refactor" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Code Refactor
          </TabsTrigger>
          <TabsTrigger value="quality" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Code Quality
          </TabsTrigger>
          <TabsTrigger value="testcase" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            Test Cases
          </TabsTrigger>
        </TabsList>

        <TabsContent value="refactor" className="flex-1 mt-0">
          {fileContent ? <CodeRefactor fileContent={fileContent} fileName={fileName} /> : <NoCodeMessage />}
        </TabsContent>
        <TabsContent value="quality" className="flex-1 mt-0">
          {fileContent ? <CodeQuality fileContent={fileContent} fileName={fileName} /> : <NoCodeMessage />}
        </TabsContent>
        <TabsContent value="testcase" className="flex-1 mt-0">
          {fileContent ? <TestCase fileContent={fileContent} fileName={fileName} /> : <NoCodeMessage />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
