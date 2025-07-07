// components/interview/InterviewConfiguration.tsx
import { JobRoleInput } from "./JobRoleInput";
import { InterviewTypeSelector } from "./InterviewTypeSelector";
import { DifficultySlider } from "./DifficultySlider";
import { JobDescriptionInput } from "./JobDescriptionInput";

interface FormData {
  jobRole: string;
  interviewType: string;
  difficulty: number;
}

interface InterviewConfigurationProps {
  formData: FormData;
  jobDescription: string;
  isLoading: boolean;
  onFormDataChange: (data: FormData) => void;
  onJobDescriptionChange: (description: string) => void;
}

export function InterviewConfiguration({
  formData,
  jobDescription,
  isLoading,
  onFormDataChange,
  onJobDescriptionChange,
}: InterviewConfigurationProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Interview Configuration
      </h2>

      <div className="space-y-4">
        <JobRoleInput
          value={formData.jobRole}
          onChange={(jobRole) => onFormDataChange({ ...formData, jobRole })}
          disabled={isLoading}
        />

        <InterviewTypeSelector
          value={formData.interviewType}
          onChange={(interviewType) =>
            onFormDataChange({ ...formData, interviewType })
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
      </div>
    </div>
  );
}
