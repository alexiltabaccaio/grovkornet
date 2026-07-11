import { useState } from 'react';
import { Sidebar } from '@widgets/Sidebar';
import { PreviewArea } from '@widgets/PreviewArea';
import { getLanguageFromPath } from '@shared/lib';
import { exportSnippetPng } from '@features/export-snippet';

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

export default function MainScreen() {
  const [selectedPath, setSelectedPath] = useState('');
  const [fullCode, setFullCode] = useState(INITIAL_CODE);
  const [startLine, setStartLine] = useState(1);
  const [endLine, setEndLine] = useState(25);
  const [language, setLanguage] = useState('typescript');
  const [fileName, setFileName] = useState('CameraPreview.tsx');
  const [isExporting, setIsExporting] = useState(false);
  const [seriesTag, setSeriesTag] = useState('Friday Log');
  const [seriesNumber, setSeriesNumber] = useState('01');
  const [pageCurrent, setPageCurrent] = useState(1);
  const [pageTotal, setPageTotal] = useState(1);
  const lines = fullCode.split('\n');
  const totalLines = lines.length;
  const slicedCode = lines.slice(startLine - 1, endLine).join('\n');

  const handleSelectFile = (path: string) => {
    setSelectedPath(path);
    void (async () => {
      try {
        const res = await fetch(`/api/fs/file?path=${encodeURIComponent(path)}`);
        if (!res.ok) throw new Error('Failed to fetch file content');
        const content = await res.text();
        setFullCode(content);
        
        const fileLines = content.split('\n');
        setStartLine(1);
        setEndLine(fileLines.length);
        
        setFileName(path);
        setLanguage(getLanguageFromPath(path));
      } catch (err) {
        console.error(err);
      }
    })();
  };

  const handleDownload = () => {
    const node = document.getElementById('grovsnap-canvas');
    if (!node) return;

    let exportName = fileName.split('/').pop() || 'snippet';

    if (pageTotal > 1) {
      const lastDot = exportName.lastIndexOf('.');
      if (lastDot !== -1) {
        exportName = `${exportName.slice(0, lastDot)}-p${pageCurrent}${exportName.slice(lastDot)}`;
      } else {
        exportName = `${exportName}-p${pageCurrent}`;
      }
    }

    if (seriesTag) {
      const formattedTag = seriesTag.replace(/\s+/g, '');
      exportName = `${formattedTag}_${seriesNumber}_${exportName}`;
    }

    void exportSnippetPng({
      fileName: exportName,
      node,
      onStart: () => setIsExporting(true),
      onComplete: () => setIsExporting(false),
      onError: (err) => console.error('Download error:', err)
    });
  };

  return (
    <div className="app-container">
      <Sidebar
        selectedPath={selectedPath}
        onSelectFile={handleSelectFile}
        startLine={startLine}
        setStartLine={setStartLine}
        endLine={endLine}
        setEndLine={setEndLine}
        totalLines={totalLines}
        isExporting={isExporting}
        onDownload={handleDownload}
        seriesTag={seriesTag}
        setSeriesTag={setSeriesTag}
        seriesNumber={seriesNumber}
        setSeriesNumber={setSeriesNumber}
        pageCurrent={pageCurrent}
        setPageCurrent={setPageCurrent}
        pageTotal={pageTotal}
        setPageTotal={setPageTotal}
      />
      <PreviewArea
        code={slicedCode}
        language={language}
        fileName={fileName}
        startLine={startLine}
        seriesTag={seriesTag}
        seriesNumber={seriesNumber}
        pageCurrent={pageCurrent}
        pageTotal={pageTotal}
      />
    </div>
  );
}
