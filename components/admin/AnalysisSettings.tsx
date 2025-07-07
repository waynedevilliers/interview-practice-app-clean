// components/admin/AnalysisSettings.tsx
import { AnalysisTypeSelector } from "./AnalysisTypeSelector";
import { ValidationSettingsPanel } from "./ValidationSettingsPanel";
import { GitHubUrlInput } from "./GitHubUrlInput";
import { ProjectCriteriaInfo } from "./ProjectCriteriaInfo";
import { AnalyzeButton } from "./AnalyzeButton";
import type { ExtendedAnalysisType, ValidationSettings } from "@/types/admin";

interface AnalysisSettingsProps {
  analysisType: ExtendedAnalysisType;
  repoUrl: string;
  validationSettings: ValidationSettings;
  isLoading: boolean;
  onAnalysisTypeChange: (type: ExtendedAnalysisType) => void;
  onRepoUrlChange: (url: string) => void;
  onValidationSettingsChange: (
    key: keyof ValidationSettings,
    value: any
  ) => void;
  onAnalyze: () => void;
}

export function AnalysisSettings({
  analysisType,
  repoUrl,
  validationSettings,
  isLoading,
  onAnalysisTypeChange,
  onRepoUrlChange,
  onValidationSettingsChange,
  onAnalyze,
}: AnalysisSettingsProps) {
  const isGitHubAnalysis =
    analysisType.startsWith("github-") ||
    analysisType.startsWith("project-criteria");
  const isProjectCriteria = analysisType.startsWith("project-criteria");
  const isValidGitHubUrl = repoUrl.includes("github.com");

  return (
    <div className="space-y-6">
      <AnalysisTypeSelector
        value={analysisType}
        onChange={onAnalysisTypeChange}
        disabled={isLoading}
      />

      <ValidationSettingsPanel
        settings={validationSettings}
        onChange={onValidationSettingsChange}
        disabled={isLoading}
      />

      {isGitHubAnalysis && (
        <GitHubUrlInput
          value={repoUrl}
          onChange={onRepoUrlChange}
          disabled={isLoading}
        />
      )}

      {isProjectCriteria && <ProjectCriteriaInfo analysisType={analysisType} />}

      <AnalyzeButton
        onClick={onAnalyze}
        disabled={isLoading || (isGitHubAnalysis && !isValidGitHubUrl)}
        isLoading={isLoading}
        primaryProvider={validationSettings.primaryProvider}
        crossValidate={validationSettings.crossValidate}
      />
    </div>
  );
}
