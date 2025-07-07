// components/admin/AnalyzeButton.tsx
interface AnalyzeButtonProps {
  onClick: () => void;
  disabled: boolean;
  isLoading: boolean;
  primaryProvider: "openai" | "claude";
  crossValidate: boolean;
}

export function AnalyzeButton({
  onClick,
  disabled,
  isLoading,
  primaryProvider,
  crossValidate,
}: AnalyzeButtonProps) {
  console.log("AnalyzeButton props:", {
    disabled,
    isLoading,
    primaryProvider,
    crossValidate,
    onClick: typeof onClick,
  });

  const getButtonText = () => {
    if (isLoading) {
      return crossValidate ? "Analyzing & Validating..." : "Analyzing...";
    }
    return `🔍 Analyze with ${
      primaryProvider === "openai" ? "OpenAI" : "Claude"
    }`;
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors font-medium text-sm"
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <svg
            className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {getButtonText()}
        </span>
      ) : (
        getButtonText()
      )}
    </button>
  );
}
