// components/admin/AnalysisResults.tsx
import { ErrorDisplay } from "./ErrorDisplay";
import { AnalysisDisplay } from "./AnalysisDisplay";
import { CrossValidationDisplay } from "./CrossValidationDisplay";
import { ActionButtons } from "./ActionButtons";
import { WelcomeMessage } from "./WelcomeMessage";
import { InfoPanel } from "./InfoPanel";
import type { AnalysisMetadata, ValidationSettings } from "@/types/admin";

interface AnalysisResultsProps {
  analysis: string | null;
  validationResult: string | null;
  error: string | null;
  metadata: AnalysisMetadata | null;
  isLoading: boolean;
  onCopy: () => void;
  onClear: () => void;
  onViewRepository: () => void;
  validationSettings: ValidationSettings;
}

export function AnalysisResults({
  analysis,
  validationResult,
  error,
  metadata,
  isLoading,
  onCopy,
  onClear,
  onViewRepository,
  validationSettings,
}: AnalysisResultsProps) {
  return (
    <div className="lg:col-span-2 space-y-6">
      {/* Error Display */}
      {error && <ErrorDisplay error={error} />}

      {/* Primary Analysis Results */}
      {analysis && (
        <AnalysisDisplay
          analysis={analysis}
          provider={validationSettings.primaryProvider}
          metadata={metadata}
        />
      )}

      {/* Cross-Validation Results */}
      {validationResult && (
        <CrossValidationDisplay
          validationResult={validationResult}
          validatorProvider={validationSettings.validatorProvider}
        />
      )}

      {/* Action Buttons */}
      {(analysis || validationResult) && (
        <ActionButtons
          onCopy={onCopy}
          onClear={onClear}
          onViewRepository={onViewRepository}
          showViewRepository={!!metadata?.repositoryName}
        />
      )}

      {/* Welcome Message */}
      {!analysis && !error && !isLoading && <WelcomeMessage />}

      {/* Info Panel */}
      <InfoPanel />
    </div>
  );
}
