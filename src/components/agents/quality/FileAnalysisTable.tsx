import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { QualityResults } from "@/types/codeQuality";
import { FileEntry } from "../hooks/useRepoFileSelector";
import { cn } from "@/lib/utils";

interface FileAnalysisTableProps {
  files: FileEntry[];
  fileResults: QualityResults[];
  selectedFileIndex: number | null;
  onFileSelect: (index: number) => void;
  onReset: () => void;
}

export default function FileAnalysisTable({
  files,
  fileResults,
  selectedFileIndex,
  onFileSelect,
  onReset
}: FileAnalysisTableProps) {
  return (
    <div className="space-y-4">
      <Table className="bg-squadrun-darker/50 border border-squadrun-primary/20">
        <TableHeader>
          <TableRow>
            <TableHead className="text-squadrun-primary">Filename</TableHead>
            <TableHead className="text-squadrun-primary">Overall Score</TableHead>
            <TableHead className="text-squadrun-primary">Readability</TableHead>
            <TableHead className="text-squadrun-primary">Maintainability</TableHead>
            <TableHead className="text-squadrun-primary">Performance</TableHead>
            <TableHead className="text-squadrun-primary">Security</TableHead>
            <TableHead className="text-squadrun-primary">Code Smell</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file, index) => (
            <TableRow 
              key={file.path}
              className={cn(
                "cursor-pointer hover:bg-squadrun-primary/10 transition-colors",
                selectedFileIndex === index && "bg-squadrun-primary/20"
              )}
              onClick={() => onFileSelect(index)}
            >
              <TableCell className="font-medium text-white">{file.path}</TableCell>
              <TableCell className="text-white">{fileResults[index]?.score || 0}</TableCell>
              <TableCell className="text-white">{fileResults[index]?.readabilityScore || 0}</TableCell>
              <TableCell className="text-white">{fileResults[index]?.maintainabilityScore || 0}</TableCell>
              <TableCell className="text-white">{fileResults[index]?.performanceScore || 0}</TableCell>
              <TableCell className="text-white">{fileResults[index]?.securityScore || 0}</TableCell>
              <TableCell className="text-white">{fileResults[index]?.codeSmellScore || 0}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {selectedFileIndex !== null && (
        <div className="flex justify-center">
          <Button 
            onClick={onReset}
            variant="outline"
            className="text-squadrun-primary border-squadrun-primary hover:bg-squadrun-primary/10"
          >
            Reset to Overall Metrics
          </Button>
        </div>
      )}
    </div>
  );
} 