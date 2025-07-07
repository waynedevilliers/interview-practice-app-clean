import React, { useState, useCallback } from "react";
import { useInterview } from "@/hooks/useInterview";
import type {
  InterviewFormData,
  CostInfo,
  LLMSettings,
} from "@/types/interview";

const MODEL_COSTS = {
  // OpenAI Models
  "gpt-4": { input: 0.03, output: 0.06 },
  "gpt-4-turbo": { input: 0.01, output: 0.03 },
  "gpt-4o-mini": { input: 0.00015, output: 0.0006 },
  "gpt-3.5-turbo": { input: 0.0015, output: 0.002 },
  // Claude Models
  "claude-3-5-sonnet-20241022": { input: 0.003, output: 0.015 },
  "claude-3-haiku-20240307": { input: 0.00025, output: 0.00125 },
  "claude-3-opus-20240229": { input: 0.015, output: 0.075 },
};

const LLM_MODELS = {
  openai: [
    { value: "gpt-4o-mini", label: "GPT-4o Mini (Recommended)" },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
    { value: "gpt-4", label: "GPT-4 (Premium)" },
    { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo (Fast)" },
  ],
  claude: [
    {
      value: "claude-3-5-sonnet-20241022",
      label: "Claude 3.5 Sonnet (Recommended)",
    },
    { value: "claude-3-haiku-20240307", label: "Claude 3 Haiku (Fast)" },
    { value: "claude-3-opus-20240229", label: "Claude 3 Opus (Premium)" },
  ],
};

export function useQuestionGenerator() {
  // Use existing interview hook for core functionality
  const {
    currentQuestion,
    userAnswer,
    evaluation,
    isLoading,
    isEvaluating,
    error,
    handleGenerateQuestion,
    handleSubmitAnswer,
    startNewQuestion,
    setUserAnswer,
  } = useInterview();

  // Enhanced form state with LLM support
  const [formData, setFormData] = useState<InterviewFormData>({
    jobRole: "",
    interviewType: "technical",
    difficulty: 5,
  });

  const [jobDescription, setJobDescription] = useState<string>("");

  const [llmSettings, setLlmSettings] = useState<LLMSettings>({
    provider: "openai",
    temperature: 0.7,
    maxTokens: 1000,
    topP: 0.9,
    frequencyPenalty: 0.3,
    presencePenalty: 0.0,
    model: "gpt-4o-mini",
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [costInfo, setCostInfo] = useState<CostInfo | null>(null);

  // Calculate estimated cost
  const calculateEstimatedCost = useCallback(
    (settings: LLMSettings): CostInfo => {
      const modelCost = MODEL_COSTS[settings.model as keyof typeof MODEL_COSTS];
      if (!modelCost) {
        return { estimatedTokens: 0, estimatedCost: 0 };
      }

      const estimatedInputTokens = 200;
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

  // Update LLM setting
  const updateSetting = useCallback(
    (key: keyof LLMSettings, value: number | string) => {
      const newSettings = { ...llmSettings, [key]: value };

      // Auto-switch model when provider changes
      if (key === "provider") {
        const provider = value as "openai" | "claude";
        newSettings.model = LLM_MODELS[provider][0].value;
      }

      setLlmSettings(newSettings);
      setCostInfo(calculateEstimatedCost(newSettings));
    },
    [llmSettings, calculateEstimatedCost]
  );

  // Enhanced form submission
  const handleEnhancedSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.jobRole.trim()) return;

      const enhancedFormData: InterviewFormData = {
        ...formData,
        jobDescription: jobDescription.trim() || undefined,
        llmSettings, // Changed from openAISettings to llmSettings
      };

      handleGenerateQuestion(enhancedFormData);
    },
    [formData, jobDescription, llmSettings, handleGenerateQuestion]
  );

  // Update cost info when question is generated
  React.useEffect(() => {
    if (currentQuestion?.usage) {
      const modelCost =
        MODEL_COSTS[llmSettings.model as keyof typeof MODEL_COSTS];
      if (modelCost) {
        // Handle both OpenAI and Claude usage formats
        const inputTokens =
          currentQuestion.usage.prompt_tokens ||
          currentQuestion.usage.input_tokens ||
          0;
        const outputTokens =
          currentQuestion.usage.completion_tokens ||
          currentQuestion.usage.output_tokens ||
          0;

        const actualCost =
          (inputTokens / 1000) * modelCost.input +
          (outputTokens / 1000) * modelCost.output;

        setCostInfo((prev) =>
          prev
            ? {
                ...prev,
                actualTokens: currentQuestion.usage.total_tokens,
                actualCost,
              }
            : null
        );
      }
    }
  }, [currentQuestion, llmSettings.model]);

  // Initialize cost calculation
  React.useEffect(() => {
    setCostInfo(calculateEstimatedCost(llmSettings));
  }, [calculateEstimatedCost, llmSettings]);

  // Memoized handlers
  const onSubmitAnswer = useCallback(() => {
    if (currentQuestion?.question && currentQuestion.metadata) {
      const formDataForEval: InterviewFormData = {
        jobRole: currentQuestion.metadata.jobRole,
        interviewType: currentQuestion.metadata.interviewType as any,
        difficulty: currentQuestion.metadata.difficulty,
      };
      handleSubmitAnswer(currentQuestion.question, userAnswer, formDataForEval);
    }
  }, [currentQuestion, userAnswer, handleSubmitAnswer]);

  const onGenerateAnother = useCallback(() => {
    handleEnhancedSubmit(new Event("submit") as any);
  }, [handleEnhancedSubmit]);

  const onCopyQuestion = useCallback(() => {
    if (currentQuestion?.question) {
      navigator.clipboard.writeText(currentQuestion.question);
    }
  }, [currentQuestion]);

  const onCopyFeedback = useCallback(() => {
    if (evaluation?.rawFeedback) {
      navigator.clipboard.writeText(evaluation.rawFeedback);
    }
  }, [evaluation]);

  return {
    // Form state
    formData,
    jobDescription,
    llmSettings,
    showAdvanced,
    costInfo,

    // Question & answer state
    currentQuestion,
    userAnswer,
    evaluation,

    // Loading states
    isLoading,
    isEvaluating,
    error,

    // Form handlers
    setFormData,
    setJobDescription,
    updateSetting,
    setShowAdvanced,
    setUserAnswer,

    // Action handlers
    handleEnhancedSubmit,
    onSubmitAnswer,
    onGenerateAnother,
    startNewQuestion,
    onCopyQuestion,
    onCopyFeedback,
  };
}
