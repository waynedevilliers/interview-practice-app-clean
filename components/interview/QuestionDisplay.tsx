// components/interview/QuestionDisplay.tsx
interface QuestionDisplayProps {
  question?: string;
  error?: string;
  isLoading: boolean;
}

export function QuestionDisplay({
  question,
  error,
  isLoading,
}: QuestionDisplayProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6 h-full min-h-[600px]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Interview Question
          </h2>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg text-gray-600">
                Generating your question...
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-6xl mb-4 text-red-500">⚠️</div>
              <p className="text-lg text-red-600 mb-2">
                Error generating question
              </p>
              <p className="text-sm text-gray-500">{error}</p>
            </div>
          </div>
        )}

        {/* Question Display */}
        {question && !isLoading && !error && (
          <div className="prose max-w-none">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-gray-800 whitespace-pre-wrap">{question}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!question && !isLoading && !error && (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <div className="text-6xl mb-4">💭</div>
              <p className="text-lg">
                Configure your settings and generate an interview question
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Questions will appear here after generation
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
