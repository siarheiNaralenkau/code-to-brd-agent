import { FileParseSummary } from '../types';

const LAYER_PATTERNS: Record<string, RegExp[]> = {
  view: [/\/(view|views|pages|page|components|component|ui)\//i, /\.(jsx|tsx)$/],
  controller: [/\/(controller|controllers|handler|handlers|routes?|api)\//i],
  service: [/\/(service|services|business|logic|usecase|use-case)\//i],
  repository: [/\/(repository|repositories|repo|repos|dao|mapper|store)\//i],
  model: [/\/(model|models|entity|entities|schema|schemas|domain)\//i],
  utility: [/\/(util|utils|helper|helpers|common|shared|lib)\//i],
};

export interface AstChunk {
  layer: string;
  files: FileParseSummary[];
  summary: string;
}

export function chunkByLayer(parsedFiles: FileParseSummary[]): AstChunk[] {
  const layerMap: Record<string, FileParseSummary[]> = {
    view: [],
    controller: [],
    service: [],
    repository: [],
    model: [],
    utility: [],
    other: [],
  };

  for (const file of parsedFiles) {
    const normalised = file.filePath.replace(/\\/g, '/');
    let matched = false;
    for (const [layer, patterns] of Object.entries(LAYER_PATTERNS)) {
      if (patterns.some((p) => p.test(normalised))) {
        layerMap[layer].push(file);
        matched = true;
        break;
      }
    }
    if (!matched) layerMap['other'].push(file);
  }

  return Object.entries(layerMap)
    .filter(([, files]) => files.length > 0)
    .map(([layer, files]) => ({
      layer,
      files,
      summary: buildLayerSummary(layer, files),
    }));
}

function buildLayerSummary(layer: string, files: FileParseSummary[]): string {
  const lines: string[] = [`=== Layer: ${layer.toUpperCase()} (${files.length} files) ===`];

  for (const file of files) {
    lines.push(`\nFile: ${file.filePath} [${file.language}]`);
    if (file.classes.length > 0) lines.push(`  Classes: ${file.classes.join(', ')}`);
    if (file.functions.length > 0) lines.push(`  Functions: ${file.functions.slice(0, 20).join(', ')}${file.functions.length > 20 ? ' ...' : ''}`);
    if (file.imports.length > 0) lines.push(`  Imports: ${file.imports.slice(0, 10).join(', ')}${file.imports.length > 10 ? ' ...' : ''}`);
    if (file.exports.length > 0) lines.push(`  Exports: ${file.exports.slice(0, 10).join(', ')}${file.exports.length > 10 ? ' ...' : ''}`);
  }

  return lines.join('\n');
}

export function buildFullAstSummary(chunks: AstChunk[]): string {
  return chunks.map((c) => c.summary).join('\n\n');
}
