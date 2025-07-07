import { LLMProviderSelector } from "./LLMProviderSelector";
import { LLMModelSelector } from "./LLMModelSelector";
import { TemperatureSlider } from "./TemperatureSlider";
import { LLMAdvancedSettings } from "./LLMAdvancedSettings";

interface LLMProviderSettingsProps {
  settings: LLMSettings;
  showAdvanced: boolean;
  isLoading: boolean;
  onSettingChange: (key: keyof LLMSettings, value: number | string) => void;
  onToggleAdvanced: () => void;
}

export function LLMProviderSettings({
  settings,
  showAdvanced,
  isLoading,
  onSettingChange,
  onToggleAdvanced,
}: LLMProviderSettingsProps) {
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
        <LLMProviderSelector
          value={settings.provider}
          onChange={(provider) => onSettingChange("provider", provider)}
          disabled={isLoading}
        />

        <LLMModelSelector
          provider={settings.provider}
          value={settings.model}
          onChange={(model) => onSettingChange("model", model)}
          disabled={isLoading}
        />

        <TemperatureSlider
          value={settings.temperature}
          onChange={(temp) => onSettingChange("temperature", temp)}
          disabled={isLoading}
        />

        {showAdvanced && (
          <LLMAdvancedSettings
            settings={settings}
            onSettingChange={onSettingChange}
            disabled={isLoading}
          />
        )}
      </div>
    </div>
  );
}
