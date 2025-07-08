// components/interview/JobRoleInput.tsx
interface JobRoleInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function JobRoleInput({ value, onChange, disabled }: JobRoleInputProps) {
  return (
    <div>
      <label
        htmlFor="job-role"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Job Role *
      </label>
      <input
        id="job-role"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g., Frontend Developer, Data Scientist"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        required
        disabled={disabled}
      />
    </div>
  );
}
