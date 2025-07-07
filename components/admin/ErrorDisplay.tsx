// components/admin/ErrorDisplay.tsx
interface ErrorDisplayProps {
  error: string;
}

export function ErrorDisplay({ error }: ErrorDisplayProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-center">
        <span className="text-red-400 text-xl mr-3">❌</span>
        <div>
          <h3 className="text-sm font-medium text-red-800">Analysis Error</h3>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    </div>
  );
}
