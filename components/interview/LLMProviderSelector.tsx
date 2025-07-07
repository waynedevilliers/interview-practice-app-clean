interface LLMProviderSelectorProps {
  value: "openai" | "claude";
  onChange: (provider: "openai" | "claude") => void;
  disabled?: boolean;
}

export function LLMProviderSelector({
  value,
  onChange,
  disabled,
}: LLMProviderSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        AI Provider
      </label>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange("openai")}
          className={`p-3 border-2 rounded-lg transition-colors ${
            value === "openai"
              ? "border-green-500 bg-green-50 text-green-700"
              : "border-gray-300 hover:border-gray-400"
          }`}
          disabled={disabled}
        >
          <div className="font-medium">OpenAI</div>
          <div className="text-xs text-gray-500">GPT Models</div>
        </button>
        <button
          type="button"
          onClick={() => onChange("claude")}
          className={`p-3 border-2 rounded-lg transition-colors ${
            value === "claude"
              ? "border-purple-500 bg-purple-50 text-purple-700"
              : "border-gray-300 hover:border-gray-400"
          }`}
          disabled={disabled}
        >
          <div className="font-medium">Anthropic</div>
          <div className="text-xs text-gray-500">Claude Models</div>
        </button>
      </div>
    </div>
  );
}
