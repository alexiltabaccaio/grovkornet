import { Sparkles, Download, Plus, Trash2 } from 'lucide-react';
import { FileTree } from '@features/file-explorer';

interface SnapshotPage {
  id: string;
  selectedPath: string;
  fullCode: string;
  lineRanges: string;
  language: string;
  fileName: string;
}

interface SidebarProps {
  selectedPath: string;
  onSelectFile: (path: string) => void;
  lineRanges: string;
  setLineRanges: (val: string) => void;
  totalLines: number;
  isExporting: boolean;
  onDownload: () => void;
  seriesTag: string;
  setSeriesTag: (val: string) => void;
  seriesNumber: string;
  setSeriesNumber: (val: string) => void;
  pages: SnapshotPage[];
  activePageIndex: number;
  onAddPage: () => void;
  onRemovePage: (index: number) => void;
  onSelectPage: (index: number) => void;
  adaptFormat: boolean;
  setAdaptFormat: (val: boolean) => void;
}

export default function Sidebar({
  selectedPath,
  onSelectFile,
  lineRanges,
  setLineRanges,
  totalLines,
  isExporting,
  onDownload,
  seriesTag,
  setSeriesTag,
  seriesNumber,
  setSeriesNumber,
  pages,
  activePageIndex,
  onAddPage,
  onRemovePage,
  onSelectPage,
  adaptFormat,
  setAdaptFormat
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Sparkles style={{ color: 'var(--accent-primary)' }} />
        <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.4rem' }}>GrovSnap</h2>
      </div>

      {/* 1. File Explorer */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minHeight: 0 }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>ESPLORA FILE</label>
        <FileTree
          selectedPath={selectedPath}
          onSelectFile={onSelectFile}
        />
      </div>

      {/* 2. Series Tag Selector */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '12px' }}>
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

      {/* 3. Pagine Selector */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>PAGINE</label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={adaptFormat}
              onChange={(e) => setAdaptFormat(e.target.checked)}
              style={{ accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
            />
            Adatta Formato
          </label>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {pages.map((page, index) => {
            const isActive = index === activePageIndex;
            return (
              <button
                key={page.id}
                onClick={() => onSelectPage(index)}
                style={{
                  padding: '0.5rem 0.8rem',
                  borderRadius: '6px',
                  backgroundColor: isActive ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.04)',
                  color: isActive ? '#fff' : 'var(--text-primary)',
                  border: `1px solid ${isActive ? 'transparent' : 'var(--border-glass)'}`,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                }}
              >
                {index + 1}
              </button>
            );
          })}
          
          <button
            onClick={onAddPage}
            title="Aggiungi Pagina"
            style={{
              padding: '0.5rem',
              borderRadius: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-glass)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
          >
            <Plus size={16} />
          </button>

          {pages.length > 1 && (
            <button
              onClick={() => onRemovePage(activePageIndex)}
              title="Elimina Pagina Corrente"
              style={{
                padding: '0.5rem',
                borderRadius: '6px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: 'auto',
                transition: 'all 0.2s ease',
              }}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* 4. Line Range Selector */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>RIGHE</label>
          <input
            type="text"
            value={lineRanges}
            onChange={(e) => setLineRanges(e.target.value)}
            placeholder="es. 1-10, 15-20"
            style={{ width: '100%' }}
          />
        </div>
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '-8px' }}>
        Righe totali del file: {totalLines}
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
