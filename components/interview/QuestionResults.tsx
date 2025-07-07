import { ErrorDisplay } from "../admin/ErrorDisplay"; // Reuse from admin
import { GeneratedQuestionCard } from "./GeneratedQuestionCard";
import { AnswerInputSection } from "./AnswerInputSection";
import { EvaluationResults } from "./EvaluationResults";
import { QuestionGeneratorWelcome } from "./QuestionGeneratorWelcome";

interface QuestionResultsProps {
  currentQuestion: any;
  userAnswer: string;
  evaluation: any;
  isLoading: boolean;
  isEvaluating: boolean;
  error: string | null;
  onAnswerChange: (answer: string) => void;
  onSubmitAnswer: () => void;
  onGenerateAnother: () => void;
  onStartNew: () => void;
  onCopyQuestion: () => void;
  onCopyFeedback: () => void;
}

export function QuestionResults({
  currentQuestion,
  userAnswer,
  evaluation,
  isLoading,
  isEvaluating,
  error,
  onAnswerChange,
  onSubmitAnswer,
  onGenerateAnother,
  onStartNew,
  onCopyQuestion,
  onCopyFeedback,
}: QuestionResultsProps) {
  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && <ErrorDisplay error={error} />}

      {/* Generated Question */}
      {currentQuestion?.question && currentQuestion.metadata && (
        <GeneratedQuestionCard
          question={currentQuestion}
          onGenerateAnother={onGenerateAnother}
          onCopyQuestion={onCopyQuestion}
          isLoading={isLoading}
        />
      )}

      {/* Answer Input Section */}
      {currentQuestion?.question && !evaluation && (
        <AnswerInputSection
          userAnswer={userAnswer}
          isEvaluating={isEvaluating}
          onAnswerChange={onAnswerChange}
          onSubmitAnswer={onSubmitAnswer}
        />
      )}

      {/* Evaluation Results */}
      {evaluation && (
        <EvaluationResults
          evaluation={evaluation}
          onStartNew={onStartNew}
          onCopyFeedback={onCopyFeedback}
        />
      )}

      {/* Welcome Message */}
      {!currentQuestion && !error && !isLoading && <QuestionGeneratorWelcome />}
    </div>
  );
}
