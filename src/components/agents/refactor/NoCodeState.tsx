
import { Card, CardContent } from "@/components/ui/card";

const NoCodeState = () => {
  return (
    <div className="flex h-full items-center justify-center">
      <Card className="w-96 bg-squadrun-darker/50 border border-squadrun-primary/20">
        <CardContent className="p-6 text-center">
          <p className="text-squadrun-gray">
            Please upload a code file to start refactoring
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default NoCodeState;
