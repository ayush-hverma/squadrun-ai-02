
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideThumbsDown, LucideThumbsUp, AlertTriangle, AlertCircle, BadgeCheck } from "lucide-react";

interface QualityScoreCardProps {
  score: number;
  summary: string;
}

/**
 * Card displaying the overall quality score with color coding and icons
 */
const QualityScoreCard = ({ score, summary }: QualityScoreCardProps) => {
  // Determine color based on score without predefined thresholds
  const getScoreColor = () => {
    if (score >= 90) return "border-green-500";
    if (score >= 75) return "border-blue-500";
    if (score >= 60) return "border-yellow-500";
    if (score >= 40) return "border-orange-500";
    return "border-red-500";
  };

  // Determine text color based on score
  const getTextColor = () => {
    if (score >= 90) return "text-green-500";
    if (score >= 75) return "text-blue-500";
    if (score >= 60) return "text-yellow-500";
    if (score >= 40) return "text-orange-500";
    return "text-red-500";
  };

  // Get appropriate icon based on score without predefined thresholds
  const getScoreIcon = () => {
    if (score >= 90) return <BadgeCheck className="h-8 w-8 text-green-500" />;
    if (score >= 75) return <LucideThumbsUp className="h-8 w-8 text-blue-500" />;
    if (score >= 60) return <AlertTriangle className="h-8 w-8 text-yellow-500" />;
    if (score >= 40) return <AlertCircle className="h-8 w-8 text-orange-500" />;
    return <LucideThumbsDown className="h-8 w-8 text-red-500" />;
  };

  // Get score label based on score
  const getScoreLabel = () => {
    if (score >= 90) return "Excellent";
    if (score >= 75) return "Good";
    if (score >= 60) return "Moderate";
    if (score >= 40) return "Needs Work";
    if (score >= 20) return "Poor";
    return "Critical";
  };

  return (
    <Card className="border border-squadrun-primary/20 bg-squadrun-darker/50 col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          Overall Score
          {getScoreIcon()}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center pt-4">
        <div className={`w-32 h-32 rounded-full border-8 ${getScoreColor()} flex flex-col items-center justify-center mb-4`}>
          <span className={`text-4xl font-bold ${getTextColor()}`}>{score}</span>
          <span className={`text-xs font-medium ${getTextColor()}`}>{getScoreLabel()}</span>
        </div>
        <p className="text-sm text-center text-squadrun-gray">
          {summary}
        </p>
      </CardContent>
    </Card>
  );
};

export default QualityScoreCard;
