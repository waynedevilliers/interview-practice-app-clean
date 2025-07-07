// components/admin/ValidationSettingsPanel.tsx
import { ProviderSelector } from "./ProviderSelector";
import type { ValidationSettings } from "@/types/admin";

interface ValidationSettingsPanelProps {
  settings: ValidationSettings;
  onChange: (key: keyof ValidationSettings, value: any) => void;
  disabled?: boolean;
}

export function ValidationSettingsPanel({
  settings,
  onChange,
  disabled,
}: ValidationSettingsPanelProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">
        AI Provider Settings
      </h3>

      {/* Primary Provider */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-600 mb-2">
          Primary Analyzer
        </label>
        <ProviderSelector
          value={settings.primaryProvider}
          onChange={(value) => onChange("primaryProvider", value)}
          disabled={disabled}
        />
      </div>

      {/* Cross-Validation Toggle */}
      <div className="mb-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={settings.crossValidate}
            onChange={(e) => onChange("crossValidate", e.target.checked)}
            className="rounded"
            disabled={disabled}
          />
          <span className="text-xs text-gray-700">Enable Cross-Validation</span>
        </label>
      </div>

      {/* Validator Provider (conditional) */}
      {settings.crossValidate && (
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-600 mb-2">
            Validator AI
          </label>
          <ProviderSelector
            value={settings.validatorProvider}
            onChange={(value) => onChange("validatorProvider", value)}
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
}
