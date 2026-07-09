import { toPng } from 'html-to-image';

export interface ExportOptions {
  fileName: string;
  node: HTMLElement;
  onStart?: () => void;
  onComplete?: () => void;
  onError?: (err: unknown) => void;
}

export async function exportSnippetPng({
  fileName,
  node,
  onStart,
  onComplete,
  onError
}: ExportOptions) {
  onStart?.();
  
  // Give Shiki highlighter a moment to settle in case of changes
  await new Promise(resolve => setTimeout(resolve, 100));

  try {
    const dataUrl = await toPng(node, {
      cacheBust: true,
      pixelRatio: 3,
      style: {
        transform: 'scale(1)',
      }
    });
    
    const link = document.createElement('a');
    const nameWithoutExt = fileName ? fileName.replace(/\.[^/.]+$/, "") : 'grovsnap';
    link.download = `${nameWithoutExt}.png`;
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.error('Error rendering image:', err);
    onError?.(err);
  } finally {
    onComplete?.();
  }
}
