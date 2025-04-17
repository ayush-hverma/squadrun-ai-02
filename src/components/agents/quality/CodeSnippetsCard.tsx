
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CodeDisplay from "@/components/CodeDisplay";
import { CodeSnippet } from "@/types/codeQuality";
import { useState } from "react";
import { ChevronDown, Code } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface CodeSnippetsCardProps {
  snippets: CodeSnippet[];
  language: string;
}

/**
 * Component displaying code snippets with improvement suggestions
 */
const CodeSnippetsCard = ({ snippets, language }: CodeSnippetsCardProps) => {
  const [openSnippets, setOpenSnippets] = useState<Record<number, boolean>>({});

  const toggleSnippet = (index: number) => {
    setOpenSnippets(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <Card className="border border-squadrun-primary/20 bg-squadrun-darker/50 transition-all duration-300 hover:shadow-md hover:shadow-squadrun-primary/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Code className="h-5 w-5 text-squadrun-primary" />
          <span>Code Snippets</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="max-h-[300px] overflow-auto space-y-4 scrollbar-thin scrollbar-thumb-squadrun-primary/20 scrollbar-track-transparent pr-2">
        {snippets.length === 0 ? (
          <p className="text-squadrun-gray text-center py-4">No code snippets to display</p>
        ) : (
          snippets.map((snippet, index) => (
            <Collapsible
              key={index}
              open={openSnippets[index]}
              onOpenChange={() => toggleSnippet(index)}
              className="bg-squadrun-darker/70 rounded-lg border border-squadrun-primary/10 overflow-hidden transition-all duration-200"
            >
              <CollapsibleTrigger className="flex justify-between items-center w-full px-4 py-2 text-sm font-medium text-white hover:bg-squadrun-primary/10 transition-colors">
                <span>{snippet.title}</span>
                <ChevronDown 
                  className={`h-4 w-4 text-squadrun-primary transition-transform duration-200 ${openSnippets[index] ? 'rotate-180' : ''}`} 
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pb-3 pt-1 text-xs animate-accordion-down">
                <div className="mb-2">
                  <p className="text-squadrun-gray mb-1">Original:</p>
                  <div className="transition-all duration-200 hover:shadow-md hover:shadow-squadrun-primary/5">
                    <CodeDisplay code={snippet.code} language={language} />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default CodeSnippetsCard;
