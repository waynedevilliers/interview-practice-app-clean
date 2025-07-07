// components/admin/ProjectCriteriaInfo.tsx
import type { ExtendedAnalysisType } from "@/types/admin";

interface ProjectCriteriaInfoProps {
  analysisType: ExtendedAnalysisType;
}

export function ProjectCriteriaInfo({
  analysisType,
}: ProjectCriteriaInfoProps) {
  const getDescription = () => {
    switch (analysisType) {
      case "project-criteria-easy":
        return "Core requirements, API integration, 5+ prompts, basic security";
      case "project-criteria-medium":
        return "Advanced features, multi-LLM, cost tracking, deployment";
      case "project-criteria-hard":
        return "Production-ready, LangChain, vector DB, fine-tuning";
      default:
        return "";
    }
  };

  const getLevel = () => {
    switch (analysisType) {
      case "project-criteria-easy":
        return "Easy Level";
      case "project-criteria-medium":
        return "Medium Level";
      case "project-criteria-hard":
        return "Hard Level";
      default:
        return "";
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h4 className="font-medium text-blue-800 mb-2">🎯 Project Validation:</h4>
      <div className="text-sm text-blue-700">
        <p>
          <strong>{getLevel()}:</strong> {getDescription()}
        </p>
      </div>
    </div>
  );
}
