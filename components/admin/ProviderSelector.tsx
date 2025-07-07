// components/admin/ProviderSelector.tsx
interface ProviderSelectorProps {
  value: "openai" | "claude";
  onChange: (value: "openai" | "claude") => void;
  disabled?: boolean;
}

export function ProviderSelector({
  value,
  onChange,
  disabled,
}: ProviderSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        type="button"
        onClick={() => onChange("openai")}
        className={`p-2 text-xs border-2 rounded transition-colors ${
          value === "openai"
            ? "border-green-500 bg-green-50 text-green-700"
            : "border-gray-300 hover:border-gray-400"
        }`}
        disabled={disabled}
      >
        OpenAI GPT
      </button>
      <button
        type="button"
        onClick={() => onChange("claude")}
        className={`p-2 text-xs border-2 rounded transition-colors ${
          value === "claude"
            ? "border-purple-500 bg-purple-50 text-purple-700"
            : "border-gray-300 hover:border-gray-400"
        }`}
        disabled={disabled}
      >
        Claude
      </button>
    </div>
  );
}
