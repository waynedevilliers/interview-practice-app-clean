interface EvaluationResultsProps {
  evaluation: any;
  onStartNew: () => void;
  onCopyFeedback: () => void;
}

export function EvaluationResults({
  evaluation,
  onStartNew,
  onCopyFeedback,
}: EvaluationResultsProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-800">🎯 AI Feedback</h3>
        <div
          className={`px-4 py-2 rounded-full font-bold text-white ${
            evaluation.score >= 8
              ? "bg-green-500"
              : evaluation.score >= 6
              ? "bg-yellow-500"
              : "bg-red-500"
          }`}
        >
          Score: {evaluation.score}/10
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
          {evaluation.rawFeedback}
        </pre>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onStartNew}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          🔄 Start New Question
        </button>
        <button
          onClick={onCopyFeedback}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
        >
          📋 Copy Feedback
        </button>
      </div>
    </div>
  );
}
