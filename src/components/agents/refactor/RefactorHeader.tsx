
interface RefactorHeaderProps {
  qualityScore: number | null;
  improvementCount: number;
}

const RefactorHeader = ({ qualityScore, improvementCount }: RefactorHeaderProps) => {
  return (
    <div className="mb-4 flex items-center">
      {qualityScore && (
        <div className="mr-auto bg-squadrun-primary/20 rounded-full px-4 py-1 text-white">
          Quality Score: <span className="font-bold">{qualityScore}/100</span>
          <span className="ml-2 text-sm">({improvementCount} improvements)</span>
        </div>
      )}
    </div>
  );
};

export default RefactorHeader;
