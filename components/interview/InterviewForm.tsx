"use client";

import { useState, useCallback } from "react";

interface FormData {
  jobRole: string;
  interviewType: string;
  difficulty: number;
}

interface InterviewFormProps {
  onSubmit: (
    data: FormData & { jobDescription?: string; openAISettings: OpenAISettings }
  ) => void;
  isLoading?: boolean;
  onToggleAdmin: () => void;
}

interface OpenAISettings {
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  model: string;
}

interface CostInfo {
  estimatedTokens: number;
  estimatedCost: number;
  actualTokens?: number;
  actualCost?: number;
}

const MODEL_COSTS = {
  "gpt-4": { input: 0.03, output: 0.06 }, // per 1K tokens
  "gpt-4-turbo": { input: 0.01, output: 0.03 },
  "gpt-3.5-turbo": { input: 0.0015, output: 0.002 },
};

export default function InterviewForm({
  onSubmit,
  isLoading = false,
  onToggleAdmin,
}: InterviewFormProps) {
  // Basic form state matching your existing structure
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [costInfo, setCostInfo] = useState<CostInfo | null>(null);

  // Calculate estimated cost
  const calculateEstimatedCost = useCallback(
    (settings: OpenAISettings): CostInfo => {
      const modelCost = MODEL_COSTS[settings.model as keyof typeof MODEL_COSTS];
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

  // Update OpenAI setting
  const updateSetting = useCallback(
    (key: keyof OpenAISettings, value: number | string) => {
      const newSettings = { ...openAISettings, [key]: value };
      setOpenAISettings(newSettings);
      setCostInfo(calculateEstimatedCost(newSettings));
    },
    [openAISettings, calculateEstimatedCost]
  );

  // Generate interview question using onSubmit prop
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.jobRole.trim()) return;

      onSubmit({
        ...formData,
        jobDescription: jobDescription.trim() || undefined,
        openAISettings,
      });
    },
    [formData, jobDescription, openAISettings, onSubmit]
  );

  // Initialize cost calculation
  useState(() => {
    setCostInfo(calculateEstimatedCost(openAISettings));
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Interview Practice Assistant
          </h1>
          <p className="text-lg text-gray-600">
            AI-powered interview preparation with customizable settings
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 h-full">
          {/* Left Column - Controls */}
          <div className="space-y-6">
            {/* Basic Settings Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Interview Configuration
              </h2>

              <div className="space-y-4">
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
                        interviewType: e.target.value,
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
                  />
                </div>
              </div>
            </div>

            {/* Advanced AI Settings Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  AI Settings
                </h2>
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
                  >
                    <option value="gpt-4-turbo">
                      GPT-4 Turbo (Recommended)
                    </option>
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
              onClick={handleSubmit}
              disabled={isLoading || !formData.jobRole.trim()}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium text-lg"
            >
              {isLoading ? "Generating..." : "🚀 Generate Question"}
            </button>
          </div>

          {/* Right Column - Question Display */}
          <div className="space-y-6">
            {/* Question Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 h-full min-h-[600px]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Interview Question
                </h2>
              </div>

              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <div className="text-6xl mb-4">💭</div>
                  <p className="text-lg">
                    Configure your settings and generate an interview question
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Questions will appear here after generation
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Button */}
        <div className="fixed bottom-4 right-4">
          <button
            onClick={onToggleAdmin}
            className="bg-purple-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-purple-700 transition-colors"
          >
            Admin Panel
          </button>
        </div>
      </div>
    </div>
  );
}
