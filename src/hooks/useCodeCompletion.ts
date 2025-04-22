
import { useState } from 'react';
import { getCodeCompletion } from '@/utils/aiUtils/openAiUtils';
import { toast } from 'sonner';

export const useCodeCompletion = (language: string = 'typescript') => {
  const [isLoading, setIsLoading] = useState(false);
  const [completion, setCompletion] = useState<string | null>(null);

  const complete = async (prompt: string) => {
    setIsLoading(true);
    try {
      const result = await getCodeCompletion(prompt, language);
      setCompletion(result);
      return result;
    } catch (error) {
      toast.error("Failed to get code completion", {
        description: error instanceof Error ? error.message : "An error occurred"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    complete,
    isLoading,
    completion,
    clearCompletion: () => setCompletion(null)
  };
};
