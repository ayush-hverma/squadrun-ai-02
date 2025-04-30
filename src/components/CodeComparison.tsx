import React from 'react';
import CodeDisplay from '@/components/CodeDisplay';
import { CompletionResult } from '@/hooks/useCodeCompletion';
import { BookOpen, Code2, Zap, Shield, AlertTriangle } from 'lucide-react';
interface CodeComparisonProps {
  originalCode: string;
  refactoredCode: string | CompletionResult;
  language: string;
}
const CodeComparison = ({
  originalCode,
  refactoredCode,
  language
}: CodeComparisonProps) => {
  // Handle both string and CompletionResult types
  const refactoredCodeString = typeof refactoredCode === 'string' ? refactoredCode : refactoredCode.code;
  const metrics = typeof refactoredCode === 'object' && refactoredCode.metrics ? refactoredCode.metrics : null;
  const improvements = typeof refactoredCode === 'object' && refactoredCode.improvements ? refactoredCode.improvements : null;
  return <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 bg-squadrun-darker p-3 rounded-md">
        <div className="flex items-center">
          <h3 className="text-white font-medium">Code Comparison</h3>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 h-full">
        <div className="h-full flex flex-col">
          <h4 className="text-squadrun-gray mb-2 text-sm font-medium">Original Code</h4>
          <div className="flex-1 overflow-hidden">
            <CodeDisplay code={originalCode} language={language} />
          </div>
        </div>
        
        <div className="h-full flex flex-col">
          <h4 className="text-squadrun-gray mb-2 text-sm font-medium">Refactored Code</h4>
          
          {metrics}
          
          {improvements && improvements.length > 0 && <div className="mb-3 bg-squadrun-darker/30 p-2 rounded-md">
              <div className="text-xs text-squadrun-gray mb-1">Improvement Suggestions:</div>
              <ul className="text-xs list-disc list-inside">
                {improvements.map((improvement, index) => <li key={index} className="text-squadrun-gray">{improvement}</li>)}
              </ul>
            </div>}
          
          <div className="flex-1 overflow-hidden">
            <CodeDisplay code={refactoredCodeString} language={language} />
          </div>
        </div>
      </div>
    </div>;
};
export default CodeComparison;