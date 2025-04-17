
import React from 'react';
import CodeDisplay from '@/components/CodeDisplay';

interface CodeComparisonProps {
  originalCode: string;
  refactoredCode: string;
  language: string;
}

const CodeComparison = ({ originalCode, refactoredCode, language }: CodeComparisonProps) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 bg-squadrun-darker p-3 rounded-md">
        <div className="flex items-center">
          <h3 className="text-white font-medium">Code Comparison</h3>
        </div>
      </div>
      
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
    </div>
  );
};

export default CodeComparison;
