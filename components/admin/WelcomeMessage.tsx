// components/admin/WelcomeMessage.tsx
export function WelcomeMessage() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 text-center">
      <div className="text-6xl mb-4">🤖</div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        Enhanced Analysis Ready!
      </h3>
      <p className="text-gray-600 mb-4">
        Choose your analysis type and AI provider to get started.
      </p>
      <div className="text-sm text-gray-500 space-y-1">
        <p>
          🎯 <strong>Project Validation:</strong> Score your app against
          assignment criteria
        </p>
        <p>
          🤝 <strong>Cross-Validation:</strong> Get AI to validate other AI's
          analysis
        </p>
        <p>
          🔍 <strong>Multi-LLM:</strong> Compare OpenAI vs Claude insights
        </p>
        <p>
          📊 <strong>Scoring:</strong> Get numerical scores out of 10
        </p>
      </div>
    </div>
  );
}
