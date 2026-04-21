import type { FeaturesResponse, ParseResponse, TokenUsageSummary } from '../types';
import './RequirementsViewer.css';

interface RequirementsViewerProps {
  parseResult: ParseResponse | null;
  featuresResult: FeaturesResponse | null;
  onExtractFeatures: () => void;
  onGenerateBrd: () => void;
  loading: boolean;
  step: string;
}

export function RequirementsViewer({
  parseResult,
  featuresResult,
  onExtractFeatures,
  onGenerateBrd,
  loading,
  step,
}: RequirementsViewerProps) {
  return (
    <div>
      {parseResult && (
        <div className="requirements-viewer__parse-summary">
          <h3 style={{ marginTop: 0 }}>AST Parse Summary</h3>
          <div className="requirements-viewer__stats">
            <Stat label="Files parsed" value={parseResult.fileCount} />
            <Stat label="Languages" value={parseResult.languages.join(', ') || '—'} />
          </div>
        </div>
      )}

      {step === 'features' && !featuresResult && (
        <div>
          <h2 style={{ marginTop: 0 }}>Extract Feature Requirements</h2>
          <p className="requirements-viewer__description">
            This step uses Claude to analyze the AST and produce structured feature-level requirements.
          </p>
          <button
            onClick={onExtractFeatures}
            disabled={loading}
            className="requirements-viewer__extract-button"
          >
            {loading ? 'Extracting...' : 'Extract Feature Requirements'}
          </button>
        </div>
      )}

      {featuresResult && (
        <div>
          <h3>Feature Requirements ({featuresResult.features.length} features)</h3>
          <div className="requirements-viewer__feature-list">
            {featuresResult.features.length > 0 ? (
              featuresResult.features.map((f) => (
                <div key={f.featureId} className="requirements-viewer__feature">
                  <strong>{f.featureId}: {f.name}</strong>
                  <ul style={{ margin: '6px 0', paddingLeft: 20 }}>
                    {f.requirements.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              ))
            ) : (
              <pre className="requirements-viewer__raw-text">{featuresResult.rawText.slice(0, 2000)}</pre>
            )}
          </div>

          {featuresResult.tokenUsage && (
            <TokenUsagePanel
              title="Step 3 — Feature Extraction"
              usage={featuresResult.tokenUsage}
            />
          )}

          {step === 'brd' && (
            <button
              onClick={onGenerateBrd}
              disabled={loading}
              className="requirements-viewer__brd-button"
            >
              {loading ? 'Generating BRD...' : 'Generate BRD Document'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function TokenUsagePanel({ title, usage }: { title: string; usage: TokenUsageSummary }) {
  return (
    <div className="token-usage-panel">
      <div className="token-usage-panel__header">{title} — Token Usage &amp; Cost</div>
      <div className="token-usage-panel__grid">
        <TokenStat label="Input tokens" value={usage.inputTokens.toLocaleString()} />
        <TokenStat label="Output tokens" value={usage.outputTokens.toLocaleString()} />
        {usage.cacheCreationInputTokens > 0 && (
          <TokenStat label="Cache write tokens" value={usage.cacheCreationInputTokens.toLocaleString()} />
        )}
        {usage.cacheReadInputTokens > 0 && (
          <TokenStat label="Cache read tokens" value={usage.cacheReadInputTokens.toLocaleString()} />
        )}
        <TokenStat
          label="Estimated cost"
          value={`$${usage.totalCost.toFixed(6)}`}
          highlight
        />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="stat">
      <div className="stat__value">{value}</div>
      <div className="stat__label">{label}</div>
    </div>
  );
}

function TokenStat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`token-stat${highlight ? ' token-stat--highlight' : ''}`}>
      <span className="token-stat__label">{label}:</span>
      <span className="token-stat__value">{value}</span>
    </div>
  );
}
