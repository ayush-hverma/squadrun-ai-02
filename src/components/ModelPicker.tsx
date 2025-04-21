
import React from "react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Gemini, Openai, Groq } from "lucide-react";

type ModelOption = "gemini" | "openai" | "groq";

const MODEL_OPTIONS: { label: string; value: ModelOption; icon: React.ReactNode }[] = [
  {
    label: "Gemini",
    value: "gemini",
    icon: <Gemini className="mr-2 h-5 w-5 text-blue-400" />,
  },
  {
    label: "OpenAI",
    value: "openai",
    icon: <Openai className="mr-2 h-5 w-5 text-green-500" />,
  },
  {
    label: "Groq",
    value: "groq",
    icon: <Groq className="mr-2 h-5 w-5 text-orange-400" />,
  },
];

interface ModelPickerProps {
  value: ModelOption;
  onChange: (value: ModelOption) => void;
  className?: string;
}

export default function ModelPicker({ value, onChange, className = "" }: ModelPickerProps) {
  const selected = MODEL_OPTIONS.find((m) => m.value === value);
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className}>
        {selected?.icon}
        <SelectValue>
          <span className="ml-1">{selected?.label}</span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {MODEL_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <div className="flex items-center">
              {option.icon}
              <span>{option.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
