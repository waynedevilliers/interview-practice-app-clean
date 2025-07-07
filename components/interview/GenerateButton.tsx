// components/interview/GenerateButton.tsx
interface GenerateButtonProps {
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  disabled: boolean;
}

export function GenerateButton({
  onSubmit,
  isLoading,
  disabled,
}: GenerateButtonProps) {
  return (
    <button
      onClick={onSubmit}
      disabled={isLoading || disabled}
      className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium text-lg"
    >
      {isLoading ? "Generating..." : "🚀 Generate Question"}
    </button>
  );
}
