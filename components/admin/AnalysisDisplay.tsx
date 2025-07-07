// components/admin/AnalysisDisplay.tsx
import type { AnalysisMetadata } from "@/types/admin";

interface AnalysisDisplayProps {
  analysis: string;
  provider: "openai" | "claude";
  metadata: AnalysisMetadata | null;
}

export function AnalysisDisplay({
  analysis,
  provider,
  metadata,
}: AnalysisDisplayProps) {
  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-purple-800">
          🔍 Primary Analysis ({provider === "openai" ? "OpenAI" : "Claude"})
        </h3>
        {metadata && (
          <div className="text-sm text-purple-600">📊 Analysis completed</div>
        )}
      </div>

      <div className="bg-white border border-purple-200 rounded p-4 max-h-[400px] overflow-y-auto">
        <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
          {analysis}
        </pre>
      </div>
    </div>
  );
}
