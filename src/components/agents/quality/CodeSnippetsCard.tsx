
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  return (
    <Card className="border border-squadrun-primary/20 bg-squadrun-darker/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Code Snippets</CardTitle>
      </CardHeader>
      <CardContent className="max-h-[300px] overflow-auto space-y-4">
        {snippets.map((snippet, index) => (
          <div key={index}>
            <h3 className="text-sm font-medium text-white mb-2">{snippet.title}</h3>
            <div className="mb-2 text-xs">
              <CodeDisplay code={snippet.code} language={language} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default CodeSnippetsCard;
