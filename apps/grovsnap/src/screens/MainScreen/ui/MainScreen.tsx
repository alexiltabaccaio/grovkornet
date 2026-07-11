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
  const [lineRanges, setLineRanges] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [fileName, setFileName] = useState('Viewfinder.tsx');
  const [isExporting, setIsExporting] = useState(false);
  const [seriesTag, setSeriesTag] = useState('Friday Log');
  const [seriesNumber, setSeriesNumber] = useState('01');
  const [pageCurrent, setPageCurrent] = useState(1);
  const [pageTotal, setPageTotal] = useState(1);
  const lines = fullCode.split('\n');
  const totalLines = lines.length;

  const parseLineRanges = (rangesStr: string, maxLine: number): number[] => {
    const result: Set<number> = new Set();
    const parts = rangesStr.split(',').map(p => p.trim());
    
    for (const part of parts) {
      if (!part) continue;
      if (part.includes('-')) {
        const [startStr, endStr] = part.split('-');
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        
        if (!isNaN(start) && !isNaN(end)) {
          const s = Math.max(1, start);
          const e = Math.min(maxLine, Math.max(s, end));
          for (let i = s; i <= e; i++) {
            result.add(i);
          }
        }
      } else {
        const num = parseInt(part, 10);
        if (!isNaN(num) && num >= 1 && num <= maxLine) {
           result.add(num);
        }
      }
    }
    return Array.from(result).sort((a, b) => a - b);
  };

  let selectedLineNumbers = parseLineRanges(lineRanges, totalLines);
  if (selectedLineNumbers.length === 0 && !lineRanges.trim()) {
    selectedLineNumbers = Array.from({ length: totalLines }, (_, i) => i + 1);
  }
  
  const slicedCodeLines: string[] = [];
  const lineNumbers: (number | string)[] = [];

  for (let i = 0; i < selectedLineNumbers.length; i++) {
    const currentLine = selectedLineNumbers[i];
    
    if (i > 0 && currentLine > selectedLineNumbers[i - 1] + 1) {
      slicedCodeLines.push('// ...');
      lineNumbers.push('...');
    }
    
    slicedCodeLines.push(lines[currentLine - 1]);
    lineNumbers.push(currentLine);
  }
  
  const slicedCode = slicedCodeLines.join('\n');

  const handleSelectFile = (path: string) => {
    setSelectedPath(path);
    void (async () => {
      try {
        const res = await fetch(`/api/fs/file?path=${encodeURIComponent(path)}`);
        if (!res.ok) throw new Error('Failed to fetch file content');
        const content = await res.text();
        setFullCode(content);
        
        setLineRanges('');
        
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
        lineRanges={lineRanges}
        setLineRanges={setLineRanges}
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
        lineNumbers={lineNumbers}
        seriesTag={seriesTag}
        seriesNumber={seriesNumber}
        pageCurrent={pageCurrent}
        pageTotal={pageTotal}
      />
    </div>
  );
}
