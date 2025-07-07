// components/interview/AdminToggleButton.tsx
interface AdminToggleButtonProps {
  onToggle: () => void;
}

export function AdminToggleButton({ onToggle }: AdminToggleButtonProps) {
  return (
    <div className="fixed bottom-4 right-4">
      <button
        onClick={onToggle}
        className="bg-purple-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-purple-700 transition-colors"
      >
        Admin Panel
      </button>
    </div>
  );
}
