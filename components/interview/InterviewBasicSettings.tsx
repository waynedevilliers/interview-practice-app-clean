import { JobRoleInput } from "./JobRoleInput";
import { InterviewTypeSelector } from "./InterviewTypeSelector";
import { DifficultySlider } from "./DifficultySlider";
import { JobDescriptionInput } from "./JobDescriptionInput";

interface InterviewBasicSettingsProps {
  formData: InterviewFormData;
  jobDescription: string;
  isLoading: boolean;
  onFormDataChange: (data: InterviewFormData) => void;
  onJobDescriptionChange: (description: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function InterviewBasicSettings({
  formData,
  jobDescription,
  isLoading,
  onFormDataChange,
  onJobDescriptionChange,
  onSubmit,
}: InterviewBasicSettingsProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Interview Configuration
      </h2>

      <form onSubmit={onSubmit} className="space-y-4">
        <JobRoleInput
          value={formData.jobRole}
          onChange={(jobRole) => onFormDataChange({ ...formData, jobRole })}
          disabled={isLoading}
        />

        <InterviewTypeSelector
          value={formData.interviewType}
          onChange={(interviewType) =>
            onFormDataChange({
              ...formData,
              interviewType: interviewType as any,
            })
          }
          disabled={isLoading}
        />

        <DifficultySlider
          value={formData.difficulty}
          onChange={(difficulty) =>
            onFormDataChange({ ...formData, difficulty })
          }
          disabled={isLoading}
        />

        <JobDescriptionInput
          value={jobDescription}
          onChange={onJobDescriptionChange}
          disabled={isLoading}
        />
      </form>
    </div>
  );
}
