
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRightCircle, RefreshCw, Cpu } from "lucide-react";

interface PreRefactorViewProps {
  onRefactor: () => void;
  isRefactoring: boolean;
}

export const PreRefactorView = ({ onRefactor, isRefactoring }: PreRefactorViewProps) => {
  return (
    <Card className="border border-squadrun-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold text-white">Code Refactoring</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-squadrun-gray mb-2">
              The refactoring engine will automatically apply best practices for:
            </p>
            <div className="space-y-2">
              <ul className="list-disc list-inside text-squadrun-gray">
                <li>Enhancing readability</li>
                <li>Improving maintainability</li>
                <li>Optimizing performance</li>
                <li>Fixing security issues</li>
                <li>Applying DRY principles</li>
              </ul>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-squadrun-gray mb-2">Language Detected: <span className="text-squadrun-primary font-semibold">JavaScript</span></p>
            <p className="text-sm text-squadrun-gray">Complete code rewrite will be performed while preserving functionality</p>
            <div className="mt-4 flex items-center">
              <Cpu className="text-squadrun-primary mr-2 h-5 w-5" />
              <span className="text-sm text-squadrun-gray">Using AI-powered refactoring</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={onRefactor} 
            className="bg-squadrun-primary hover:bg-squadrun-vivid text-white"
            disabled={isRefactoring}
          >
            {isRefactoring ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Refactoring...
              </>
            ) : (
              <>
                <ArrowRightCircle className="mr-2 h-4 w-4" />
                Refactor Code
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
