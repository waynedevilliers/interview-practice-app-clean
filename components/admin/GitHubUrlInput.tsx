// components/admin/GitHubUrlInput.tsx
interface GitHubUrlInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function GitHubUrlInput({
  value,
  onChange,
  disabled,
}: GitHubUrlInputProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <label
        htmlFor="repo-url"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        GitHub Repository URL:
      </label>
      <input
        id="repo-url"
        type="url"
        value={value}
        onChange={handleChange}
        placeholder="https://github.com/username/interview-practice-app"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
        disabled={disabled}
      />
    </div>
  );
}
