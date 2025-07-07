// components/interview/AdvancedSettings.tsx
interface OpenAISettings {
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  model: string;
}

interface AdvancedSettingsProps {
  settings: OpenAISettings;
  onSettingChange: (key: keyof OpenAISettings, value: number | string) => void;
  disabled?: boolean;
}

export function AdvancedSettings({
  settings,
  onSettingChange,
  disabled,
}: AdvancedSettingsProps) {
  return (
    <>
      {/* Max Tokens */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Response Length: {settings.maxTokens} tokens
        </label>
        <input
          type="range"
          min="100"
          max="2000"
          step="100"
          value={settings.maxTokens}
          onChange={(e) =>
            onSettingChange("maxTokens", parseInt(e.target.value))
          }
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          disabled={disabled}
        />
      </div>

      {/* Top P */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Focus: {settings.topP}
        </label>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.1"
          value={settings.topP}
          onChange={(e) => onSettingChange("topP", parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          disabled={disabled}
        />
      </div>

      {/* Frequency Penalty */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Repetition Control: {settings.frequencyPenalty}
        </label>
        <input
          type="range"
          min="0"
          max="2"
          step="0.1"
          value={settings.frequencyPenalty}
          onChange={(e) =>
            onSettingChange("frequencyPenalty", parseFloat(e.target.value))
          }
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          disabled={disabled}
        />
      </div>
    </>
  );
}
