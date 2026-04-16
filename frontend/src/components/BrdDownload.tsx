import ReactMarkdown from 'react-markdown';
import type { BrdResponse } from '../types';
import { getBrdDownloadUrl } from '../api/client';
import './BrdDownload.css';

interface BrdDownloadProps {
  brdResult: BrdResponse | null;
}

export function BrdDownload({ brdResult }: BrdDownloadProps) {
  if (!brdResult) return null;

  return (
    <div>
      <div className="brd-download__header">
        <h3>Business Requirements Document</h3>
        <a
          href={getBrdDownloadUrl(brdResult.brdId)}
          download={brdResult.filename}
          className="brd-download__link"
        >
          Download .md
        </a>
      </div>

      <div className="brd-download__meta">
        {brdResult.filename} &bull; Generated {new Date(brdResult.generatedAt).toLocaleString()}
      </div>

      <div className="brd-download__preview">
        <ReactMarkdown>{brdResult.previewText}</ReactMarkdown>
        {brdResult.previewText.length >= 2000 && (
          <p className="brd-download__truncated">
            … (preview truncated — download the full document above)
          </p>
        )}
      </div>
    </div>
  );
}
