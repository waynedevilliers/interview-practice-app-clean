// components/admin/ActionButtons.tsx
interface ActionButtonsProps {
  onCopy: () => void;
  onClear: () => void;
  onViewRepository: () => void;
  showViewRepository: boolean;
}

export function ActionButtons({
  onCopy,
  onClear,
  onViewRepository,
  showViewRepository,
}: ActionButtonsProps) {
  return (
    <div className="flex gap-3 flex-wrap">
      <button
        onClick={onCopy}
        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm"
      >
        📋 Copy Analysis
      </button>
      <button
        onClick={onClear}
        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm"
      >
        🔄 Clear Results
      </button>
      {showViewRepository && (
        <button
          onClick={onViewRepository}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
        >
          🔗 View Repository
        </button>
      )}
    </div>
  );
}
