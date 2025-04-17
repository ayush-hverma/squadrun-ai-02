
import { QualityResults } from "@/types/codeQuality";
import QualityScoreCard from "./QualityScoreCard";
import CategoryBreakdown from "./CategoryBreakdown";
import RecommendationsCard from "./RecommendationsCard";
import CodeSnippetsCard from "./CodeSnippetsCard";

interface AnalysisViewProps {
  qualityResults: QualityResults;
  fileName: string | null;
}

/**
 * Component displaying the complete code quality analysis results
 */
const AnalysisView = ({ qualityResults, fileName }: AnalysisViewProps) => {
  const language = fileName?.split('.').pop() || 'javascript';

  return (
    <div className="flex-1 flex flex-col gap-4 overflow-auto">
      <div className="grid grid-cols-5 gap-4">
        <QualityScoreCard score={qualityResults.score} summary={qualityResults.summary} />
        <CategoryBreakdown categories={qualityResults.categories} />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <RecommendationsCard recommendations={qualityResults.recommendations} />
        <CodeSnippetsCard snippets={qualityResults.snippets} language={language} />
      </div>
    </div>
  );
};

export default AnalysisView;

