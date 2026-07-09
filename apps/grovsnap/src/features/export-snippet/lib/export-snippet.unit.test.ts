import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportSnippetPng } from './export-utils';
import * as htmlToImage from 'html-to-image';

vi.mock('html-to-image', () => ({
  toPng: vi.fn().mockResolvedValue('data:image/png;base64,test-url')
}));

describe('exportSnippetPng', () => {
  let mockNode: HTMLElement;

  beforeEach(() => {
    mockNode = document.createElement('div');
    vi.clearAllMocks();
  });

  it('triggers onStart, calls toPng and onComplete', async () => {
    const onStart = vi.fn();
    const onComplete = vi.fn();
    
    // Mock document.createElement for the <a> tag
    const mockLink = {
      click: vi.fn(),
      download: '',
      href: ''
    };
    const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'a') return mockLink as any;
      return document.createElement(tagName);
    });

    await exportSnippetPng({
      fileName: 'TestFile.tsx',
      node: mockNode,
      onStart,
      onComplete
    });

    expect(onStart).toHaveBeenCalled();
    expect(htmlToImage.toPng).toHaveBeenCalledWith(mockNode, expect.any(Object));
    expect(mockLink.download).toBe('TestFile.png');
    expect(mockLink.href).toBe('data:image/png;base64,test-url');
    expect(mockLink.click).toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalled();

    createElementSpy.mockRestore();
  });
});
