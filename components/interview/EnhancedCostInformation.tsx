import type { CostInfo } from "@/types/interview";

interface EnhancedCostInformationProps {
  costInfo: CostInfo;
  provider: "openai" | "claude";
  model: string;
}

export function EnhancedCostInformation({
  costInfo,
  provider,
  model,
}: EnhancedCostInformationProps) {
  return (
    <div
      className={`border-2 rounded-xl p-4 ${
        provider === "openai"
          ? "bg-green-50 border-green-200"
          : "bg-purple-50 border-purple-200"
      }`}
    >
      <h3
        className={`text-sm font-semibold mb-2 ${
          provider === "openai" ? "text-green-800" : "text-purple-800"
        }`}
      >
        Cost Information ({provider === "openai" ? "OpenAI" : "Claude"})
      </h3>
      <div
        className={`text-sm space-y-1 ${
          provider === "openai" ? "text-green-700" : "text-purple-700"
        }`}
      >
        <div className="flex justify-between">
          <span>Estimated Cost:</span>
          <span>${costInfo.estimatedCost.toFixed(4)}</span>
        </div>
        {costInfo.actualCost && (
          <div className="flex justify-between font-medium">
            <span>Actual Cost:</span>
            <span>${costInfo.actualCost.toFixed(4)}</span>
          </div>
        )}
        <div
          className={`text-xs mt-2 ${
            provider === "openai" ? "text-green-600" : "text-purple-600"
          }`}
        >
          Using {model}
        </div>
      </div>
    </div>
  );
}
