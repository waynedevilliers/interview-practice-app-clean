interface AnswerInputSectionProps {
  userAnswer: string;
  isEvaluating: boolean;
  onAnswerChange: (answer: string) => void;
  onSubmitAnswer: () => void;
}

export function AnswerInputSection({
  userAnswer,
  isEvaluating,
  onAnswerChange,
  onSubmitAnswer,
}: AnswerInputSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        ✍️ Your Answer
      </h3>

      <div className="space-y-4">
        <textarea
          value={userAnswer}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="Type your interview answer here... Be specific and use examples from your experience."
          rows={8}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isEvaluating}
          aria-label="Interview answer input"
        />

        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>{userAnswer.length} characters</span>
          <span>💡 Aim for 150-300 words</span>
        </div>

        <button
          onClick={onSubmitAnswer}
          disabled={isEvaluating || !userAnswer.trim()}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors font-medium"
        >
          {isEvaluating ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
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
              Evaluating Answer...
            </span>
          ) : (
            "🎯 Submit Answer for AI Evaluation"
          )}
        </button>
      </div>
    </div>
  );
}
