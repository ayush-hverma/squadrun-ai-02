
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CodeDisplay from "@/components/CodeDisplay";

interface OriginalCodeProps {
  fileContent: string;
  fileName: string | null;
}

export default function OriginalCode({ fileContent, fileName }: OriginalCodeProps) {
  return (
    <Card className="border border-squadrun-primary/20 bg-squadrun-darker/50 h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Original Code</CardTitle>
      </CardHeader>
      <CardContent className="h-[calc(100%-60px)] overflow-auto">
        <CodeDisplay code={fileContent} language={fileName?.split('.').pop() || 'python'} />
      </CardContent>
    </Card>
  );
}
