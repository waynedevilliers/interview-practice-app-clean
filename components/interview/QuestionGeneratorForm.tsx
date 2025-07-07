import { InterviewBasicSettings } from "./InterviewBasicSettings";
import { LLMProviderSettings } from "./LLMProviderSettings";
import { EnhancedCostInformation } from "./EnhancedCostInformation";
import { EnhancedGenerateButton } from "./EnhancedGenerateButton";

interface QuestionGeneratorFormProps {
  formData: InterviewFormData;
  jobDescription: string;
  llmSettings: LLMSettings;
  showAdvanced: boolean;
  costInfo: CostInfo | null;
  isLoading: boolean;
  onFormDataChange: (data: InterviewFormData) => void;
  onJobDescriptionChange: (description: string) => void;
  onSettingChange: (key: keyof LLMSettings, value: number | string) => void;
  onToggleAdvanced: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function QuestionGeneratorForm({
  formData,
  jobDescription,
  llmSettings,
  showAdvanced,
  costInfo,
  isLoading,
  onFormDataChange,
  onJobDescriptionChange,
  onSettingChange,
  onToggleAdvanced,
  onSubmit,
}: QuestionGeneratorFormProps) {
  return (
    <div className="space-y-6">
      {/* Basic Settings */}
      <InterviewBasicSettings
        formData={formData}
        jobDescription={jobDescription}
        isLoading={isLoading}
        onFormDataChange={onFormDataChange}
        onJobDescriptionChange={onJobDescriptionChange}
        onSubmit={onSubmit}
      />

      {/* AI Provider & Settings */}
      <LLMProviderSettings
        settings={llmSettings}
        showAdvanced={showAdvanced}
        isLoading={isLoading}
        onSettingChange={onSettingChange}
        onToggleAdvanced={onToggleAdvanced}
      />

      {/* Cost Information */}
      {costInfo && (
        <EnhancedCostInformation
          costInfo={costInfo}
          provider={llmSettings.provider}
          model={llmSettings.model}
        />
      )}

      {/* Generate Button */}
      <EnhancedGenerateButton
        onSubmit={onSubmit}
        isLoading={isLoading}
        disabled={!formData.jobRole.trim()}
        provider={llmSettings.provider}
      />
    </div>
  );
}
