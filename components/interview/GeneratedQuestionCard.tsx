interface GeneratedQuestionCardProps {
  question: any;
  onGenerateAnother: () => void;
  onCopyQuestion: () => void;
  isLoading: boolean;
}

export function GeneratedQuestionCard({
  question,
  onGenerateAnother,
  onCopyQuestion,
  isLoading,
}: GeneratedQuestionCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-800">
          📝 Your Interview Question
        </h3>
        {question.metadata.provider && (
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              question.metadata.provider === "openai"
                ? "bg-green-100 text-green-800"
                : "bg-purple-100 text-purple-800"
            }`}
          >
            {question.metadata.provider === "openai" ? "OpenAI" : "Claude"}
          </div>
        )}
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
        <p className="text-gray-700 leading-relaxed">{question.question}</p>
      </div>

      {/* Question Metadata */}
      <div className="border-t pt-4 mb-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-600">Role:</span>
            <p className="text-gray-800">{question.metadata.jobRole}</p>
          </div>
          <div>
            <span className="font-medium text-gray-600">Type:</span>
            <p className="text-gray-800 capitalize">
              {question.metadata.interviewType}
            </p>
          </div>
          <div>
            <span className="font-medium text-gray-600">Difficulty:</span>
            <p className="text-gray-800">{question.metadata.difficulty}/10</p>
          </div>
          <div>
            <span className="font-medium text-gray-600">Time:</span>
            <p className="text-gray-800">
              {new Date(question.metadata.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={onGenerateAnother}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          disabled={isLoading}
        >
          🔄 Generate Another
        </button>
        <button
          onClick={onCopyQuestion}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
        >
          📋 Copy Question
        </button>
      </div>
    </div>
  );
}
