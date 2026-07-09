import { BrandingOverlay } from '@shared/ui';
import { CodeWindow } from '@entities/code-snippet';

interface PreviewAreaProps {
  code: string;
  language: string;
  fileName: string;
}

export default function PreviewArea({ code, language, fileName }: PreviewAreaProps) {
  return (
    <main className="preview-container">
      <BrandingOverlay>
        <CodeWindow
          code={code}
          language={language}
          fileName={fileName}
        />
      </BrandingOverlay>
    </main>
  );
}
