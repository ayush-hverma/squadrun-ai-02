
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import CodeDisplay from '@/components/CodeDisplay';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeftRight, MousePointerClick, LayoutGrid, DiffIcon, SplitSquareVertical } from 'lucide-react';

interface CodeComparisonProps {
  originalCode: string;
  refactoredCode: string;
  language: string;
}

const CodeComparison = ({ originalCode, refactoredCode, language }: CodeComparisonProps) => {
  const [viewMode, setViewMode] = useState<'split' | 'unified' | 'sideBySide'>('split');
  
  // Line highlighting effect for differences
  const [diffLines, setDiffLines] = useState<{original: number[], refactored: number[]}>({
    original: [],
    refactored: []
  });
  
  // Simple diffing to highlight changed lines
  useEffect(() => {
    if (originalCode && refactoredCode) {
      const originalLines = originalCode.split('\n');
      const refactoredLines = refactoredCode.split('\n');
      
      const origDiff: number[] = [];
      const refacDiff: number[] = [];
      
      // Very simple diff - just checking line by line differences
      // A more sophisticated diff algorithm could be implemented here
      originalLines.forEach((line, index) => {
        if (index < refactoredLines.length) {
          if (line !== refactoredLines[index]) {
            origDiff.push(index);
            refacDiff.push(index);
          }
        } else {
          origDiff.push(index);
        }
      });
      
      // If refactored code has more lines
      if (refactoredLines.length > originalLines.length) {
        for (let i = originalLines.length; i < refactoredLines.length; i++) {
          refacDiff.push(i);
        }
      }
      
      setDiffLines({
        original: origDiff,
        refactored: refacDiff
      });
    }
  }, [originalCode, refactoredCode]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 bg-squadrun-darker p-3 rounded-md">
        <div className="flex items-center">
          <DiffIcon className="mr-2 h-5 w-5 text-squadrun-primary" />
          <h3 className="text-white font-medium">Code Comparison</h3>
        </div>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant={viewMode === 'split' ? 'default' : 'outline'} 
            className={viewMode === 'split' ? 'bg-squadrun-primary' : 'border-squadrun-primary/50 text-squadrun-gray'} 
            onClick={() => setViewMode('split')}
          >
            <LayoutGrid className="h-4 w-4 mr-1" />
            Tabs
          </Button>
          <Button 
            size="sm" 
            variant={viewMode === 'unified' ? 'default' : 'outline'} 
            className={viewMode === 'unified' ? 'bg-squadrun-primary' : 'border-squadrun-primary/50 text-squadrun-gray'} 
            onClick={() => setViewMode('unified')}
          >
            <ArrowLeftRight className="h-4 w-4 mr-1" />
            Before/After
          </Button>
          <Button 
            size="sm" 
            variant={viewMode === 'sideBySide' ? 'default' : 'outline'} 
            className={viewMode === 'sideBySide' ? 'bg-squadrun-primary' : 'border-squadrun-primary/50 text-squadrun-gray'} 
            onClick={() => setViewMode('sideBySide')}
          >
            <SplitSquareVertical className="h-4 w-4 mr-1" />
            Side by Side
          </Button>
        </div>
      </div>
      
      {viewMode === 'split' && (
        <Tabs defaultValue="original" className="h-full">
          <TabsList className="bg-squadrun-darker">
            <TabsTrigger value="original">Original Code</TabsTrigger>
            <TabsTrigger value="refactored">Refactored Code</TabsTrigger>
          </TabsList>
          <TabsContent value="original" className="h-[calc(100%-40px)] overflow-hidden">
            <CodeDisplay code={originalCode} language={language} />
          </TabsContent>
          <TabsContent value="refactored" className="h-[calc(100%-40px)] overflow-hidden">
            <CodeDisplay code={refactoredCode} language={language} />
          </TabsContent>
        </Tabs>
      )}
      
      {viewMode === 'unified' && (
        <div className="flex flex-col gap-4 h-full overflow-auto">
          <div className="flex-1 min-h-0">
            <h4 className="text-squadrun-gray mb-2 text-sm font-medium flex items-center">
              <MousePointerClick className="h-4 w-4 mr-1 text-squadrun-primary" />
              Original Code
            </h4>
            <div className="h-[calc(100%-26px)] overflow-hidden">
              <CodeDisplay code={originalCode} language={language} />
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <h4 className="text-squadrun-gray mb-2 text-sm font-medium flex items-center">
              <MousePointerClick className="h-4 w-4 mr-1 text-squadrun-primary" />
              Refactored Code
            </h4>
            <div className="h-[calc(100%-26px)] overflow-hidden">
              <CodeDisplay code={refactoredCode} language={language} />
            </div>
          </div>
        </div>
      )}
      
      {viewMode === 'sideBySide' && (
        <div className="grid grid-cols-2 gap-4 h-full overflow-hidden">
          <div className="h-full overflow-hidden">
            <h4 className="text-squadrun-gray mb-2 text-sm font-medium">Original Code</h4>
            <div className="h-[calc(100%-26px)]">
              <CodeDisplay code={originalCode} language={language} />
            </div>
          </div>
          <div className="h-full overflow-hidden">
            <h4 className="text-squadrun-gray mb-2 text-sm font-medium">Refactored Code</h4>
            <div className="h-[calc(100%-26px)]">
              <CodeDisplay code={refactoredCode} language={language} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeComparison;
