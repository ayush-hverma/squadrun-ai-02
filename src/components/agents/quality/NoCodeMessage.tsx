
import { Card, CardContent } from "@/components/ui/card";

/**
 * Component displayed when no code has been uploaded
 */
const NoCodeMessage = () => {
  return (
    <div className="flex h-full items-center justify-center">
      <Card className="w-96 bg-squadrun-darker/50 border border-squadrun-primary/20">
        <CardContent className="p-6 text-center">
          <p className="text-squadrun-gray">
            Please upload a code file to assess quality
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default NoCodeMessage;
