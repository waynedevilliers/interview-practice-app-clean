export function InfoPanel() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h4 className="font-medium text-blue-800 mb-2">🛠️ Enhanced Features:</h4>
      <div className="text-sm text-blue-700 space-y-1">
        <p>
          • <strong>PROJECT VALIDATION:</strong> Check against Easy/Medium/Hard
          assignment criteria
        </p>
        <p>
          • <strong>CROSS-VALIDATION:</strong> Use second AI to validate first
          AI's analysis
        </p>
        <p>
          • <strong>MULTI-LLM SUPPORT:</strong> Choose between OpenAI and Claude
          for analysis
        </p>
        <p>
          • <strong>SCORING SYSTEM:</strong> Get numerical scores out of 10 for
          all analyses
        </p>
      </div>
    </div>
  );
}
