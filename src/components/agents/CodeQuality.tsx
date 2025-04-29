import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cpu, Search } from "lucide-react";
import CodeDisplay from "../CodeDisplay";
import { toast } from "sonner";
// Import the analyzeCodeWithAI function from your AI utilities
import { analyzeCodeWithAI } from "@/utils/aiUtils/codeAnalysis"; // Assuming this is the correct path
import { QualityResults } from "@/types/codeQuality"; // Assuming this type matches the AI response structure
// Removing the import for the local analyzer as we'll use the AI one
// import { analyzeCodeQuality } from "@/utils/qualityUtils/codeAnalyzer";
import NoCodeMessage from "./quality/NoCodeMessage";
import AnalysisView from "./quality/AnalysisView";
import { Button } from "@/components/ui/button";

interface CodeQualityProps {
  fileContent: string | null;
  fileName: string | null;
}

export default function CodeQuality({ fileContent, fileName }: CodeQualityProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [qualityResults, setQualityResults] = useState<QualityResults | null>(null);

  const handleAssessQuality = async () => {
    // Prevent analysis if no file content is available or if already processing
    if (!fileContent || isProcessing) return;

    setIsProcessing(true);
    setQualityResults(null); // Clear previous results

    try {
      // Determine language based on file extension, default to 'javascript'
      const language = fileName?.split('.').pop() || 'javascript';

      // Call the AI analysis function
      // We specify 'quality' as the analysis type
      const results: QualityResults = await analyzeCodeWithAI(fileContent, language, 'quality');

      // Display success toast with the overall score
      if (fileName?.endsWith('.ipynb')) {
        toast.success("Jupyter Notebook Analysis Complete", {
          description: `Overall Score: ${results.overall_score}/100`, // Use overall_score from the JSON structure
        });
      } else {
        toast.success("Analysis Complete", {
          description: `Overall Score: ${results.overall_score}/100`, // Use overall_score
        });
      }

      // Set the quality results state to display the analysis
      setQualityResults(results);

    } catch (error) {
      console.error("AI Analysis error:", error);
      // Display error toast
      toast.error("Error Assessing Code Quality", {
        description: error instanceof Error ? error.message : "An unexpected error occurred during analysis.",
      });
    } finally {
      // Always set processing to false after the operation completes
      setIsProcessing(false);
    }
  };

  // Function to clear the analysis results
  const handleClear = () => {
    setQualityResults(null);
    toast.success("Analysis Cleared", {
      description: "You can now upload a new file.",
    });
  };

  // Display a message if no file content is loaded
  if (!fileContent) {
    return <NoCodeMessage />;
  }

  // Render the component UI
  return (
    <div className="p-4 h-full flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white mb-2">Code Quality Assessment</h1>
        <p className="text-squadrun-gray">
          Analyzing your code for readability, maintainability, performance, security and code smell.
          {fileName?.endsWith('.ipynb') && " Jupyter Notebooks are fully supported."}
        </p>
      </div>

      {/* Conditional rendering based on whether quality results are available */}
      {!qualityResults ? (
        // Display the "Assess Quality" button and loading indicator if no results yet
        <div className="flex-1 flex flex-col items-center justify-center">
          <Button
            onClick={handleAssessQuality}
            disabled={isProcessing} // Disable button while processing
            className="bg-squadrun-primary hover:bg-squadrun-vivid text-white"
          >
            <Search className="mr-2 h-4 w-4" />
            {isProcessing ? 'Analyzing...' : 'Assess Quality'} {/* Button text changes while processing */}
          </Button>
          {isProcessing && (
            // Display loading animation and text while processing
            <div className="mt-4 flex flex-col items-center">
              <div className="animate-spin mb-4">
                <Cpu className="h-16 w-16 text-squadrun-primary" />
              </div>
              <h2 className="text-xl font-medium text-white mb-2">
                {fileName?.endsWith('.ipynb') ? "Analyzing Notebook Quality" : "Analyzing Code Quality"}
              </h2>
              <p className="text-squadrun-gray text-center max-w-md">
                We're examining your {fileName?.endsWith('.ipynb') ? "notebook" : "code"} for quality metrics including
                readability, maintainability, performance, security, and code smell.
              </p>
            </div>
          )}
        </div>
      ) : (
        // Display the analysis results and the "Clear Analysis" button
        <div className="flex-1 flex flex-col">
          {/* Pass the quality results and file name to the AnalysisView component */}
          <AnalysisView qualityResults={qualityResults} fileName={fileName} />
          <div className="mt-4 flex justify-center">
            <Button
              onClick={handleClear}
              variant="destructive"
              className="w-full max-w-md"
            >
              Clear Analysis
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
