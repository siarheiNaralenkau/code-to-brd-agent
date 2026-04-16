import { useState } from 'react';
import { useWorkflow } from '../hooks/useWorkflow';
import { ModelSelector } from '../components/ModelSelector';
import { StepProgress } from '../components/StepProgress';
import { RepositoryCloner } from '../components/RepositoryCloner';
import { RepositorySelector } from '../components/RepositorySelector';
import { RequirementsViewer } from '../components/RequirementsViewer';
import { BrdDownload } from '../components/BrdDownload';
import { AstTreeViewer } from '../components/AstTreeViewer';
import './WorkflowPage.css';

type RepoMode = 'clone' | 'select';

export function WorkflowPage() {
  const {
    state,
    setModel,
    setStep,
    handleClone,
    handleSelectRepo,
    handleParse,
    handleExtractFeatures,
    handleGenerateBrd,
    reset,
  } = useWorkflow();

  const [repoMode, setRepoMode] = useState<RepoMode>('clone');

  function handleReset() {
    setRepoMode('clone');
    reset();
  }

  return (
    <div className="workflow-page">
      <div className="workflow-page__header">
        <h1 className="workflow-page__title">Code to BRD Agent</h1>
        <button onClick={handleReset} className="workflow-page__reset-button">
          Start Over
        </button>
      </div>
      <p className="workflow-page__description">
        Clone a GitHub repository or select an existing one, parse it with tree-sitter, and generate a Business Requirements Document using Claude.
      </p>

      <StepProgress currentStep={state.step} />

      <ModelSelector value={state.model} onChange={setModel} disabled={state.loading} />

      {state.error && (
        <div className="workflow-page__error">
          {state.error}
        </div>
      )}

      <div className="workflow-page__card">
        {/* Step 1: Repository — clone new or select existing */}
        {state.step === 'clone' && !state.repoId && (
          <>
            <div className="workflow-page__mode-tabs">
              <button
                className={`workflow-page__mode-tab${repoMode === 'clone' ? ' workflow-page__mode-tab--active' : ''}`}
                onClick={() => setRepoMode('clone')}
              >
                Clone New Repository
              </button>
              <button
                className={`workflow-page__mode-tab${repoMode === 'select' ? ' workflow-page__mode-tab--active' : ''}`}
                onClick={() => setRepoMode('select')}
              >
                Select Existing Repository
              </button>
            </div>

            {repoMode === 'clone' ? (
              <RepositoryCloner
                onClone={handleClone}
                loading={state.loading}
                repoId={null}
              />
            ) : (
              <div>
                <h2 style={{ marginTop: 0 }}>Select Repository</h2>
                <RepositorySelector
                  onSelect={handleSelectRepo}
                  loading={state.loading}
                />
              </div>
            )}
          </>
        )}

        {/* Show success banner after repo is set */}
        {state.repoId && state.step !== 'clone' && (
          <RepositoryCloner
            onClone={handleClone}
            loading={false}
            repoId={state.repoId}
          />
        )}

        {/* Step 2: Parse */}
        {state.step === 'parse' && (
          <div className="workflow-page__section">
            <h2 style={{ marginTop: 0 }}>Parse Repository AST</h2>
            <p className="workflow-page__description">
              Use tree-sitter to parse source files and extract classes, functions, and structure.
            </p>
            {!state.parseResult ? (
              <button
                onClick={handleParse}
                disabled={state.loading}
                className="workflow-page__parse-button"
              >
                {state.loading ? 'Parsing...' : 'Parse Repository'}
              </button>
            ) : (
              <>
                <AstTreeViewer parseResult={state.parseResult} />
                <div className="workflow-page__parse-actions">
                  <button
                    onClick={() => setStep('features')}
                    className="workflow-page__proceed-button"
                  >
                    Proceed to Feature Extraction →
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Steps 3 & 4: Features + BRD */}
        {(state.step === 'features' || state.step === 'brd') && (
          <div className="workflow-page__section">
            <RequirementsViewer
              parseResult={state.parseResult}
              featuresResult={state.featuresResult}
              onExtractFeatures={handleExtractFeatures}
              onGenerateBrd={handleGenerateBrd}
              loading={state.loading}
              step={state.step}
            />
          </div>
        )}

        {/* Step 4 result: BRD download */}
        {state.brdResult && (
          <div className="workflow-page__section">
            <BrdDownload brdResult={state.brdResult} />
          </div>
        )}
      </div>

      <div className="workflow-page__footer">
        <a href="/api/docs" target="_blank" rel="noreferrer" className="workflow-page__api-link">
          API Documentation (Swagger)
        </a>
      </div>
    </div>
  );
}
