// ---- Token usage types ----

export interface RawTokenUsage {
  inputTokens: number;
  outputTokens: number;
  cacheCreationInputTokens: number;
  cacheReadInputTokens: number;
}

export interface TokenUsageSummary extends RawTokenUsage {
  totalCost: number; // USD
}

export interface LlmResult {
  text: string;
  usage: RawTokenUsage;
}

// ---- Repository types ----

export interface RepoInfo {
  repoId: string;
  name: string;
  repoPath: string;
  clonedAt?: string;
}

export interface CloneRequest {
  url: string;
}

export interface CloneResponse extends RepoInfo {
  clonedAt: string;
}

// ---- Parse types ----

export interface FileParseSummary {
  filePath: string;
  language: string;
  functions: string[];
  classes: string[];
  imports: string[];
  exports: string[];
}

export interface ParseRequest {
  repoId: string;
}

export interface ParseResponse {
  repoId: string;
  languages: string[];
  fileCount: number;
  parsedFiles: FileParseSummary[];
  astSummary: string;
}

// ---- Requirements types ----

export interface TraceabilityEntry {
  requirementId: string;
  classRef: string;
  layer: string;
}

export interface Feature {
  featureId: string;
  name: string;
  requirements: string[];
  traceability: TraceabilityEntry[];
}

export interface FeaturesRequest {
  repoId: string;
  model?: string;
}

export interface FeaturesResponse {
  jobId: string;
  repoId: string;
  features: Feature[];
  rawText: string;
  generatedAt: string;
  tokenUsage?: TokenUsageSummary;
}

// ---- BRD types ----

export interface BrdRequest {
  repoId: string;
  jobId: string;
  model?: string;
}

export interface BrdResponse {
  brdId: string;
  repoId: string;
  filename: string;
  downloadUrl: string;
  previewText: string;
  generatedAt: string;
  tokenUsage?: TokenUsageSummary;
}

export interface BrdMeta {
  brdId: string;
  repoId: string;
  filename: string;
  filePath: string;
  generatedAt: string;
}

// ---- Error types ----

export interface ApiError {
  error: string;
  details?: string;
}
