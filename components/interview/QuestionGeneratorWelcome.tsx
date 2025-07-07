export function QuestionGeneratorWelcome() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 text-center">
      <div className="text-6xl mb-4" aria-hidden="true">
        🤖
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        Ready to Practice!
      </h3>
      <p className="text-gray-600 mb-4">
        Choose your AI provider and generate your first interview question.
      </p>
      <div className="text-sm text-gray-500 space-y-1">
        <p>
          💡 <strong>Step 1:</strong> Choose OpenAI or Claude
        </p>
        <p>
          ⚙️ <strong>Step 2:</strong> Configure your preferences
        </p>
        <p>
          ✍️ <strong>Step 3:</strong> Generate and answer questions
        </p>
        <p>
          🎯 <strong>Step 4:</strong> Get AI feedback with cost tracking
        </p>
      </div>
    </div>
  );
}
