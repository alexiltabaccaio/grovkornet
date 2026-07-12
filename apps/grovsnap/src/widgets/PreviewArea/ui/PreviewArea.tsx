import { BrandingOverlay } from '@shared/ui';
import { CodeWindow } from '@entities/code-snippet';

export interface PageRenderData {
  id: string;
  code: string;
  language: string;
  fileName: string;
  lineNumbers: (number | string)[];
}

interface PreviewAreaProps {
  pages: PageRenderData[];
  activeIndex: number;
  seriesTag: string;
  seriesNumber: string;
  pageCurrent: number;
  pageTotal: number;
}

export default function PreviewArea({ pages, activeIndex, seriesTag, seriesNumber, pageCurrent, pageTotal }: PreviewAreaProps) {
  return (
    <main className="preview-container">
      <BrandingOverlay seriesTag={seriesTag} seriesNumber={seriesNumber} pageCurrent={pageCurrent} pageTotal={pageTotal}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gridTemplateRows: '1fr' }}>
          {pages.map((page, index) => {
            const isActive = index === activeIndex;
            return (
              <div 
                key={page.id} 
                style={{ 
                  gridColumn: 1, 
                  gridRow: 1, 
                  opacity: isActive ? 1 : 0, 
                  zIndex: isActive ? 2 : 1,
                  pointerEvents: isActive ? 'auto' : 'none',
                  visibility: isActive ? 'visible' : 'hidden'
                }}
              >
                <CodeWindow
                  code={page.code}
                  language={page.language}
                  fileName={page.fileName}
                  lineNumbers={page.lineNumbers}
                />
              </div>
            );
          })}
        </div>
      </BrandingOverlay>
    </main>
  );
}
