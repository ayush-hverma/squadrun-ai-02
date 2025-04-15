
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ImprovementsListProps {
  improvements: string[];
}

const ImprovementsList = ({ improvements }: ImprovementsListProps) => {
  if (!improvements || improvements.length === 0) {
    return (
      <Card className="border border-squadrun-primary/20 bg-squadrun-darker/50 h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Applied Improvements</CardTitle>
        </CardHeader>
        <CardContent className="h-[calc(100%-60px)] overflow-auto">
          <p className="text-squadrun-gray">No improvements detected.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-squadrun-primary/20 bg-squadrun-darker/50 h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Applied Improvements</CardTitle>
      </CardHeader>
      <CardContent className="h-[calc(100%-60px)] overflow-auto">
        <ul className="list-disc pl-6 space-y-2">
          {improvements.map((improvement, index) => (
            <li key={index} className="text-white">{improvement}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default ImprovementsList;
