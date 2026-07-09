import { BrandingOverlay } from '@shared/ui';
import { CodeWindow } from '@entities/code-snippet';

interface PreviewAreaProps {
  code: string;
  language: string;
  fileName: string;
  startLine?: number;
}

export default function PreviewArea({ code, language, fileName, startLine }: PreviewAreaProps) {
  return (
    <main className="preview-container">
      <BrandingOverlay>
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
