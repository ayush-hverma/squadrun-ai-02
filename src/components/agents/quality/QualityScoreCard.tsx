
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface QualityScoreCardProps {
  score: number;
  summary: string;
}

/**
 * Card displaying the overall quality score
 */
const QualityScoreCard = ({ score, summary }: QualityScoreCardProps) => {
  return (
    <Card className="border border-squadrun-primary/20 bg-squadrun-darker/50 col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Overall Score</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center pt-4">
        <div className="w-32 h-32 rounded-full border-8 border-squadrun-primary flex items-center justify-center mb-4">
          <span className="text-4xl font-bold text-white">{score}</span>
        </div>
        <p className="text-sm text-center text-squadrun-gray">
          {summary}
        </p>
      </CardContent>
    </Card>
  );
};

export default QualityScoreCard;
