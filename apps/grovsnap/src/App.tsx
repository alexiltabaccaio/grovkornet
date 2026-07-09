import { useState } from 'react';
import { toPng } from 'html-to-image';
import { Download, Sparkles } from 'lucide-react';
import BrandingOverlay from './components/BrandingOverlay';
import CodeWindow from './components/CodeWindow';
import FileTree from './components/FileTree';

const INITIAL_CODE = `// Let's share some Grovkornet magic!
import React, { useCallback } from 'react';
import { NativeFilmCamera } from '@shared/camera';

export function CameraPreview() {
  const handleFrame = useCallback((frame) => {
    'worklet';
    // Multi-pass Uber Shader processing
    processFilmGrain(frame);
  }, []);

  return (
    <NativeFilmCamera
      preset="kodak-chrome-64"
      onFrame={handleFrame}
    />
  );
}`;





const getLanguageFromPath = (filePath: string) => {
  const ext = filePath.split('.').pop()?.toLowerCase();
  if (ext === 'tsx' || ext === 'ts') return 'typescript';
  if (ext === 'jsx' || ext === 'js') return 'javascript';
  if (ext === 'cpp' || ext === 'h') return 'cpp';
  if (ext === 'kt') return 'kotlin';
  if (ext === 'swift') return 'swift';
  if (ext === 'py') return 'python';
  if (ext === 'css') return 'css';
  if (ext === 'html') return 'html';
  if (ext === 'json') return 'json';
  if (ext === 'sh' || ext === 'bash') return 'bash';
  return 'text';
};

export default function App() {
  const [selectedPath, setSelectedPath] = useState('');
  const [fullCode, setFullCode] = useState(INITIAL_CODE);
  const [startLine, setStartLine] = useState(1);
  const [endLine, setEndLine] = useState(25);
  const [language, setLanguage] = useState('typescript');
  const [fileName, setFileName] = useState('CameraPreview.tsx');
  const [isExporting, setIsExporting] = useState(false);

  const lines = fullCode.split('\n');
  const totalLines = lines.length;
  const slicedCode = lines.slice(startLine - 1, endLine).join('\n');

  const handleSelectFile = async (path: string) => {
    setSelectedPath(path);
    try {
      const res = await fetch(`/api/fs/file?path=${encodeURIComponent(path)}`);
      if (!res.ok) throw new Error('Failed to fetch file content');
      const content = await res.text();
      setFullCode(content);
      
      const fileLines = content.split('\n');
      setStartLine(1);
      setEndLine(Math.min(fileLines.length, 30));
      
      const name = path.split('/').pop() || '';
      setFileName(name);
      setLanguage(getLanguageFromPath(path));
    } catch (err) {
      console.error(err);
    }
  };



  const handleDownload = async () => {
    const node = document.getElementById('grovsnap-canvas');
    if (!node) return;
    
    setIsExporting(true);
    // Give Shiki highlighter a moment to settle in case of changes
    setTimeout(async () => {
      try {
        const dataUrl = await toPng(node, {
          cacheBust: true,
          pixelRatio: 3, // 3x scale for crystal clear output
          style: {
            transform: 'scale(1)',
          }
        });
        const link = document.createElement('a');
        link.download = `${fileName ? fileName.replace(/\.[^/.]+$/, "") : 'grovsnap'}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Error rendering image:', err);
      } finally {
        setIsExporting(false);
      }
    }, 100);
  };

  return (
    <div className="app-container">
      {/* Sidebar Controls */}
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
            onSelectFile={handleSelectFile}
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









        {/* Action Button */}
        <button
          onClick={handleDownload}
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

      {/* Main Preview Container */}
      <main className="preview-container">
        <BrandingOverlay>
          <CodeWindow
            code={slicedCode}
            language={language}
            fileName={fileName}
          />
        </BrandingOverlay>
      </main>
    </div>
  );
}
