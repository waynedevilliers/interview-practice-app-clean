"use client";

import { useState } from "react";

interface AdminPanelProps {
  isVisible: boolean;
  onToggle: () => void;
}

export default function AdminPanel({ isVisible, onToggle }: AdminPanelProps) {
  const [analysisType, setAnalysisType] = useState("github-security");
  const [repoUrl, setRepoUrl] = useState(
    "https://github.com/your-username/interview-practice-app"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGitHubAnalysis = async () => {
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

      const data = await response.json();

      if (data.success) {
        setAnalysis(data.analysis);
        setMetadata(data.metadata);
      } else {
        setError(data.error || "Failed to analyze repository");
      }
    } catch (err) {
      setError("Network error during GitHub analysis");
      console.error("GitHub Analysis Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDescriptiveAnalysis = async () => {
    setIsLoading(true);
    setError(null);

    // Your existing descriptive analysis logic here
    const critiquePrompts = {
      usability: `Analyze the usability of this Interview Practice App: [existing prompt]`,
      // ... other prompts
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
            critiquePrompts[analysisType as keyof typeof critiquePrompts],
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAnalysis(data.question);
      } else {
        setError(data.error || "Failed to get critique");
      }
    } catch (err) {
      setError("Network error during analysis");
    } finally {
      setIsLoading(false);
    }
  };

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
            >
              ×
            </button>
          </div>

          <div className="space-y-6">
            {/* Analysis Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Analysis Type:
              </label>
              <select
                value={analysisType}
                onChange={(e) => setAnalysisType(e.target.value)}
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
            {analysisType.startsWith("github-") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GitHub Repository URL:
                </label>
                <input
                  type="url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/username/interview-practice-app"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  disabled={isLoading}
                />
                <div className="mt-2 flex items-center text-xs text-gray-500">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded mr-2">
                    🔍 LIVE CODE ANALYSIS
                  </span>
                  Will analyze actual source code from your repository
                </div>
              </div>
            )}

            {/* Analyze Button */}
            <button
              onClick={
                analysisType.startsWith("github-")
                  ? handleGitHubAnalysis
                  : handleDescriptiveAnalysis
              }
              disabled={
                isLoading ||
                (analysisType.startsWith("github-") &&
                  !repoUrl.includes("github.com"))
              }
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
                  {analysisType.startsWith("github-")
                    ? "Analyzing Repository..."
                    : "Getting AI Critique..."}
                </span>
              ) : analysisType.startsWith("github-") ? (
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
                    {analysisType.startsWith("github-") && (
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
                    {analysisType.startsWith("github-")
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
                    onClick={() => navigator.clipboard.writeText(analysis)}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                  >
                    📋 Copy Analysis
                  </button>
                  <button
                    onClick={() => setAnalysis(null)}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                  >
                    🔄 Clear Results
                  </button>
                  {analysisType.startsWith("github-") && (
                    <button
                      onClick={() => window.open(repoUrl, "_blank")}
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
                ℹ️ Analysis Types:
              </h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-700">
                <div>
                  <p>
                    <strong>🔗 GitHub Analysis:</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Reads actual source code files</li>
                    <li>Provides file-specific feedback</li>
                    <li>Identifies real vulnerabilities</li>
                    <li>Reviews actual architecture</li>
                  </ul>
                </div>
                <div>
                  <p>
                    <strong>📝 Conceptual Analysis:</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Analyzes app concept and features</li>
                    <li>UX and usability feedback</li>
                    <li>Prompt engineering review</li>
                    <li>Overall assessment</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
