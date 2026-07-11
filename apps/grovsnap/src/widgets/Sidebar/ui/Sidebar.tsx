import { Sparkles, Download } from 'lucide-react';
import { FileTree } from '@features/file-explorer';

interface SidebarProps {
  selectedPath: string;
  onSelectFile: (path: string) => void;
  startLine: number;
  setStartLine: (val: number) => void;
  endLine: number;
  setEndLine: (val: number) => void;
  totalLines: number;
  isExporting: boolean;
  onDownload: () => void;
  seriesTag: string;
  setSeriesTag: (val: string) => void;
  seriesNumber: string;
  setSeriesNumber: (val: string) => void;
}

export default function Sidebar({
  selectedPath,
  onSelectFile,
  startLine,
  setStartLine,
  endLine,
  setEndLine,
  totalLines,
  isExporting,
  onDownload,
  seriesTag,
  setSeriesTag,
  seriesNumber,
  setSeriesNumber
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Sparkles style={{ color: 'var(--accent-primary)' }} />
        <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.4rem' }}>GrovSnap</h2>
      </div>

      {/* File Explorer */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minHeight: 0 }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>ESPLORA FILE</label>
        <FileTree
          selectedPath={selectedPath}
          onSelectFile={onSelectFile}
        />
      </div>

      {/* Line Range Selector */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>RIGA INIZIO</label>
          <input
            type="number"
            min={1}
            max={totalLines || 1}
            value={startLine}
            onChange={(e) => setStartLine(Math.max(1, Number(e.target.value)))}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>RIGA FINE</label>
          <input
            type="number"
            min={1}
            max={totalLines || 1}
            value={endLine}
            onChange={(e) => setEndLine(Math.max(1, Number(e.target.value)))}
          />
        </div>
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '-8px' }}>
        Righe totali: {totalLines}
      </div>

      {/* Series Tag Selector */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginTop: '8px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>SERIE</label>
          <select
            value={seriesTag}
            onChange={(e) => setSeriesTag(e.target.value)}
            style={{ width: '100%' }}
          >
            <option value="Tuesday Insights">Tuesday Insights</option>
            <option value="Friday Log">Friday Log</option>
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>NUMERO</label>
          <input
            type="number"
            min={1}
            value={seriesNumber}
            onChange={(e) => setSeriesNumber(Math.max(1, Number(e.target.value)).toString().padStart(2, '0'))}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={onDownload}
        className="btn-primary"
        style={{
          marginTop: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
        disabled={isExporting}
      >
        <Download size={18} />
        {isExporting ? 'Exporting...' : 'Export Snippet PNG'}
      </button>
    </aside>
  );
}
