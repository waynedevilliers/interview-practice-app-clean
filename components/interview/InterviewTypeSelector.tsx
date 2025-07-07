// components/interview/InterviewTypeSelector.tsx
interface InterviewTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function InterviewTypeSelector({
  value,
  onChange,
  disabled,
}: InterviewTypeSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Interview Type
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        disabled={disabled}
      >
        <option value="technical">💻 Technical</option>
        <option value="behavioral">🧠 Behavioral</option>
        <option value="industry">🏢 Industry-Specific</option>
        <option value="system-design">🏗️ System Design</option>
        <option value="coding">⌨️ Coding Challenge</option>
        <option value="leadership">👥 Leadership</option>
        <option value="cultural-fit">🤝 Cultural Fit</option>
      </select>
    </div>
  );
}
