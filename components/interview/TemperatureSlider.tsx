// components/interview/TemperatureSlider.tsx
interface TemperatureSliderProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function TemperatureSlider({
  value,
  onChange,
  disabled,
}: TemperatureSliderProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Creativity: {value}
      </label>
      <input
        type="range"
        min="0"
        max="2"
        step="0.1"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        disabled={disabled}
      />
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>Focused</span>
        <span>Balanced</span>
        <span>Creative</span>
      </div>
    </div>
  );
}
