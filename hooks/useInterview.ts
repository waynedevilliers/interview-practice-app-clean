import { useState, useCallback } from "react";
import type {
  InterviewFormData,
  InterviewQuestionResponse,
  AnswerEvaluation,
  UseInterviewState,
} from "@/types/interview";

export function useInterview(): UseInterviewState & {
  handleGenerateQuestion: (formData: InterviewFormData) => Promise<void>;
  handleSubmitAnswer: (
    question: string,
    answer: string,
    formData: InterviewFormData
  ) => Promise<void>;
  startNewQuestion: () => void;
  setUserAnswer: (answer: string) => void;
} {
  const [currentQuestion, setCurrentQuestion] =
    useState<InterviewQuestionResponse | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [evaluation, setEvaluation] = useState<AnswerEvaluation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateQuestion = useCallback(
    async (formData: InterviewFormData): Promise<void> => {
      setIsLoading(true);
      setError(null);
      setCurrentQuestion(null);
      setUserAnswer("");
      setEvaluation(null);

      try {
        const response = await fetch("/api/interview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data: InterviewQuestionResponse = await response.json();

        if (data.success && data.question && data.metadata) {
          setCurrentQuestion(data);
        } else {
          setError(data.error || "Failed to generate question");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(`Network error: ${errorMessage}`);
        console.error("Question Generation Error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleSubmitAnswer = useCallback(
    async (
      question: string,
      answer: string,
      formData: InterviewFormData
    ): Promise<void> => {
      if (!question || !answer.trim()) return;

      setIsEvaluating(true);
      setError(null);

      try {
        const response = await fetch("/api/interview/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question,
            answer,
            jobRole: formData.jobRole,
            interviewType: formData.interviewType,
            difficulty: formData.difficulty,
          }),
        });

        const data = await response.json();

        if (data.success && data.evaluation) {
          setEvaluation(data.evaluation);
        } else {
          setError(data.error || "Failed to evaluate answer");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(`Network error during evaluation: ${errorMessage}`);
        console.error("Evaluation Error:", err);
      } finally {
        setIsEvaluating(false);
      }
    },
    []
  );

  const startNewQuestion = useCallback((): void => {
    setCurrentQuestion(null);
    setUserAnswer("");
    setEvaluation(null);
    setError(null);
  }, []);

  return {
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
  };
}
