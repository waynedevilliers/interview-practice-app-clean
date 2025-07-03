"use client";

import { useState } from "react";
import InterviewForm from "./InterviewForm";

interface InterviewQuestion {
  question: string;
  jobRole: string;
  interviewType: string;
  difficulty: number;
  timestamp: string;
}

interface AnswerEvaluation {
  rawFeedback: string;
  score: number;
  timestamp: string;
}

// Fixed: Added proper FormData interface
interface FormData {
  jobRole: string;
  interviewType: string;
  difficulty: number;
}

export default function QuestionGenerator(): JSX.Element {
  const [currentQuestion, setCurrentQuestion] =
    useState<InterviewQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [evaluation, setEvaluation] = useState<AnswerEvaluation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fixed: Replaced 'any' with proper FormData type
  const handleGenerateQuestion = async (formData: FormData): Promise<void> => {
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

      const data = await response.json();

      if (data.success) {
        setCurrentQuestion({
          question: data.question,
          jobRole: data.metadata.jobRole,
          interviewType: data.metadata.interviewType,
          difficulty: data.metadata.difficulty,
          timestamp: data.metadata.timestamp,
        });
      } else {
        setError(data.error || "Failed to generate question");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAnswer = async (): Promise<void> => {
    if (!currentQuestion || !userAnswer.trim()) return;

    setIsEvaluating(true);
    setError(null);

    try {
      const response = await fetch("/api/interview/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: currentQuestion.question,
          answer: userAnswer,
          jobRole: currentQuestion.jobRole,
          interviewType: currentQuestion.interviewType,
          difficulty: currentQuestion.difficulty,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setEvaluation(data.evaluation);
      } else {
        setError(data.error || "Failed to evaluate answer");
      }
    } catch (err) {
      setError("Network error during evaluation. Please try again.");
      console.error("Evaluation Error:", err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const startNewQuestion = (): void => {
    setCurrentQuestion(null);
    setUserAnswer("");
    setEvaluation(null);
    setError(null);
  };

  // Rest of your component remains the same...
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Your existing JSX here */}
    </div>
  );
}
