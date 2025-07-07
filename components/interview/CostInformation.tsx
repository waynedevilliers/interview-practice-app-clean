// components/interview/CostInformation.tsx
interface CostInfo {
  estimatedTokens: number;
  estimatedCost: number;
  actualTokens?: number;
  actualCost?: number;
}

interface CostInformationProps {
  costInfo: CostInfo;
  modelName: string;
}

export function CostInformation({ costInfo, modelName }: CostInformationProps) {
  return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-green-800 mb-2">
        Cost Information
      </h3>
      <div className="text-sm text-green-700 space-y-1">
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
        <div className="text-xs text-green-600 mt-2">
          Using {modelName} model
        </div>
      </div>
    </div>
  );
}
