"use client";

import React, { useCallback, useState } from "react";
import { useInterview } from "@/hooks/useInterview";
import type { InterviewFormData, CostInfo } from "@/types/interview";

interface OpenAISettings {
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  model: string;
}

const MODEL_COSTS = {
  "gpt-4": { input: 0.03, output: 0.06 },
  "gpt-4-turbo": { input: 0.01, output: 0.03 },
  "gpt-4o-mini": { input: 0.00015, output: 0.0006 },
  "gpt-3.5-turbo": { input: 0.0015, output: 0.002 },
};

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

  // Enhanced form state
  const [formData, setFormData] = useState<InterviewFormData>({
    jobRole: "",
    interviewType: "technical",
    difficulty: 5,
  });
  const [jobDescription, setJobDescription] = useState<string>("");
  const [openAISettings, setOpenAISettings] = useState<OpenAISettings>({
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
    (settings: OpenAISettings): CostInfo => {
      const modelCost = MODEL_COSTS[settings.model as keyof typeof MODEL_COSTS];
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

  // Update OpenAI setting
  const updateSetting = useCallback(
    (key: keyof OpenAISettings, value: number | string) => {
      const newSettings = { ...openAISettings, [key]: value };
      setOpenAISettings(newSettings);
      setCostInfo(calculateEstimatedCost(newSettings));
    },
    [openAISettings, calculateEstimatedCost]
  );

  // Enhanced form submission
  const handleEnhancedSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.jobRole.trim()) return;

      const enhancedFormData: InterviewFormData = {
        ...formData,
        jobDescription: jobDescription.trim() || undefined,
        openAISettings,
      };

      handleGenerateQuestion(enhancedFormData);
    },
    [formData, jobDescription, openAISettings, handleGenerateQuestion]
  );

  // Update cost info when question is generated
  React.useEffect(() => {
    if (currentQuestion?.usage) {
      const modelCost =
        MODEL_COSTS[openAISettings.model as keyof typeof MODEL_COSTS];
      const actualCost =
        (currentQuestion.usage.prompt_tokens / 1000) * modelCost.input +
        (currentQuestion.usage.completion_tokens / 1000) * modelCost.output;

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
  }, [currentQuestion, openAISettings.model]);

  // Initialize cost calculation
  React.useEffect(() => {
    setCostInfo(calculateEstimatedCost(openAISettings));
  }, [calculateEstimatedCost, openAISettings]);

  // Memoized handlers (keeping your existing ones)
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

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Left Column: Enhanced Form */}
      <div className="space-y-6">
        {/* Basic Settings Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Interview Configuration
          </h2>

          <form onSubmit={handleEnhancedSubmit} className="space-y-4">
            {/* Job Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Role *
              </label>
              <input
                type="text"
                value={formData.jobRole}
                onChange={(e) =>
                  setFormData({ ...formData, jobRole: e.target.value })
                }
                placeholder="e.g., Frontend Developer, Data Scientist"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={isLoading}
              />
            </div>

            {/* Interview Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interview Type
              </label>
              <select
                value={formData.interviewType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    interviewType: e.target.value as any,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              >
                <option value="technical">💻 Technical</option>
                <option value="behavioral">🧠 Behavioral</option>
                <option value="industry">🏢 Industry-Specific</option>
                <option value="system-design">🏗️ System Design</option>
                <option value="coding">⌨️ Coding Challenge</option>
                <option value="leadership">👥 Leadership</option>
                <option value="cultural-fit">🤝 Cultural Fit</option>
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty:{" "}
                <span className="font-bold text-blue-600">
                  {formData.difficulty}/10
                </span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.difficulty}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    difficulty: parseInt(e.target.value),
                  })
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                disabled={isLoading}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Entry Level</span>
                <span>Senior Expert</span>
              </div>
            </div>

            {/* Job Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description (Optional)
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here for more targeted questions..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={isLoading}
              />
            </div>
          </form>
        </div>

        {/* Advanced AI Settings Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">AI Settings</h2>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {showAdvanced ? "Hide Advanced" : "Show Advanced"}
            </button>
          </div>

          <div className="space-y-4">
            {/* Model Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AI Model
              </label>
              <select
                value={openAISettings.model}
                onChange={(e) => updateSetting("model", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              >
                <option value="gpt-4o-mini">GPT-4o Mini (Recommended)</option>
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
                <option value="gpt-4">GPT-4 (Premium)</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Fast)</option>
              </select>
            </div>

            {/* Temperature */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Creativity: {openAISettings.temperature}
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={openAISettings.temperature}
                onChange={(e) =>
                  updateSetting("temperature", parseFloat(e.target.value))
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                disabled={isLoading}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Focused</span>
                <span>Balanced</span>
                <span>Creative</span>
              </div>
            </div>

            {showAdvanced && (
              <>
                {/* Max Tokens */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Response Length: {openAISettings.maxTokens} tokens
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="2000"
                    step="100"
                    value={openAISettings.maxTokens}
                    onChange={(e) =>
                      updateSetting("maxTokens", parseInt(e.target.value))
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    disabled={isLoading}
                  />
                </div>

                {/* Top P */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Focus: {openAISettings.topP}
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={openAISettings.topP}
                    onChange={(e) =>
                      updateSetting("topP", parseFloat(e.target.value))
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    disabled={isLoading}
                  />
                </div>

                {/* Frequency Penalty */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Repetition Control: {openAISettings.frequencyPenalty}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={openAISettings.frequencyPenalty}
                    onChange={(e) =>
                      updateSetting(
                        "frequencyPenalty",
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    disabled={isLoading}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Cost Information */}
        {costInfo && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-green-800 mb-2">
              Cost Information
            </h3>
            <div className="text-sm text-green-700 space-y-1">
              <div className="flex justify-between">
                <span>Estimated Cost:</span>
                <span>${costInfo.estimatedCost.toFixed(4)}</span>
              </div>
              {costInfo.actualCost && (
                <div className="flex justify-between font-medium">
                  <span>Actual Cost:</span>
                  <span>${costInfo.actualCost.toFixed(4)}</span>
                </div>
              )}
              <div className="text-xs text-green-600 mt-2">
                Using {openAISettings.model} model
              </div>
            </div>
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleEnhancedSubmit}
          disabled={isLoading || !formData.jobRole.trim()}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium text-lg"
        >
          {isLoading ? "Generating..." : "🚀 Generate Question"}
        </button>
      </div>

      {/* Right Column: Results (keeping your existing implementation) */}
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
              Configure your AI settings and generate your first interview
              question.
            </p>
            <div className="text-sm text-gray-500 space-y-1">
              <p>
                💡 <strong>Step 1:</strong> Set your preferences and generate a
                question
              </p>
              <p>
                ✍️ <strong>Step 2:</strong> Write your answer
              </p>
              <p>
                🎯 <strong>Step 3:</strong> Get AI feedback with cost tracking
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
