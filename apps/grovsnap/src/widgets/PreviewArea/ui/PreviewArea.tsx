import { BrandingOverlay } from '@shared/ui';
import { CodeWindow } from '@entities/code-snippet';

interface PreviewAreaProps {
  code: string;
  language: string;
  fileName: string;
  lineNumbers?: (number | string)[];
  seriesTag: string;
  seriesNumber: string;
  pageCurrent: number;
  pageTotal: number;
}

export default function PreviewArea({ code, language, fileName, lineNumbers, seriesTag, seriesNumber, pageCurrent, pageTotal }: PreviewAreaProps) {
  return (
    <main className="preview-container">
      <BrandingOverlay seriesTag={seriesTag} seriesNumber={seriesNumber} pageCurrent={pageCurrent} pageTotal={pageTotal}>
        <CodeWindow
          code={code}
          language={language}
          fileName={fileName}
          lineNumbers={lineNumbers}
        />
      </BrandingOverlay>
    </main>
  );
}
