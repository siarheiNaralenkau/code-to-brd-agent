import { useState } from 'react';
import type { ParseResponse } from '../types';
import { buildAstTreeData } from '../utils/ast-tree.utils';
import './AstTreeViewer.css';

interface AstTreeViewerProps {
  parseResult: ParseResponse;
}

const LAYER_ICONS: Record<string, string> = {
  view:       '🖼',
  controller: '⚡',
  service:    '⚙',
  repository: '🗄',
  model:      '📋',
  utility:    '🔧',
  other:      '📁',
};

const LANG_DISPLAY: Record<string, string> = {
  typescript:  'TS',
  tsx:         'TSX',
  javascript:  'JS',
  jsx:         'JSX',
  python:      'PY',
  java:        'Java',
  go:          'Go',
};

function basename(p: string): string {
  return p.split('/').at(-1) ?? p;
}

function dirname(p: string): string {
  const parts = p.split('/');
  return parts.length > 1 ? parts.slice(0, -1).join('/') : '';
}

interface AstDetailRowProps {
  label: string;
  items: string[];
  limit?: number;
}

function AstDetailRow({ label, items, limit = Infinity }: AstDetailRowProps) {
  const [showAll, setShowAll] = useState(false);
  if (items.length === 0) return null;

  const visible = showAll || items.length <= limit ? items : items.slice(0, limit);
  const hidden = items.length - visible.length;

  return (
    <div className="ast-tree__detail-row">
      <span className="ast-tree__detail-label">{label}</span>
      <span className="ast-tree__tags">
        {visible.map((item) => (
          <span key={item} className="ast-tree__tag">{item}</span>
        ))}
        {hidden > 0 && (
          <button className="ast-tree__show-more" onClick={() => setShowAll(true)}>
            +{hidden} more
          </button>
        )}
      </span>
    </div>
  );
}

export function AstTreeViewer({ parseResult }: AstTreeViewerProps) {
  const treeData = buildAstTreeData(parseResult);

  const [expandedLayers, setExpandedLayers] = useState<Record<string, boolean>>({});
  const [expandedFiles, setExpandedFiles] = useState<Record<string, boolean>>({});
  const [allExpanded, setAllExpanded] = useState(false);

  function toggleLayer(layer: string) {
    setExpandedLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  }

  function toggleFile(filePath: string) {
    setExpandedFiles((prev) => ({ ...prev, [filePath]: !prev[filePath] }));
  }

  function handleToggleAll() {
    const next = !allExpanded;
    setAllExpanded(next);
    const layerState: Record<string, boolean> = {};
    for (const l of treeData.layers) layerState[l.layer] = next;
    setExpandedLayers(layerState);
    if (!next) setExpandedFiles({});
  }

  return (
    <div className="ast-tree">
      <div className="ast-tree__header">
        <div className="ast-tree__header-left">
          <span className="ast-tree__repo-label">{treeData.repoId}</span>
          <span className="ast-tree__stats">
            {treeData.fileCount} files
            {treeData.languages.length > 0 && (
              <> &middot; {treeData.languages.join(', ')}</>
            )}
          </span>
        </div>
        <button className="ast-tree__toggle-all" onClick={handleToggleAll}>
          {allExpanded ? 'Collapse All' : 'Expand All'}
        </button>
      </div>

      <div className="ast-tree__root">
        {treeData.layers.map((layerNode) => {
          const layerOpen = !!expandedLayers[layerNode.layer];
          return (
            <div className="ast-tree__layer" key={layerNode.layer}>
              <button
                className="ast-tree__layer-header"
                onClick={() => toggleLayer(layerNode.layer)}
              >
                <span className={`ast-tree__caret${layerOpen ? ' ast-tree__caret--open' : ''}`} />
                <span className="ast-tree__layer-icon">{LAYER_ICONS[layerNode.layer] ?? '📁'}</span>
                <span className="ast-tree__layer-name">{layerNode.label}</span>
                <span className="ast-tree__layer-count">{layerNode.files.length} file{layerNode.files.length !== 1 ? 's' : ''}</span>
              </button>

              {layerOpen && (
                <div className="ast-tree__layer-body">
                  {layerNode.files.map((file) => {
                    const fileOpen = !!expandedFiles[file.filePath];
                    const name = basename(file.filePath);
                    const dir = dirname(file.filePath);
                    const langKey = file.language.toLowerCase();
                    return (
                      <div className="ast-tree__file" key={file.filePath}>
                        <button
                          className="ast-tree__file-header"
                          onClick={() => toggleFile(file.filePath)}
                        >
                          <span className={`ast-tree__caret${fileOpen ? ' ast-tree__caret--open' : ''}`} />
                          <span className="ast-tree__file-name">{name}</span>
                          {dir && <span className="ast-tree__file-dir">{dir}</span>}
                          <span className={`ast-tree__lang-badge ast-tree__lang-badge--${langKey}`}>
                            {LANG_DISPLAY[langKey] ?? file.language}
                          </span>
                        </button>

                        {fileOpen && (
                          <div className="ast-tree__file-detail">
                            <AstDetailRow label="Classes" items={file.classes} />
                            <AstDetailRow label="Functions" items={file.functions} limit={15} />
                            <AstDetailRow label="Imports" items={file.imports} limit={10} />
                            <AstDetailRow label="Exports" items={file.exports} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
