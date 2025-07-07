// components/interview/AISettingsPanel.tsx
import { ModelSelector } from "./ModelSelector";
import { TemperatureSlider } from "./TemperatureSlider";
import { AdvancedSettings } from "./AdvancedSettings";

interface OpenAISettings {
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  model: string;
}

interface AISettingsPanelProps {
  settings: OpenAISettings;
  showAdvanced: boolean;
  onSettingChange: (key: keyof OpenAISettings, value: number | string) => void;
  onToggleAdvanced: () => void;
}

export function AISettingsPanel({
  settings,
  showAdvanced,
  onSettingChange,
  onToggleAdvanced,
}: AISettingsPanelProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">AI Settings</h2>
        <button
          onClick={onToggleAdvanced}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          {showAdvanced ? "Hide Advanced" : "Show Advanced"}
        </button>
      </div>

      <div className="space-y-4">
        <ModelSelector
          value={settings.model}
          onChange={(value) => onSettingChange("model", value)}
        />

        <TemperatureSlider
          value={settings.temperature}
          onChange={(value) => onSettingChange("temperature", value)}
        />

        {showAdvanced && (
          <AdvancedSettings
            settings={settings}
            onSettingChange={onSettingChange}
          />
        )}
      </div>
    </div>
  );
}
