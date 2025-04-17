
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import CodeDisplay from "@/components/CodeDisplay";
import { CodeSnippet } from "@/types/codeQuality";

interface CodeSnippetsCardProps {
  snippets: CodeSnippet[];
  language: string;
}

/**
 * Component displaying code snippets with improvement suggestions
 */
const CodeSnippetsCard = ({ snippets, language }: CodeSnippetsCardProps) => {
  const [openItems, setOpenItems] = useState<Record<number, boolean>>(
    snippets.reduce((acc, _, index) => ({ ...acc, [index]: true }), {})
  );

  const toggleItem = (index: number) => {
    setOpenItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <Card className="border border-squadrun-primary/20 bg-squadrun-darker/50 shadow-lg hover:shadow-squadrun-primary/10 transition-all duration-300">
      <CardHeader className="pb-2 bg-squadrun-darker/80">
        <CardTitle className="text-lg text-squadrun-primary">Code Snippets</CardTitle>
      </CardHeader>
      <CardContent className="max-h-[300px] overflow-auto space-y-4 custom-scrollbar">
        {snippets.map((snippet, index) => (
          <div key={index} className="border border-squadrun-primary/10 rounded-md overflow-hidden bg-squadrun-dark/50 transition-all duration-300 hover:border-squadrun-primary/30">
            <Collapsible open={openItems[index]} onOpenChange={() => toggleItem(index)}>
              <CollapsibleTrigger className="w-full flex justify-between items-center p-3 hover:bg-squadrun-primary/10 transition-colors duration-200">
                <h3 className="text-sm font-medium text-squadrun-light">{snippet.title}</h3>
                {openItems[index] ? 
                  <ChevronUp className="h-4 w-4 text-squadrun-primary" /> : 
                  <ChevronDown className="h-4 w-4 text-squadrun-primary" />
                }
              </CollapsibleTrigger>
              <CollapsibleContent className="p-3 border-t border-squadrun-primary/10 animate-accordion-down">
                <div className="text-xs">
                  <p className="text-squadrun-gray mb-1">Original:</p>
                  <div className="rounded-md overflow-hidden transition-all duration-300 hover:shadow-md">
                    <CodeDisplay code={snippet.code} language={language} />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default CodeSnippetsCard;
