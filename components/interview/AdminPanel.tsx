"use client";

import { useState, useCallback, JSX } from "react";
import type {
  AnalysisType,
  AnalysisMetadata,
  GitHubAnalysisResponse,
} from "@/types/admin";

interface AdminPanelProps {
  isVisible: boolean;
  onToggle: () => void;
}

export default function AdminPanel({
  isVisible,
  onToggle,
}: AdminPanelProps): JSX.Element {
  const [analysisType, setAnalysisType] =
    useState<AnalysisType>("github-security");
  const [repoUrl, setRepoUrl] = useState<string>(
    "https://github.com/your-username/interview-practice-app"
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<AnalysisMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Memoized GitHub analysis function
  const handleGitHubAnalysis = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setMetadata(null);

    try {
      const response = await fetch("/api/admin/github-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoUrl,
          analysisType: analysisType.replace("github-", ""),
        }),
      });

      const data: GitHubAnalysisResponse = await response.json();

      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
        if (data.metadata) {
          setMetadata(data.metadata);
        }
      } else {
        setError(data.error || "Failed to analyze repository");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(`Network error during GitHub analysis: ${errorMessage}`);
      console.error("GitHub Analysis Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [repoUrl, analysisType]);

  // Memoized descriptive analysis function
  const handleDescriptiveAnalysis = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    const critiquePrompts: Record<string, string> = {
      usability: `Analyze the usability of this Interview Practice App: [detailed usability analysis prompt]`,
      promptEngineering: `Analyze the prompt engineering quality: [detailed prompt engineering analysis]`,
      overall: `Provide overall assessment: [comprehensive app assessment]`,
    };

    try {
      const response = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobRole: "Software Architect",
          interviewType: "technical",
          difficulty: 10,
          adminCritique: true,
          critiquePrompt:
            critiquePrompts[analysisType] || critiquePrompts.overall,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAnalysis(data.question);
      } else {
        setError(data.error || "Failed to get critique");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(`Network error during analysis: ${errorMessage}`);
      console.error("Descriptive Analysis Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [analysisType]);

  // Memoized handlers
  const handleAnalysisTypeChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setAnalysisType(event.target.value as AnalysisType);
    },
    []
  );

  const handleRepoUrlChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRepoUrl(event.target.value);
    },
    []
  );

  const handleCopyAnalysis = useCallback(() => {
    if (analysis) {
      navigator.clipboard.writeText(analysis);
    }
  }, [analysis]);

  const handleClearResults = useCallback(() => {
    setAnalysis(null);
    setMetadata(null);
    setError(null);
  }, []);

  const handleViewRepository = useCallback(() => {
    window.open(repoUrl, "_blank");
  }, [repoUrl]);

  // Early return for hidden state
  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4">
        <button
          onClick={onToggle}
          className="bg-purple-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-purple-700 transition-colors"
        >
          🔧 Admin
        </button>
      </div>
    );
  }

  const isGitHubAnalysis = analysisType.startsWith("github-");
  const isValidGitHubUrl = repoUrl.includes("github.com");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              🔧 Admin: Code Analysis Panel
            </h2>
            <button
              onClick={onToggle}
              className="text-gray-500 hover:text-gray-700 text-2xl"
              aria-label="Close admin panel"
            >
              ×
            </button>
          </div>

          <div className="space-y-6">
            {/* Analysis Type Selection */}
            <div>
              <label
                htmlFor="analysis-type"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Analysis Type:
              </label>
              <select
                id="analysis-type"
                value={analysisType}
                onChange={handleAnalysisTypeChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                disabled={isLoading}
              >
                <optgroup label="🔗 Real GitHub Code Analysis">
                  <option value="github-security">
                    🔒 Security Vulnerabilities
                  </option>
                  <option value="github-codeQuality">
                    ✨ Code Quality Review
                  </option>
                  <option value="github-architecture">
                    🏗️ Architecture Analysis
                  </option>
                  <option value="github-performance">
                    ⚡ Performance Analysis
                  </option>
                </optgroup>
                <optgroup label="📝 Conceptual Analysis">
                  <option value="usability">🎨 Usability & UX Design</option>
                  <option value="promptEngineering">
                    🤖 Prompt Engineering
                  </option>
                  <option value="overall">📊 Overall Assessment</option>
                </optgroup>
              </select>
            </div>

            {/* GitHub URL Input */}
            {isGitHubAnalysis && (
              <div>
                <label
                  htmlFor="repo-url"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  GitHub Repository URL:
                </label>
                <input
                  id="repo-url"
                  type="url"
                  value={repoUrl}
                  onChange={handleRepoUrlChange}
                  placeholder="https://github.com/username/interview-practice-app"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  disabled={isLoading}
                />
                <div className="mt-2 flex items-center text-xs text-gray-500">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded mr-2">
                    🔍 PUBLIC CODE ONLY
                  </span>
                  Will analyze public source code and configuration files (no
                  private .env files)
                </div>
              </div>
            )}

            {/* Analyze Button */}
            <button
              onClick={
                isGitHubAnalysis
                  ? handleGitHubAnalysis
                  : handleDescriptiveAnalysis
              }
              disabled={isLoading || (isGitHubAnalysis && !isValidGitHubUrl)}
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors font-medium"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
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
                  {isGitHubAnalysis
                    ? "Analyzing Repository..."
                    : "Getting AI Critique..."}
                </span>
              ) : isGitHubAnalysis ? (
                "🔍 Analyze GitHub Repository"
              ) : (
                "🔍 Get AI Critique"
              )}
            </button>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-red-400 text-xl mr-3">❌</span>
                  <div>
                    <h3 className="text-sm font-medium text-red-800">
                      Analysis Error
                    </h3>
                    <p className="text-sm text-red-700">{error}</p>
                    {isGitHubAnalysis && (
                      <p className="text-xs text-red-600 mt-1">
                        💡 Tip: Make sure the repository is public and the URL
                        is correct
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Analysis Results */}
            {analysis && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-purple-800">
                    {isGitHubAnalysis
                      ? "🔗 GitHub Code Analysis"
                      : "🤖 AI Analysis Results"}
                  </h3>
                  {metadata && (
                    <div className="text-sm text-purple-600">
                      📊 {metadata.filesAnalyzed} files analyzed
                    </div>
                  )}
                </div>

                <div className="bg-white border border-purple-200 rounded p-4 max-h-[500px] overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
                    {analysis}
                  </pre>
                </div>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={handleCopyAnalysis}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                  >
                    📋 Copy Analysis
                  </button>
                  <button
                    onClick={handleClearResults}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                  >
                    🔄 Clear Results
                  </button>
                  {isGitHubAnalysis && (
                    <button
                      onClick={handleViewRepository}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      🔗 View Repository
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Info Panel */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">
                🔒 Security & Privacy:
              </h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p>
                  • <strong>PUBLIC ANALYSIS ONLY:</strong> We only analyze
                  publicly visible files on GitHub
                </p>
                <p>
                  • <strong>NO PRIVATE DATA:</strong> .env.local, API keys, and
                  secrets are never analyzed
                </p>
                <p>
                  • <strong>SAFE ANALYSIS:</strong> Only source code,
                  configuration, and documentation files
                </p>
                <p>
                  • <strong>RATE LIMITED:</strong> API calls are rate-limited
                  for security
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
