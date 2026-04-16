import { useState, useEffect } from 'react';
import { listRepositories } from '../api/client';
import type { RepoInfo } from '../types';
import './RepositorySelector.css';

interface RepositorySelectorProps {
  onSelect: (repoId: string) => void;
  loading: boolean;
}

export function RepositorySelector({ onSelect, loading }: RepositorySelectorProps) {
  const [repos, setRepos] = useState<RepoInfo[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fetching, setFetching] = useState(true);
  const [selectedId, setSelectedId] = useState<string>('');

  useEffect(() => {
    listRepositories()
      .then((list) => {
        setRepos(list);
        if (list.length > 0) setSelectedId(list[0].repoId);
      })
      .catch(() => setFetchError('Failed to load repositories.'))
      .finally(() => setFetching(false));
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedId) onSelect(selectedId);
  }

  if (fetching) {
    return <p className="repo-selector__status">Loading repositories…</p>;
  }

  if (fetchError) {
    return <p className="repo-selector__error">{fetchError}</p>;
  }

  if (repos.length === 0) {
    return (
      <p className="repo-selector__status">
        No repositories found. Clone one first.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="repo-selector__form">
      <select
        className="repo-selector__select"
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        disabled={loading}
      >
        {repos.map((repo) => (
          <option key={repo.repoId} value={repo.repoId}>
            {repo.name}
            {repo.clonedAt ? ` — ${new Date(repo.clonedAt).toLocaleDateString()}` : ''}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={loading || !selectedId}
        className="repo-selector__button"
      >
        {loading ? 'Loading…' : 'Select'}
      </button>
    </form>
  );
}
