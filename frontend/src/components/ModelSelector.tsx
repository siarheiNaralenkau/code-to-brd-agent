import './ModelSelector.css';

interface ModelSelectorProps {
  value: string;
  onChange: (model: string) => void;
  disabled?: boolean;
}

const MODELS = [
  { id: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5 (fastest)' },
  { id: 'claude-sonnet-4-5', label: 'Claude Sonnet 4.5 (recommended)' },
  { id: 'claude-opus-4-5', label: 'Claude Opus 4.5 (most capable)' },
];

export function ModelSelector({ value, onChange, disabled }: ModelSelectorProps) {
  return (
    <div className="model-selector">
      <label htmlFor="model-select" className="model-selector__label">
        Anthropic Model
      </label>
      <select
        id="model-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="model-selector__select"
      >
        {MODELS.map((m) => (
          <option key={m.id} value={m.id}>{m.label}</option>
        ))}
      </select>
    </div>
  );
}
