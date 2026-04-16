import axios from 'axios';
import type { RepoInfo, ParseResponse, FeaturesResponse, BrdResponse } from '../types';

const api = axios.create({ baseURL: '/api' });

export async function cloneRepository(url: string): Promise<RepoInfo> {
  const res = await api.post<RepoInfo>('/repositories/clone', { url });
  return res.data;
}

export async function listRepositories(): Promise<RepoInfo[]> {
  const res = await api.get<{ repositories: RepoInfo[] }>('/repositories');
  return res.data.repositories;
}

export async function parseRepository(repoId: string): Promise<ParseResponse> {
  const res = await api.post<ParseResponse>('/parse', { repoId });
  return res.data;
}

export async function extractFeatures(repoId: string, model: string): Promise<FeaturesResponse> {
  const res = await api.post<FeaturesResponse>('/requirements/features', { repoId, model });
  return res.data;
}

export async function generateBrd(
  repoId: string,
  jobId: string,
  model: string,
): Promise<BrdResponse> {
  const res = await api.post<BrdResponse>('/brd', { repoId, jobId, model });
  return res.data;
}

export function getBrdDownloadUrl(brdId: string): string {
  return `/api/brd/${brdId}/download`;
}

export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: string } | undefined;
    return data?.error ?? err.message;
  }
  if (err instanceof Error) return err.message;
  return 'An unexpected error occurred';
}
