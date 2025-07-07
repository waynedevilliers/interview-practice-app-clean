"use client";

import { QuestionGeneratorForm } from "./QuestionGeneratorForm";
import { QuestionResults } from "./QuestionResults";
import { useQuestionGenerator } from "@/hooks/useQuestionGenerator";

export default function QuestionGenerator(): JSX.Element {
  // All business logic moved to custom hook
  const {
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
  } = useQuestionGenerator();

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Left Column: Enhanced Form */}
      <QuestionGeneratorForm
        formData={formData}
        jobDescription={jobDescription}
        llmSettings={llmSettings}
        showAdvanced={showAdvanced}
        costInfo={costInfo}
        isLoading={isLoading}
        onFormDataChange={setFormData}
        onJobDescriptionChange={setJobDescription}
        onSettingChange={updateSetting}
        onToggleAdvanced={() => setShowAdvanced(!showAdvanced)}
        onSubmit={handleEnhancedSubmit}
      />

      {/* Right Column: Results */}
      <QuestionResults
        currentQuestion={currentQuestion}
        userAnswer={userAnswer}
        evaluation={evaluation}
        isLoading={isLoading}
        isEvaluating={isEvaluating}
        error={error}
        onAnswerChange={setUserAnswer}
        onSubmitAnswer={onSubmitAnswer}
        onGenerateAnother={onGenerateAnother}
        onStartNew={startNewQuestion}
        onCopyQuestion={onCopyQuestion}
        onCopyFeedback={onCopyFeedback}
      />
    </div>
  );
}
