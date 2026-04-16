export interface RepoInfo {
  repoId: string;
  name: string;
  repoPath: string;
  clonedAt?: string;
}

export interface FileParseSummary {
  filePath: string;
  language: string;
  functions: string[];
  classes: string[];
  imports: string[];
  exports: string[];
}

export interface ParseResponse {
  repoId: string;
  languages: string[];
  fileCount: number;
  parsedFiles: FileParseSummary[];
  astSummary: string;
}

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

export interface FeaturesResponse {
  jobId: string;
  repoId: string;
  features: Feature[];
  rawText: string;
  generatedAt: string;
}

export interface BrdResponse {
  brdId: string;
  repoId: string;
  filename: string;
  downloadUrl: string;
  previewText: string;
  generatedAt: string;
}

export type WorkflowStep = 'clone' | 'parse' | 'features' | 'brd';

export interface WorkflowState {
  step: WorkflowStep;
  repoId: string | null;
  jobId: string | null;
  brdId: string | null;
  model: string;
  parseResult: ParseResponse | null;
  featuresResult: FeaturesResponse | null;
  brdResult: BrdResponse | null;
  loading: boolean;
  error: string | null;
}
