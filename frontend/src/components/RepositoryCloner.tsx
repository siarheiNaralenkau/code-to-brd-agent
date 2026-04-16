import { useState } from 'react';
import './RepositoryCloner.css';

interface RepositoryClonerProps {
  onClone: (url: string) => void;
  loading: boolean;
  repoId: string | null;
}

export function RepositoryCloner({ onClone, loading, repoId }: RepositoryClonerProps) {
  const [url, setUrl] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (url.trim()) onClone(url.trim());
  }

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Clone GitHub Repository</h2>
      {repoId ? (
        <div className="repo-cloner__success">
          Repository <strong>{repoId}</strong> is ready.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="repo-cloner__form">
          <input
            type="url"
            placeholder="https://github.com/owner/repo"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            disabled={loading}
            className="repo-cloner__input"
          />
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="repo-cloner__button"
          >
            {loading ? 'Cloning...' : 'Clone'}
          </button>
        </form>
      )}
    </div>
  );
}
