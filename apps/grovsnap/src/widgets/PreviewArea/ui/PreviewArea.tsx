import { BrandingOverlay } from '@shared/ui';
import { CodeWindow } from '@entities/code-snippet';

interface PreviewAreaProps {
  code: string;
  language: string;
  fileName: string;
  startLine?: number;
  seriesTag: string;
  seriesNumber: string;
}

export default function PreviewArea({ code, language, fileName, startLine, seriesTag, seriesNumber }: PreviewAreaProps) {
  return (
    <main className="preview-container">
      <BrandingOverlay seriesTag={seriesTag} seriesNumber={seriesNumber}>
        <CodeWindow
          code={code}
          language={language}
          fileName={fileName}
          startLine={startLine}
        />
      </BrandingOverlay>
    </main>
  );
}
