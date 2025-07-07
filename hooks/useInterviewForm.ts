// hooks/useInterviewForm.ts 
import { useState, useCallback, useEffect } from "react";
import type { FormData, OpenAISettings, CostInfo } from "@/types/interview";
import { MODEL_COSTS } from "@/types/interview";

interface UseInterviewFormProps {
  onSubmit: (
    data: FormData & { jobDescription?: string; openAISettings: OpenAISettings }
  ) => void;
}

export function useInterviewForm({ onSubmit }: UseInterviewFormProps) {
  // Basic form state
  const [formData, setFormData] = useState<FormData>({
    jobRole: "",
    interviewType: "technical",
    difficulty: 5,
  });

  const [jobDescription, setJobDescription] = useState("");

  // OpenAI settings state
  const [openAISettings, setOpenAISettings] = useState<OpenAISettings>({
    temperature: 0.7,
    maxTokens: 1000,
    topP: 0.9,
    frequencyPenalty: 0.3,
    presencePenalty: 0.0,
    model: "gpt-4-turbo",
  });

  // UI state
  const [question, setQuestion] = useState("");
  const [error, setError] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [costInfo, setCostInfo] = useState<CostInfo | null>(null);

  // Calculate estimated cost
  const calculateEstimatedCost = useCallback(
    (settings: OpenAISettings): CostInfo => {
      const modelCost = MODEL_COSTS[settings.model as keyof typeof MODEL_COSTS];

      if (!modelCost) {
        // Fallback for unknown models
        return {
          estimatedTokens: 1000,
          estimatedCost: 0.01,
        };
      }

      const estimatedInputTokens = 200; // Rough estimate for prompt
      const estimatedOutputTokens = Math.min(settings.maxTokens, 800);

      const inputCost = (estimatedInputTokens / 1000) * modelCost.input;
      const outputCost = (estimatedOutputTokens / 1000) * modelCost.output;

      return {
        estimatedTokens: estimatedInputTokens + estimatedOutputTokens,
        estimatedCost: inputCost + outputCost,
      };
    },
    []
  );

  // Update OpenAI setting and recalculate cost
  const updateSetting = useCallback(
    (key: keyof OpenAISettings, value: number | string) => {
      const newSettings = { ...openAISettings, [key]: value };
      setOpenAISettings(newSettings);
      setCostInfo(calculateEstimatedCost(newSettings));
    },
    [openAISettings, calculateEstimatedCost]
  );

  // Update form data
  const updateFormData = useCallback((updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!formData.jobRole.trim()) {
        setError("Please enter a job role");
        return;
      }

      setError(""); // Clear any previous errors

      onSubmit({
        ...formData,
        jobDescription: jobDescription.trim() || undefined,
        openAISettings,
      });
    },
    [formData, jobDescription, openAISettings, onSubmit]
  );

  // Update question from parent component
  const updateQuestion = useCallback((newQuestion: string) => {
    setQuestion(newQuestion);
  }, []);

  // Update error from parent component
  const updateError = useCallback((newError: string) => {
    setError(newError);
  }, []);

  // Update actual cost after API call
  const updateActualCost = useCallback(
    (actualTokens: number, actualCost: number) => {
      setCostInfo((prev) =>
        prev
          ? {
              ...prev,
              actualTokens,
              actualCost,
            }
          : null
      );
    },
    []
  );

  // Initialize cost calculation
  useEffect(() => {
    setCostInfo(calculateEstimatedCost(openAISettings));
  }, []); // Only run once on mount

  // Recalculate cost when settings change
  useEffect(() => {
    setCostInfo(calculateEstimatedCost(openAISettings));
  }, [openAISettings, calculateEstimatedCost]);

  return {
    // State
    formData,
    jobDescription,
    openAISettings,
    question,
    error,
    costInfo,
    showAdvanced,

    // Form data setters
    setFormData: updateFormData,
    setJobDescription,

    // OpenAI settings
    updateSetting,

    // UI state
    setShowAdvanced,

    // Handlers
    handleSubmit,

    // External updates (for parent component)
    updateQuestion,
    updateError,
    updateActualCost,

    // Computed values
    isFormValid: formData.jobRole.trim().length > 0,
  };
}
