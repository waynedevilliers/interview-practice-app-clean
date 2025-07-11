// hooks/useAdminPanel.ts - REPLACE your existing useAdminPanel hook
import { useState, useCallback } from "react";
import type {
  ExtendedAnalysisType,
  ValidationSettings,
  AnalysisMetadata,
} from "@/types/admin";

export function useAdminPanel() {
  // State
  const [analysisType, setAnalysisType] =
    useState<ExtendedAnalysisType>("github-security");
  const [repoUrl, setRepoUrl] = useState<string>(
    "https://github.com/your-username/interview-practice-app"
  );
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

  // Generate project criteria prompt (moved from component)
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
- "lib/ai.ts" = LangChain ❌  
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

  // Generate cross-validation prompt (moved from component)
  const generateCrossValidationPrompt = useCallback(
    (
      originalAnalysis: string,
      validatorProvider: "openai" | "claude"
    ): string => {
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

  // Clear results when analysis type changes
  const handleAnalysisTypeChange = useCallback(
    (newType: ExtendedAnalysisType) => {
      setAnalysisType(newType);
      setAnalysis(null);
      setValidationResult(null);
      setMetadata(null);
      setError(null);
    },
    []
  );

  // Update validation settings
  const updateValidationSettings = useCallback(
    (key: keyof ValidationSettings, value: any) => {
      setValidationSettings((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  // Main analysis handler (moved from component)
  const handleAnalysis = useCallback(async () => {
    console.log("🔍 handleAnalysis called!"); // Add this
    console.log("🔍 Current state:", {
      analysisType,
      repoUrl,
      validationSettings,
    });
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
          repoUrl: repoUrl,
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

  // Copy analysis to clipboard
  const handleCopyAnalysis = useCallback(() => {
    const fullAnalysis = validationResult
      ? `${analysis}\n\n--- CROSS-VALIDATION REPORT ---\n${validationResult}`
      : analysis;

    if (fullAnalysis) {
      navigator.clipboard.writeText(fullAnalysis);
    }
  }, [analysis, validationResult]);

  // Clear all results
  const handleClearResults = useCallback(() => {
    setAnalysis(null);
    setValidationResult(null);
    setMetadata(null);
    setError(null);
  }, []);

  // Open repository in new tab
  const handleViewRepository = useCallback(() => {
    window.open(repoUrl, "_blank");
  }, [repoUrl]);

  return {
    // State
    analysisType,
    repoUrl,
    validationSettings,
    isLoading,
    analysis,
    validationResult,
    metadata,
    error,

    // Setters
    setAnalysisType: handleAnalysisTypeChange,
    setRepoUrl,
    updateValidationSettings,

    // Handlers
    handleAnalysis,
    handleCopyAnalysis,
    handleClearResults,
    handleViewRepository,
  };
}
