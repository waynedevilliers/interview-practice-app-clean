// components/admin/AdminHeader.tsx
interface AdminHeaderProps {
  onClose: () => void;
}

export function AdminHeader({ onClose }: AdminHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-gray-800">
        🔧 Enhanced Admin: Multi-LLM Analysis Panel
      </h2>
      <button
        onClick={onClose}
        className="text-gray-500 hover:text-gray-700 text-2xl"
        aria-label="Close admin panel"
      >
        ×
      </button>
    </div>
  );
}
