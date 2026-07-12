import { useState } from 'react';
import { Sidebar } from '@widgets/Sidebar';
import { PreviewArea } from '@widgets/PreviewArea';
import { getLanguageFromPath } from '@shared/lib';
import { exportSnippetPng } from '@features/export-snippet';

export interface SnapshotPage {
  id: string;
  selectedPath: string;
  fullCode: string;
  lineRanges: string;
  language: string;
  fileName: string;
}

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

const INITIAL_PAGE: SnapshotPage = {
  id: 'initial',
  selectedPath: '',
  fullCode: INITIAL_CODE,
  lineRanges: '',
  language: 'typescript',
  fileName: 'Viewfinder.tsx'
};

export default function MainScreen() {
  const [pages, setPages] = useState<SnapshotPage[]>([INITIAL_PAGE]);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [seriesTag, setSeriesTag] = useState('Friday Log');
  const [seriesNumber, setSeriesNumber] = useState('01');

  const currentPage = pages[activePageIndex] || INITIAL_PAGE;
  const { selectedPath, fullCode, lineRanges, fileName } = currentPage;

  const lines = fullCode.split('\n');
  const totalLines = lines.length;

  const updateActivePage = (updatedFields: Partial<SnapshotPage>) => {
    setPages(prev => prev.map((page, idx) => 
      idx === activePageIndex ? { ...page, ...updatedFields } : page
    ));
  };

  const handleAddPage = () => {
    const newPage: SnapshotPage = {
      ...currentPage,
      id: Math.random().toString(36).substring(2, 9),
    };
    setPages(prev => {
      const nextPages = [...prev, newPage];
      setActivePageIndex(nextPages.length - 1);
      return nextPages;
    });
  };

  const handleRemovePage = (indexToRemove: number) => {
    if (pages.length <= 1) return;
    setPages(prev => {
      const nextPages = prev.filter((_, idx) => idx !== indexToRemove);
      setActivePageIndex(currentActive => {
        if (currentActive === indexToRemove) {
          return Math.max(0, indexToRemove - 1);
        }
        if (currentActive > indexToRemove) {
          return currentActive - 1;
        }
        return currentActive;
      });
      return nextPages;
    });
  };

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

  const [adaptFormat, setAdaptFormat] = useState(true);

  const getPageRenderData = (page: SnapshotPage) => {
    const lines = page.fullCode.split('\n');
    const totalLines = lines.length;
    let selectedLineNumbers = parseLineRanges(page.lineRanges, totalLines);
    if (selectedLineNumbers.length === 0 && !page.lineRanges.trim()) {
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
    
    return {
      id: page.id,
      code: slicedCodeLines.join('\n'),
      language: page.language,
      fileName: page.fileName,
      lineNumbers,
    };
  };

  const pagesRenderData = adaptFormat ? pages.map(getPageRenderData) : [getPageRenderData(currentPage)];
  const renderedActiveIndex = adaptFormat ? activePageIndex : 0;

  const handleSelectFile = (path: string) => {
    const targetIndex = activePageIndex;
    setPages(prev => prev.map((page, idx) => 
      idx === targetIndex ? { ...page, selectedPath: path } : page
    ));
    void (async () => {
      try {
        const res = await fetch(`/api/fs/file?path=${encodeURIComponent(path)}`);
        if (!res.ok) throw new Error('Failed to fetch file content');
        const content = await res.text();
        setPages(prev => prev.map((page, idx) => 
          idx === targetIndex ? {
            ...page,
            selectedPath: path,
            fullCode: content,
            lineRanges: '',
            fileName: path,
            language: getLanguageFromPath(path)
          } : page
        ));
      } catch (err) {
        console.error(err);
      }
    })();
  };

  const pageCurrent = activePageIndex + 1;
  const pageTotal = pages.length;

  const handleDownload = () => {
    const node = document.getElementById('grovsnap-canvas');
    if (!node) return;

    let exportName = fileName.split(/[/\\]/).pop() || 'snippet';

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
        setLineRanges={(val) => updateActivePage({ lineRanges: val })}
        totalLines={totalLines}
        isExporting={isExporting}
        onDownload={handleDownload}
        seriesTag={seriesTag}
        setSeriesTag={setSeriesTag}
        seriesNumber={seriesNumber}
        setSeriesNumber={setSeriesNumber}
        pages={pages}
        activePageIndex={activePageIndex}
        onAddPage={handleAddPage}
        onRemovePage={handleRemovePage}
        onSelectPage={setActivePageIndex}
        adaptFormat={adaptFormat}
        setAdaptFormat={setAdaptFormat}
      />
      <PreviewArea
        pages={pagesRenderData}
        activeIndex={renderedActiveIndex}
        seriesTag={seriesTag}
        seriesNumber={seriesNumber}
        pageCurrent={pageCurrent}
        pageTotal={pageTotal}
      />
    </div>
  );
}
