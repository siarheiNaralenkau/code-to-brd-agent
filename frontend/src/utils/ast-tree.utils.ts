import type { ParseResponse, FileParseSummary } from '../types';

export interface AstFileNode {
  filePath: string;
  language: string;
  functions: string[];
  classes: string[];
  imports: string[];
  exports: string[];
}

export interface AstLayerNode {
  layer: string;
  label: string;
  files: AstFileNode[];
}

export interface AstTreeData {
  repoId: string;
  fileCount: number;
  languages: string[];
  layers: AstLayerNode[];
}

const LAYER_PATTERNS: Record<string, Array<RegExp>> = {
  view:       [/(view|views|pages|page|components|component|ui)\//i, /\.(jsx|tsx)$/],
  controller: [/(controller|controllers|handler|handlers|routes?|api)\//i],
  service:    [/(service|services|business|logic|usecase|use-case)\//i],
  repository: [/(repository|repositories|repo|repos|dao|mapper|store)\//i],
  model:      [/(model|models|entity|entities|schema|schemas|domain)\//i],
  utility:    [/(util|utils|helper|helpers|common|shared|lib)\//i],
};

const LAYER_ORDER = ['view', 'controller', 'service', 'repository', 'model', 'utility', 'other'];

export const LAYER_LABELS: Record<string, string> = {
  view:       'View / UI',
  controller: 'Controller / Routes',
  service:    'Service / Business Logic',
  repository: 'Repository / Data',
  model:      'Model / Domain',
  utility:    'Utility / Shared',
  other:      'Other',
};

function detectLayer(filePath: string): string {
  const normalised = filePath.replace(/\\/g, '/');
  for (const [layer, patterns] of Object.entries(LAYER_PATTERNS)) {
    if (patterns.some((p) => p.test(normalised))) return layer;
  }
  return 'other';
}

export function buildAstTreeData(parseResponse: ParseResponse): AstTreeData {
  const layerMap: Record<string, FileParseSummary[]> = Object.fromEntries(
    LAYER_ORDER.map((l) => [l, []])
  );

  for (const file of parseResponse.parsedFiles) {
    const layer = detectLayer(file.filePath);
    layerMap[layer].push(file);
  }

  const layers: AstLayerNode[] = LAYER_ORDER
    .filter((l) => layerMap[l].length > 0)
    .map((l) => ({
      layer: l,
      label: LAYER_LABELS[l],
      files: [...layerMap[l]].sort((a, b) => a.filePath.localeCompare(b.filePath)),
    }));

  return {
    repoId: parseResponse.repoId,
    fileCount: parseResponse.fileCount,
    languages: parseResponse.languages,
    layers,
  };
}
