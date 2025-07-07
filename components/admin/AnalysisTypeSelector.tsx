// components/admin/AnalysisTypeSelector.tsx - UPDATED VERSION
import type { ExtendedAnalysisType } from "@/types/admin";

interface AnalysisTypeSelectorProps {
  value: ExtendedAnalysisType;
  onChange: (value: ExtendedAnalysisType) => void;
  disabled?: boolean;
}

export function AnalysisTypeSelector({ value, onChange, disabled }: AnalysisTypeSelectorProps) {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value as ExtendedAnalysisType);
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <label
        htmlFor="analysis-type"
        className="block text-sm font-medium text-gray-700 mb-3"
      >
        Analysis Type:
      </label>
      <select
        id="analysis-type"
        value={value}
        onChange={handleChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
        disabled={disabled}
      >
        <optgroup label="🎯 Project Criteria Validation">
          <option value="project-criteria-easy">📝 Easy Level Requirements (Score /10)</option>
          <option value="project-criteria-medium">📊 Medium Level Requirements (Score /10)</option>
          <option value="project-criteria-hard">🏆 Hard Level Requirements (Score /10)</option>
        </optgroup>
        <optgroup label="🔗 GitHub Code Analysis">
          <option value="github-security">🔒 Security Vulnerabilities</option>
          <option value="github-codeQuality">✨ Code Quality Review</option>
          <option value="github-architecture">🏗️ Architecture Analysis</option>
          <option value="github-performance">⚡ Performance Analysis</option>
          <option value="github-critical">🚨 Critical Issues ONLY</option>
          <option value="github-production">🚀 Production Readiness</option>
          <option value="github-final">✅ Final Validation Review</option>
        </optgroup>
        <optgroup label="📝 Conceptual Analysis">
          <option value="usability">🎨 Usability & UX Design</option>
          <option value="promptEngineering">🤖 Prompt Engineering</option>
          <option value="overall">📊 Overall Assessment</option>
        </optgroup>
      </select>
    </div>
  );
}