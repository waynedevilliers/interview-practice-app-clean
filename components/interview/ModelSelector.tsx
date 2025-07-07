// components/interview/ModelSelector.tsx
interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function ModelSelector({
  value,
  onChange,
  disabled,
}: ModelSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        AI Model
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        disabled={disabled}
      >
        <option value="gpt-4-turbo">GPT-4 Turbo (Recommended)</option>
        <option value="gpt-4">GPT-4 (Premium)</option>
        <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Fast)</option>
      </select>
    </div>
  );
}
