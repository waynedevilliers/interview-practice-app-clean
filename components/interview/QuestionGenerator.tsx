"use client";

import React, { useCallback } from "react";
import InterviewForm from "./InterviewForm";
import { useInterview } from "@/hooks/useInterview";
import type { InterviewFormData } from "@/types/interview";

export default function QuestionGenerator(): JSX.Element {
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

  // Memoized handlers
  const onSubmitAnswer = useCallback(() => {
    if (currentQuestion?.question && currentQuestion.metadata) {
      const formData: InterviewFormData = {
        jobRole: currentQuestion.metadata.jobRole,
        interviewType: currentQuestion.metadata.interviewType as
          | "technical"
          | "behavioral"
          | "industry",
        difficulty: currentQuestion.metadata.difficulty,
      };
      handleSubmitAnswer(currentQuestion.question, userAnswer, formData);
    }
  }, [currentQuestion, userAnswer, handleSubmitAnswer]);

  const onGenerateAnother = useCallback(() => {
    if (currentQuestion?.metadata) {
      const formData: InterviewFormData = {
        jobRole: currentQuestion.metadata.jobRole,
        interviewType: currentQuestion.metadata.interviewType as
          | "technical"
          | "behavioral"
          | "industry",
        difficulty: currentQuestion.metadata.difficulty,
      };
      handleGenerateQuestion(formData);
    }
  }, [currentQuestion, handleGenerateQuestion]);

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

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Left Column: Form */}
      <div>
        <InterviewForm
          onSubmit={handleGenerateQuestion}
          isLoading={isLoading}
        />
      </div>

      {/* Right Column: Results */}
      <div className="space-y-6">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-red-400 text-xl mr-3" aria-hidden="true">
                ❌
              </span>
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Generated Question */}
        {currentQuestion?.question && currentQuestion.metadata && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              📝 Your Interview Question
            </h3>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
              <p className="text-gray-700 leading-relaxed">
                {currentQuestion.question}
              </p>
            </div>

            {/* Question Metadata */}
            <div className="border-t pt-4 mb-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Role:</span>
                  <p className="text-gray-800">
                    {currentQuestion.metadata.jobRole}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Type:</span>
                  <p className="text-gray-800 capitalize">
                    {currentQuestion.metadata.interviewType}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Difficulty:</span>
                  <p className="text-gray-800">
                    {currentQuestion.metadata.difficulty}/10
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Time:</span>
                  <p className="text-gray-800">
                    {new Date(
                      currentQuestion.metadata.timestamp
                    ).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-4">
              <button
                onClick={onGenerateAnother}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                disabled={isLoading}
              >
                🔄 Generate Another
              </button>
              <button
                onClick={onCopyQuestion}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                📋 Copy Question
              </button>
            </div>
          </div>
        )}

        {/* Answer Input Section */}
        {currentQuestion?.question && !evaluation && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              ✍️ Your Answer
            </h3>

            <div className="space-y-4">
              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your interview answer here... Be specific and use examples from your experience."
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isEvaluating}
                aria-label="Interview answer input"
              />

              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>{userAnswer.length} characters</span>
                <span>💡 Aim for 150-300 words</span>
              </div>

              <button
                onClick={onSubmitAnswer}
                disabled={isEvaluating || !userAnswer.trim()}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors font-medium"
              >
                {isEvaluating ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Evaluating Answer...
                  </span>
                ) : (
                  "🎯 Submit Answer for AI Evaluation"
                )}
              </button>
            </div>
          </div>
        )}

        {/* Evaluation Results */}
        {evaluation && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                🎯 AI Feedback
              </h3>
              <div
                className={`px-4 py-2 rounded-full font-bold text-white ${
                  evaluation.score >= 8
                    ? "bg-green-500"
                    : evaluation.score >= 6
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
              >
                Score: {evaluation.score}/10
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
                {evaluation.rawFeedback}
              </pre>
            </div>

            <div className="flex gap-3">
              <button
                onClick={startNewQuestion}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                🔄 Start New Question
              </button>
              <button
                onClick={onCopyFeedback}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                📋 Copy Feedback
              </button>
            </div>
          </div>
        )}

        {/* Welcome Message */}
        {!currentQuestion && !error && !isLoading && (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-6xl mb-4" aria-hidden="true">
              🤖
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Ready to Practice!
            </h3>
            <p className="text-gray-600 mb-4">
              Fill out the form to generate your first AI-powered interview
              question.
            </p>
            <div className="text-sm text-gray-500 space-y-1">
              <p>
                💡 <strong>Step 1:</strong> Generate a question
              </p>
              <p>
                ✍️ <strong>Step 2:</strong> Write your answer
              </p>
              <p>
                🎯 <strong>Step 3:</strong> Get AI feedback
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
