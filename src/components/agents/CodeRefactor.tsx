
import { useEffect, useState } from "react";
import { useCodeRefactor } from "@/hooks/useCodeRefactor";
import { PreRefactorView } from "./refactor/PreRefactorView";
import { PostRefactorView } from "./refactor/PostRefactorView";
import CodeDisplay from "@/components/CodeDisplay";
import ModelPicker from "@/components/ModelPicker";
import FileUploadButton from "@/components/FileUploadButton";

interface CodeRefactorProps {
  fileContent: string | null;
  fileName: string | null;
  onFileUpload: (file: File) => void;
}

export default function CodeRefactor({ fileContent, fileName, onFileUpload }: CodeRefactorProps) {
  const [language, setLanguage] = useState<string>('js');
  const [model, setModel] = useState<"gemini" | "openai" | "groq">("openai");
  const { refactoredCode, isRefactoring, handleRefactor, clearRefactoredCode } = useCodeRefactor();

  useEffect(() => {
    if (fileName) {
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
      setLanguage(fileExtension);
    }
  }, [fileContent, fileName]);

  const handleDownload = () => {
    if (!refactoredCode || !fileName) return;
    
    const element = document.createElement("a");
    const file = new Blob([refactoredCode], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    
    const fileNameParts = fileName.split(".");
    const extension = fileNameParts.pop();
    const newFileName = fileNameParts.join(".") + "-refactored." + extension;
    
    element.download = newFileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (!fileContent) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
        <h2 className="text-xl font-bold text-white">Code Refactoring</h2>
        <p className="text-squadrun-gray text-center mb-4">
          Upload a code file to start refactoring
        </p>
        <FileUploadButton onFileUpload={onFileUpload} />
      </div>
    );
  }

  return (
    <div className="p-4 h-full flex flex-col gap-4">
      <div className="mb-3 flex items-center">
        <span className="text-squadrun-gray mr-2 text-sm">Model:</span>
        <ModelPicker value={model} onChange={setModel} />
      </div>
      
      {!refactoredCode ? (
        <PreRefactorView 
          onRefactor={() => handleRefactor(fileContent, language)}
          isRefactoring={isRefactoring}
        />
      ) : (
        <PostRefactorView 
          originalCode={fileContent}
          refactoredCode={refactoredCode}
          language={language}
          onDownload={handleDownload}
          onClear={clearRefactoredCode}
        />
      )}
    </div>
  );
}
