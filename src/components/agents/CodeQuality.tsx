"use client";

import { useEffect, useState } from "react";
import { CodeQualityScore } from "@/components/visualizers/code-quality-score";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { analyzeCodeWithAI } from "@/lib/codeAnalysis"; // Updated import

interface Props {
  originalCode: string;
  language: string;
}

export const CodeQuality = ({ originalCode, language }: Props) => {
  const [score, setScore] = useState<number | null>(null);
  const [categoryScores, setCategoryScores] = useState<
    { name: string; score: number }[]
  >([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [problemSnippets, setProblemSnippets] = useState<
    { description: string; code: string; line: number }[]
  >([]);
  const [summary, setSummary] = useState<string>("");

  useEffect(() => {
    const runQualityAnalysis = async () => {
      try {
        const result = await analyzeCodeWithAI(originalCode, language, "quality"); // Updated usage
        setScore(result.overall_score);
        setCategoryScores(result.category_scores);
        setRecommendations(result.recommendations);
        setProblemSnippets(result.problem_snippets);
        setSummary(result.summary);
      } catch (error: any) {
        toast.error("Code quality analysis failed", {
          description: error.message,
        });
      }
    };

    runQualityAnalysis();
  }, [originalCode, language]);

  if (score === null) return null;

  return (
    <div className="flex flex-col gap-6">
      <CodeQualityScore score={score} />
      <ScrollArea className="h-[500px] pr-4">
        <div className="grid gap-3">
          <div>
            <h3 className="font-semibold text-lg mb-1">Category Scores</h3>
            <div className="flex flex-wrap gap-2">
              {categoryScores.map((cat) => (
                <Badge key={cat.name} variant="outline">
                  {cat.name}: {cat.score}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-1">Summary</h3>
            <p className="text-muted-foreground text-sm whitespace-pre-wrap">
              {summary}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-1">Recommendations</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-1">Problem Snippets</h3>
            <div className="flex flex-col gap-4">
              {problemSnippets.map((prob, i) => (
                <div key={i} className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground mb-2">
                    Line {prob.line}: {prob.description}
                  </p>
                  <pre className="bg-muted/30 text-xs rounded p-2 overflow-x-auto">
                    {prob.code}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
