interface EnhancedGenerateButtonProps {
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  disabled: boolean;
  provider: "openai" | "claude";
}

export function EnhancedGenerateButton({
  onSubmit,
  isLoading,
  disabled,
  provider,
}: EnhancedGenerateButtonProps) {
  return (
    <button
      onClick={onSubmit}
      disabled={isLoading || disabled}
      className={`w-full text-white py-3 px-6 rounded-lg hover:opacity-90 disabled:bg-gray-400 transition-colors font-medium text-lg ${
        provider === "openai"
          ? "bg-green-600 hover:bg-green-700"
          : "bg-purple-600 hover:bg-purple-700"
      }`}
    >
      {isLoading
        ? "Generating..."
        : `🚀 Generate with ${provider === "openai" ? "OpenAI" : "Claude"}`}
    </button>
  );
}
