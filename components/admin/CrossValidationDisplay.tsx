// components/admin/CrossValidationDisplay.tsx
interface CrossValidationDisplayProps {
  validationResult: string;
  validatorProvider: "openai" | "claude";
}

export function CrossValidationDisplay({
  validationResult,
  validatorProvider,
}: CrossValidationDisplayProps) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-amber-800 mb-4">
        🤝 Cross-Validation Report (
        {validatorProvider === "openai" ? "OpenAI" : "Claude"} Validator)
      </h3>
      <div className="bg-white border border-amber-200 rounded p-4 max-h-[300px] overflow-y-auto">
        <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
          {validationResult}
        </pre>
      </div>
    </div>
  );
}
