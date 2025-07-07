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

// Extended analysis types for new project validation features
type ExtendedAnalysisType =
  | AnalysisType
  | "project-criteria-easy"
  | "project-criteria-medium"
  | "project-criteria-hard"
  | "cross-validation";

interface ValidationSettings {
  primaryProvider: "openai" | "claude";
  validatorProvider: "openai" | "claude";
  includeScore: boolean;
  crossValidate: boolean;
}

export default function AdminPanel({
  isVisible,
  onToggle,
}: AdminPanelProps): JSX.Element {
  const [analysisType, setAnalysisType] =
    useState<ExtendedAnalysisType>("github-security");
  const [repoUrl, setRepoUrl] = useState<string>(
    "https://github.com/your-username/interview-practice-app"
  );

  // New validation settings
  const [validationSettings, setValidationSettings] =
    useState<ValidationSettings>({
      primaryProvider: "openai",
      validatorProvider: "claude",
      includeScore: true,
      crossValidate: false,
    });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<AnalysisMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Generate concise project criteria validation prompt (under 2000 chars)
  // Fixed generateCriteriaPrompt function for AdminPanel.tsx

  const generateCriteriaPrompt = useCallback(
    (difficulty: "easy" | "medium" | "hard", repoUrl: string): string => {
      const basePrompt = `Analyze GitHub repo: ${repoUrl}

Interview Practice App Assessment - ${difficulty.toUpperCase()} Level
MUST end with: "OVERALL SCORE: X/10"

CRITICAL: Only mark features as ✅ if you can see ACTUAL CODE IMPLEMENTATION, not just file names!

`;

      const requirements = {
        easy: `CORE REQUIREMENTS (6 required):
✅ Research & creativity in interview prep
✅ Frontend (Next.js/Streamlit) with working UI
✅ OpenAI API integration with error handling
✅ 5+ prompt techniques (few-shot, chain-of-thought, zero-shot, role-play, structured)
✅ 1+ OpenAI parameter tuning (user controllable)
✅ 1+ security measure (validation, rate limiting, etc.)

VERIFICATION CHECKLIST:
- Frontend: Look for actual React components, not just file names
- API Integration: Check for OpenAI API calls in route.ts files
- Prompt Techniques: Find actual system prompts with different techniques
- Parameter Tuning: Look for temperature, max_tokens controls in UI
- Security: Find actual validation/sanitization code, not just file names

SCORING: 9-10=all requirements+extras, 7-8=all requirements, 5-6=most requirements, 3-4=some missing, 1-2=major gaps

Check actual implementation, not just presence. Look for working features.`,

        medium: `EASY REQUIREMENTS + MEDIUM TASKS:
✅ All Easy level requirements
✅ User-configurable OpenAI settings (temperature, models, tokens)
✅ Cost calculation & token tracking
✅ Multiple LLM support (OpenAI + Claude/Gemini)
✅ Job description integration (RAG)
✅ Structured JSON outputs (2+ formats)
✅ Internet deployment OR LLM-as-judge validation

VERIFICATION CHECKLIST:
- Settings: Look for actual UI controls for temperature, model selection
- Cost Tracking: Find token counting and cost calculation code
- Multi-LLM: Check for both OpenAI AND another provider (Claude/Gemini) with actual API calls
- RAG: Look for job description input and integration in prompts
- JSON Outputs: Find structured response formatting in code
- Deployment: Check for deployment configs OR cross-validation features

SCORING: 9-10=easy+4+ medium tasks, 7-8=easy+2-3 medium, 5-6=easy+1-2 medium, 3-4=easy only, 1-2=incomplete

Verify features actually work, not just exist.`,

        hard: `EASY+MEDIUM REQUIREMENTS + HARD TASKS:
✅ All Easy + Medium requirements
✅ Full chatbot (not one-time calls) - Look for conversation memory/context
✅ Cloud deployment (AWS/Azure, not just Vercel) - Check deployment configs
✅ LangChain integration (chains/agents) - Look for actual LangChain imports
✅ Vector database (question uniqueness) - Find vector/embedding code
✅ Open-source LLMs OR fine-tuned models - Check for local LLM usage

VERIFICATION CHECKLIST - MUST SEE ACTUAL CODE:
- Chatbot: Look for conversation state management, not just Q&A
- Cloud: Find AWS/Azure configs, not just deployment scripts
- LangChain: Search for "langchain" imports and chain implementations
- Vector DB: Look for embedding generation, similarity search, vector storage
- Open Source: Find HuggingFace, Ollama, or local model integrations
- Fine-tuning: Look for model training/fine-tuning code

CRITICAL: Do NOT assume features exist based on file names like:
- "lib/utils.ts" = vector database ❌
- "services/interviewService.ts" = LangChain ❌  
- File existence ≠ feature implementation ❌

ONLY mark ✅ if you see ACTUAL IMPLEMENTATION CODE!

SCORING: 9-10=production-ready+multiple hard tasks, 7-8=good+2-3 hard, 5-6=basic+1-2 hard, 3-4=attempts hard, 1-2=incomplete

Check for production-level implementation quality with REAL CODE EVIDENCE.`,
      };

      return `${basePrompt}${requirements[difficulty]}

ANALYSIS FORMAT:
## Requirements Status
[List each requirement as ✅/⚠️/❌ with SPECIFIC CODE EVIDENCE]

## Code Evidence Found
[Quote actual code snippets that prove features exist]

## Missing Features  
[List what's actually missing with evidence]

## Technical Quality
Code organization: [assessment based on actual code]
Security: [actual security measures found in code]
UX: [interface quality based on actual components]

## Standout Features
[Creative implementations beyond requirements with code evidence]

OVERALL SCORE: X/10
[Justify score based on ACTUAL IMPLEMENTED FEATURES, not assumptions]

REMEMBER: File names don't prove features exist. Only actual code implementation counts!`;
    },
    []
  );

  // Generate concise cross-validation prompt (under 2000 chars)
  const generateCrossValidationPrompt = useCallback(
    (
      originalAnalysis: string,
      validatorProvider: "openai" | "claude"
    ): string => {
      // Truncate original analysis if too long to fit in validation limit
      const truncatedAnalysis =
        originalAnalysis.length > 1200
          ? originalAnalysis.substring(0, 1200) + "...[truncated]"
          : originalAnalysis;

      return `Cross-validate this analysis using ${
        validatorProvider === "openai" ? "OpenAI" : "Claude"
      }:

ORIGINAL ANALYSIS:
---
${truncatedAnalysis}
---

VALIDATION TASK:
Check accuracy, completeness, fairness of the above analysis.

RESPONSE FORMAT:
## Cross-Validation Report

### ✅ Accurate Points
[What the original got right]

### ❌ Corrections Needed  
[Errors or missed features]

### 📝 Missing Analysis
[Important overlooked aspects]

### ⚖️ Score Assessment
Original Score: [X/10]
Fair?: [YES/NO - explain why]

### 🎯 My Assessment
[Brief independent evaluation]

MY INDEPENDENT SCORE: X/10
VALIDATION STATUS: [CONFIRMED/NEEDS_REVISION/FLAWED]

Provide thorough but concise validation.`;
    },
    []
  );

  // Enhanced GitHub analysis function
  const handleEnhancedAnalysis = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setValidationResult(null);
    setMetadata(null);

    try {
      let analysisPrompt = "";

      // Generate appropriate prompt based on analysis type
      if (analysisType.startsWith("project-criteria-")) {
        const difficulty = analysisType.replace("project-criteria-", "") as
          | "easy"
          | "medium"
          | "hard";
        analysisPrompt = generateCriteriaPrompt(difficulty, repoUrl);
      } else {
        // Handle other GitHub analysis types with scoring (concise prompts)
        const analysisTypeMap: Record<string, string> = {
          "github-security": `Security analysis of ${repoUrl}. Check: input validation, API protection, auth, data sanitization. Score /10. End with: "OVERALL SCORE: X/10"`,
          "github-codeQuality": `Code quality analysis of ${repoUrl}. Check: organization, readability, documentation, best practices. Score /10. End with: "OVERALL SCORE: X/10"`,
          "github-architecture": `Architecture analysis of ${repoUrl}. Check: structure, patterns, scalability, modularity. Score /10. End with: "OVERALL SCORE: X/10"`,
          "github-performance": `Performance analysis of ${repoUrl}. Check: optimization, resource usage, API efficiency, loading. Score /10. End with: "OVERALL SCORE: X/10"`,
          "github-critical": `Critical issues analysis of ${repoUrl}. Check: security vulnerabilities, breaking bugs, blockers. Score /10. End with: "OVERALL SCORE: X/10"`,
          "github-production": `Production readiness of ${repoUrl}. Check: deployment ready, scalability, monitoring, error handling. Score /10. End with: "OVERALL SCORE: X/10"`,
          "github-final": `Final validation of ${repoUrl}. Verify fixes implemented, requirements met. Score /10. End with: "OVERALL SCORE: X/10"`,
        };

        analysisPrompt =
          analysisTypeMap[analysisType] || analysisTypeMap["github-security"];
      }

      // Step 1: Primary Analysis
      const response = await fetch("/api/admin/github-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobRole: "Senior Code Reviewer",
          interviewType: "technical",
          difficulty: 10,
          adminCritique: true,
          critiquePrompt: analysisPrompt,
          repoUrl: repoUrl, // ✅ Add repoUrl for GitHub file fetching
          llmSettings: {
            provider: validationSettings.primaryProvider,
            temperature: 0.3,
            maxTokens: 2000,
            topP: 0.9,
            model:
              validationSettings.primaryProvider === "openai"
                ? "gpt-4o-mini"
                : "claude-3-5-sonnet-20241022",
          },
        }),
      });

      const data = await response.json();

      if (data.success && data.question) {
        setAnalysis(
          typeof data.question === "string"
            ? data.question
            : JSON.stringify(data.question)
        );

        // Set metadata
        setMetadata({
          filesAnalyzed: 1,
          analysisType: analysisType,
          timestamp: new Date().toISOString(),
          repositoryName: repoUrl.split("/").pop() || "Unknown",
        });

        // Step 2: Cross-validation if enabled
        if (validationSettings.crossValidate && data.question) {
          try {
            const validationPrompt = generateCrossValidationPrompt(
              data.question,
              validationSettings.validatorProvider
            );

            const validationResponse = await fetch(
              "/api/admin/github-analyze",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  jobRole: "Expert Code Validation Specialist",
                  interviewType: "technical",
                  difficulty: 10,
                  adminCritique: true,
                  critiquePrompt: validationPrompt,
                  llmSettings: {
                    provider: validationSettings.validatorProvider,
                    temperature: 0.2,
                    maxTokens: 1500,
                    topP: 0.9,
                    model:
                      validationSettings.validatorProvider === "openai"
                        ? "gpt-4o-mini"
                        : "claude-3-5-sonnet-20241022",
                  },
                }),
              }
            );

            const validationData = await validationResponse.json();
            if (validationData.success && validationData.question) {
              setValidationResult(validationData.question);
            }
          } catch (validationError) {
            console.warn("Cross-validation failed:", validationError);
          }
        }
      } else {
        const errorMessage = data.error || "Failed to analyze repository";
        setError(
          typeof errorMessage === "string"
            ? errorMessage
            : JSON.stringify(errorMessage)
        );
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(`Network error during analysis: ${errorMessage}`);
      console.error("Enhanced Analysis Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [
    repoUrl,
    analysisType,
    validationSettings,
    generateCriteriaPrompt,
    generateCrossValidationPrompt,
  ]);

  // Keep your existing descriptive analysis function
  const handleDescriptiveAnalysis = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setMetadata(null);

    const critiquePrompts: Record<string, string> = {
      usability: `Analyze Interview Practice App usability. Check: UI design, ease of use, navigation, accessibility. Provide score /10. End with: "OVERALL SCORE: X/10"`,
      promptEngineering: `Analyze Interview Practice App prompt engineering. Check: prompt quality, techniques used, AI integration. Provide score /10. End with: "OVERALL SCORE: X/10"`,
      overall: `Overall Interview Practice App assessment. Check: functionality, code quality, user experience, innovation. Provide score /10. End with: "OVERALL SCORE: X/10"`,
    };

    try {
      const response = await fetch("/api/admin/github-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobRole: "Software Architect",
          interviewType: "technical",
          difficulty: 10,
          adminCritique: true,
          critiquePrompt:
            critiquePrompts[analysisType] || critiquePrompts.overall,
          repoUrl: repoUrl, // ✅ Add repoUrl for GitHub file fetching
          llmSettings: {
            provider: validationSettings.primaryProvider,
            temperature: 0.3,
            maxTokens: 1500,
            topP: 0.9,
            model:
              validationSettings.primaryProvider === "openai"
                ? "gpt-4o-mini"
                : "claude-3-5-sonnet-20241022",
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAnalysis(
          typeof data.question === "string"
            ? data.question
            : JSON.stringify(data.question)
        );
      } else {
        const errorMessage = data.error || "Failed to get critique";
        setError(
          typeof errorMessage === "string"
            ? errorMessage
            : JSON.stringify(errorMessage)
        );
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(`Network error during analysis: ${errorMessage}`);
      console.error("Descriptive Analysis Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [analysisType, validationSettings.primaryProvider]);

  // Memoized handlers
  const handleAnalysisTypeChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setAnalysisType(event.target.value as ExtendedAnalysisType);
      setAnalysis(null);
      setValidationResult(null);
      setMetadata(null);
      setError(null);
    },
    []
  );

  const handleRepoUrlChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRepoUrl(event.target.value);
    },
    []
  );

  const updateValidationSetting = useCallback(
    (key: keyof ValidationSettings, value: any) => {
      setValidationSettings((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleCopyAnalysis = useCallback(() => {
    const fullAnalysis = validationResult
      ? `${analysis}\n\n--- CROSS-VALIDATION REPORT ---\n${validationResult}`
      : analysis;
    if (fullAnalysis) {
      navigator.clipboard.writeText(fullAnalysis);
    }
  }, [analysis, validationResult]);

  const handleClearResults = useCallback(() => {
    setAnalysis(null);
    setValidationResult(null);
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

  const isGitHubAnalysis =
    analysisType.startsWith("github-") ||
    analysisType.startsWith("project-criteria");
  const isProjectCriteria = analysisType.startsWith("project-criteria");
  const isValidGitHubUrl = repoUrl.includes("github.com");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              🔧 Enhanced Admin: Multi-LLM Analysis Panel
            </h2>
            <button
              onClick={onToggle}
              className="text-gray-500 hover:text-gray-700 text-2xl"
              aria-label="Close admin panel"
            >
              ×
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column: Settings */}
            <div className="space-y-6">
              {/* Analysis Type Selection */}
              <div className="bg-gray-50 rounded-lg p-4">
                <label
                  htmlFor="analysis-type"
                  className="block text-sm font-medium text-gray-700 mb-3"
                >
                  Analysis Type:
                </label>
                <select
                  id="analysis-type"
                  value={analysisType}
                  onChange={handleAnalysisTypeChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                  disabled={isLoading}
                >
                  <optgroup label="🎯 Project Criteria Validation">
                    <option value="project-criteria-easy">
                      📝 Easy Level Requirements (Score /10)
                    </option>
                    <option value="project-criteria-medium">
                      📊 Medium Level Requirements (Score /10)
                    </option>
                    <option value="project-criteria-hard">
                      🏆 Hard Level Requirements (Score /10)
                    </option>
                  </optgroup>
                  <optgroup label="🔗 GitHub Code Analysis">
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
                    <option value="github-critical">
                      🚨 Critical Issues ONLY
                    </option>
                    <option value="github-production">
                      🚀 Production Readiness
                    </option>
                    <option value="github-final">
                      ✅ Final Validation Review
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

              {/* AI Provider Settings */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  AI Provider Settings
                </h3>

                {/* Primary Provider */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-600 mb-2">
                    Primary Analyzer
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateValidationSetting("primaryProvider", "openai")
                      }
                      className={`p-2 text-xs border-2 rounded transition-colors ${
                        validationSettings.primaryProvider === "openai"
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      disabled={isLoading}
                    >
                      OpenAI GPT
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateValidationSetting("primaryProvider", "claude")
                      }
                      className={`p-2 text-xs border-2 rounded transition-colors ${
                        validationSettings.primaryProvider === "claude"
                          ? "border-purple-500 bg-purple-50 text-purple-700"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      disabled={isLoading}
                    >
                      Claude
                    </button>
                  </div>
                </div>

                {/* Cross-Validation Toggle */}
                <div className="mb-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={validationSettings.crossValidate}
                      onChange={(e) =>
                        updateValidationSetting(
                          "crossValidate",
                          e.target.checked
                        )
                      }
                      className="rounded"
                      disabled={isLoading}
                    />
                    <span className="text-xs text-gray-700">
                      Enable Cross-Validation
                    </span>
                  </label>
                </div>

                {/* Validator Provider */}
                {validationSettings.crossValidate && (
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Validator AI
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateValidationSetting("validatorProvider", "openai")
                        }
                        className={`p-2 text-xs border-2 rounded transition-colors ${
                          validationSettings.validatorProvider === "openai"
                            ? "border-green-500 bg-green-50 text-green-700"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        disabled={isLoading}
                      >
                        OpenAI
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateValidationSetting("validatorProvider", "claude")
                        }
                        className={`p-2 text-xs border-2 rounded transition-colors ${
                          validationSettings.validatorProvider === "claude"
                            ? "border-purple-500 bg-purple-50 text-purple-700"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        disabled={isLoading}
                      >
                        Claude
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* GitHub URL Input */}
              {isGitHubAnalysis && (
                <div className="bg-gray-50 rounded-lg p-4">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                    disabled={isLoading}
                  />
                </div>
              )}

              {/* Project Criteria Info */}
              {isProjectCriteria && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">
                    🎯 Project Validation:
                  </h4>
                  <div className="text-sm text-blue-700">
                    {analysisType === "project-criteria-easy" && (
                      <p>
                        <strong>Easy Level:</strong> Core requirements, API
                        integration, 5+ prompts, basic security
                      </p>
                    )}
                    {analysisType === "project-criteria-medium" && (
                      <p>
                        <strong>Medium Level:</strong> Advanced features,
                        multi-LLM, cost tracking, deployment
                      </p>
                    )}
                    {analysisType === "project-criteria-hard" && (
                      <p>
                        <strong>Hard Level:</strong> Production-ready,
                        LangChain, vector DB, fine-tuning
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Analyze Button */}
              <button
                onClick={
                  isGitHubAnalysis
                    ? handleEnhancedAnalysis
                    : handleDescriptiveAnalysis
                }
                disabled={isLoading || (isGitHubAnalysis && !isValidGitHubUrl)}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors font-medium text-sm"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
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
                    {validationSettings.crossValidate
                      ? "Analyzing & Validating..."
                      : "Analyzing..."}
                  </span>
                ) : (
                  `🔍 Analyze with ${
                    validationSettings.primaryProvider === "openai"
                      ? "OpenAI"
                      : "Claude"
                  }`
                )}
              </button>
            </div>

            {/* Right Column: Results */}
            <div className="lg:col-span-2 space-y-6">
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
                    </div>
                  </div>
                </div>
              )}

              {/* Primary Analysis Results */}
              {analysis && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-purple-800">
                      🔍 Primary Analysis (
                      {validationSettings.primaryProvider === "openai"
                        ? "OpenAI"
                        : "Claude"}
                      )
                    </h3>
                    {metadata && (
                      <div className="text-sm text-purple-600">
                        📊 Analysis completed
                      </div>
                    )}
                  </div>

                  <div className="bg-white border border-purple-200 rounded p-4 max-h-[400px] overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
                      {analysis}
                    </pre>
                  </div>
                </div>
              )}

              {/* Cross-Validation Results */}
              {validationResult && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-amber-800 mb-4">
                    🤝 Cross-Validation Report (
                    {validationSettings.validatorProvider === "openai"
                      ? "OpenAI"
                      : "Claude"}{" "}
                    Validator)
                  </h3>
                  <div className="bg-white border border-amber-200 rounded p-4 max-h-[300px] overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
                      {validationResult}
                    </pre>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {(analysis || validationResult) && (
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={handleCopyAnalysis}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm"
                  >
                    📋 Copy Analysis
                  </button>
                  <button
                    onClick={handleClearResults}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm"
                  >
                    🔄 Clear Results
                  </button>
                  {isGitHubAnalysis && (
                    <button
                      onClick={handleViewRepository}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                    >
                      🔗 View Repository
                    </button>
                  )}
                </div>
              )}

              {/* Welcome Message */}
              {!analysis && !error && !isLoading && (
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <div className="text-6xl mb-4">🤖</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Enhanced Analysis Ready!
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Choose your analysis type and AI provider to get started.
                  </p>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>
                      🎯 <strong>Project Validation:</strong> Score your app
                      against assignment criteria
                    </p>
                    <p>
                      🤝 <strong>Cross-Validation:</strong> Get AI to validate
                      other AI's analysis
                    </p>
                    <p>
                      🔍 <strong>Multi-LLM:</strong> Compare OpenAI vs Claude
                      insights
                    </p>
                    <p>
                      📊 <strong>Scoring:</strong> Get numerical scores out of
                      10
                    </p>
                  </div>
                </div>
              )}

              {/* Info Panel */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">
                  🛠️ Enhanced Features:
                </h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>
                    • <strong>PROJECT VALIDATION:</strong> Check against
                    Easy/Medium/Hard assignment criteria
                  </p>
                  <p>
                    • <strong>CROSS-VALIDATION:</strong> Use second AI to
                    validate first AI's analysis
                  </p>
                  <p>
                    • <strong>MULTI-LLM SUPPORT:</strong> Choose between OpenAI
                    and Claude for analysis
                  </p>
                  <p>
                    • <strong>SCORING SYSTEM:</strong> Get numerical scores out
                    of 10 for all analyses
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
