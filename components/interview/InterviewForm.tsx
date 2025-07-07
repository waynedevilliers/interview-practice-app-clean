"use client";

import { InterviewHeader } from "./InterviewHeader";
import { InterviewConfiguration } from "./InterviewConfiguration";
import { AISettingsPanel } from "./AISettingsPanel";
import { CostInformation } from "./CostInformation";
import { GenerateButton } from "./GenerateButton";
import { QuestionDisplay } from "./QuestionDisplay";
import { AdminToggleButton } from "./AdminToggleButton";
import { useInterviewForm } from "@/hooks/useInterviewForm";
import type { InterviewFormProps } from "@/types/interview";

export default function InterviewForm({
  onSubmit,
  isLoading = false,
  onToggleAdmin,
}: InterviewFormProps) {
  // All business logic moved to custom hook
  const {
    formData,
    jobDescription,
    openAISettings,
    question,
    error,
    costInfo,
    showAdvanced,
    setFormData,
    setJobDescription,
    updateSetting,
    setShowAdvanced,
    handleSubmit,
    isFormValid,
  } = useInterviewForm({ onSubmit });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <InterviewHeader />

        <div className="grid lg:grid-cols-2 gap-8 h-full">
          {/* Left Column - Controls */}
          <div className="space-y-6">
            <InterviewConfiguration
              formData={formData}
              jobDescription={jobDescription}
              isLoading={isLoading}
              onFormDataChange={setFormData}
              onJobDescriptionChange={setJobDescription}
            />

            <AISettingsPanel
              settings={openAISettings}
              showAdvanced={showAdvanced}
              onSettingChange={updateSetting}
              onToggleAdvanced={() => setShowAdvanced(!showAdvanced)}
            />

            {costInfo && (
              <CostInformation
                costInfo={costInfo}
                modelName={openAISettings.model}
              />
            )}

            <GenerateButton
              onSubmit={handleSubmit}
              isLoading={isLoading}
              disabled={!isFormValid}
            />
          </div>

          {/* Right Column - Question Display */}
          <QuestionDisplay
            question={question}
            error={error}
            isLoading={isLoading}
          />
        </div>

        <AdminToggleButton onToggle={onToggleAdmin} />
      </div>
    </div>
  );
}
