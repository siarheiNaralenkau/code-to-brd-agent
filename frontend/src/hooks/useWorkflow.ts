import { useState } from 'react';
import type { WorkflowState, WorkflowStep } from '../types';
import {
  cloneRepository,
  parseRepository,
  extractFeatures,
  generateBrd,
  getErrorMessage,
} from '../api/client';

const INITIAL_STATE: WorkflowState = {
  step: 'clone',
  repoId: null,
  jobId: null,
  brdId: null,
  model: 'claude-sonnet-4-5',
  parseResult: null,
  featuresResult: null,
  brdResult: null,
  loading: false,
  error: null,
};

export function useWorkflow() {
  const [state, setState] = useState<WorkflowState>(INITIAL_STATE);

  function setLoading(loading: boolean) {
    setState((s) => ({ ...s, loading, error: null }));
  }

  function setError(error: string) {
    setState((s) => ({ ...s, loading: false, error }));
  }

  function setStep(step: WorkflowStep) {
    setState((s) => ({ ...s, step }));
  }

  function setModel(model: string) {
    setState((s) => ({ ...s, model }));
  }

  async function handleClone(url: string) {
    setLoading(true);
    try {
      const repo = await cloneRepository(url);
      setState((s) => ({ ...s, loading: false, repoId: repo.repoId, step: 'parse' }));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  function handleSelectRepo(repoId: string) {
    setState((s) => ({ ...s, repoId, step: 'parse' }));
  }

  async function handleParse() {
    if (!state.repoId) return;
    setLoading(true);
    try {
      const result = await parseRepository(state.repoId);
      setState((s) => ({ ...s, loading: false, parseResult: result, step: 'features' }));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleExtractFeatures() {
    if (!state.repoId) return;
    setLoading(true);
    try {
      const result = await extractFeatures(state.repoId, state.model);
      setState((s) => ({
        ...s,
        loading: false,
        featuresResult: result,
        jobId: result.jobId,
        step: 'brd',
      }));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleGenerateBrd() {
    if (!state.repoId || !state.jobId) return;
    setLoading(true);
    try {
      const result = await generateBrd(state.repoId, state.jobId, state.model);
      setState((s) => ({ ...s, loading: false, brdResult: result, brdId: result.brdId }));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  function reset() {
    setState(INITIAL_STATE);
  }

  return {
    state,
    setModel,
    setStep,
    handleClone,
    handleSelectRepo,
    handleParse,
    handleExtractFeatures,
    handleGenerateBrd,
    reset,
  };
}
