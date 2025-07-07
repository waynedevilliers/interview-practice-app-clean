// components/interview/DifficultySlider.tsx
interface DifficultySliderProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function DifficultySlider({
  value,
  onChange,
  disabled,
}: DifficultySliderProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Difficulty: <span className="font-bold text-blue-600">{value}/10</span>
      </label>
      <input
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        disabled={disabled}
      />
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>Entry Level</span>
        <span>Senior Expert</span>
      </div>
    </div>
  );
}
