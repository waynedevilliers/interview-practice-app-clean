// components/admin/AdminPanel.tsx - NEW CLEAN VERSION
"use client";

import { AdminHeader } from "./AdminHeader";
import { AnalysisSettings } from "./AnalysisSettings";
import { AnalysisResults } from "./AnalysisResults";
import { useAdminPanel } from "@/hooks/useAdminPanel";

interface AdminPanelProps {
  isVisible: boolean;
  onToggle: () => void;
}

export default function AdminPanel({ isVisible, onToggle }: AdminPanelProps) {
  // All business logic moved to custom hook
  const {
    analysisType,
    repoUrl,
    validationSettings,
    isLoading,
    analysis,
    validationResult,
    metadata,
    error,
    setAnalysisType,
    setRepoUrl,
    updateValidationSettings,
    handleAnalysis,
    handleCopyAnalysis,
    handleClearResults,
    handleViewRepository,
  } = useAdminPanel();

  // Minimized UI - just composition
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
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        <div className="p-6">
          <AdminHeader onClose={onToggle} />

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column: Settings */}
            <AnalysisSettings
              analysisType={analysisType}
              repoUrl={repoUrl}
              validationSettings={validationSettings}
              isLoading={isLoading}
              onAnalysisTypeChange={setAnalysisType}
              onRepoUrlChange={setRepoUrl}
              onValidationSettingsChange={updateValidationSettings}
              onAnalyze={handleAnalysis}
            />

            {/* Right Column: Results */}
            <AnalysisResults
              analysis={analysis}
              validationResult={validationResult}
              error={error}
              metadata={metadata}
              isLoading={isLoading}
              onCopy={handleCopyAnalysis}
              onClear={handleClearResults}
              onViewRepository={handleViewRepository}
              validationSettings={validationSettings}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
