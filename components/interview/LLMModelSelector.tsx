const LLM_MODELS = {
  openai: [
    { value: "gpt-4o-mini", label: "GPT-4o Mini (Recommended)" },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
    { value: "gpt-4", label: "GPT-4 (Premium)" },
    { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo (Fast)" },
  ],
  claude: [
    {
      value: "claude-3-5-sonnet-20241022",
      label: "Claude 3.5 Sonnet (Recommended)",
    },
    { value: "claude-3-haiku-20240307", label: "Claude 3 Haiku (Fast)" },
    { value: "claude-3-opus-20240229", label: "Claude 3 Opus (Premium)" },
  ],
};

interface LLMModelSelectorProps {
  provider: "openai" | "claude";
  value: string;
  onChange: (model: string) => void;
  disabled?: boolean;
}

export function LLMModelSelector({
  provider,
  value,
  onChange,
  disabled,
}: LLMModelSelectorProps) {
  const availableModels = LLM_MODELS[provider];

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
        {availableModels.map((model) => (
          <option key={model.value} value={model.value}>
            {model.label}
          </option>
        ))}
      </select>
    </div>
  );
}
