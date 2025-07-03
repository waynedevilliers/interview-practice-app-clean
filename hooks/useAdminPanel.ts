import { useState, useCallback } from "react";

interface AnalysisMetadata {
  repo: string;
  filesAnalyzed: number;
  timestamp: string;
}

export function useAdminPanel() {
  const [analysisType, setAnalysisType] = useState("github-security");
  const [repoUrl, setRepoUrl] = useState(
    "https://github.com/your-username/interview-practice-app"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<AnalysisMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGitHubAnalysis = useCallback(async () => {
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
  }, [repoUrl, analysisType]);

  const handleDescriptiveAnalysis = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const critiquePrompts: Record<string, string> = {
      usability: `Analyze the usability of this Interview Practice App...`,
      promptEngineering: `Analyze the prompt engineering quality...`,
      overall: `Provide overall assessment...`,
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
      setError("Network error during analysis");
    } finally {
      setIsLoading(false);
    }
  }, [analysisType]);

  const clearResults = useCallback(() => {
    setAnalysis(null);
    setMetadata(null);
    setError(null);
  }, []);

  return {
    analysisType,
    setAnalysisType,
    repoUrl,
    setRepoUrl,
    isLoading,
    analysis,
    metadata,
    error,
    handleGitHubAnalysis,
    handleDescriptiveAnalysis,
    clearResults,
  };
}
