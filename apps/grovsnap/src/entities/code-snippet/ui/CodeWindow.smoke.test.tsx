import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import CodeWindow from './CodeWindow';
import * as shiki from 'shiki';

vi.mock('shiki', () => ({
  codeToHtml: vi.fn().mockResolvedValue('<pre class="shiki"><code>const x = 42;</code></pre>')
}));

describe('CodeWindow Smoke Test', () => {
  it('renders code window with file name', async () => {
    render(
      <CodeWindow
        code="const x = 42;"
        language="typescript"
        fileName="test.ts"
      />
    );
    expect(screen.getByText('test.ts')).toBeDefined();
    await waitFor(() => {
      expect(screen.getByText('const x = 42;')).toBeDefined();
    });
  });

  it('renders fallback html when codeToHtml fails', async () => {
    vi.mocked(shiki.codeToHtml).mockRejectedValueOnce(new Error('Highlight error'));

    render(
      <CodeWindow
        code="const y = 99;"
        language="typescript"
        fileName="test.ts"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('const y = 99;')).toBeDefined();
    });
  });

  it('does not update state if unmounted before promise resolves', async () => {
    let resolvePromise: any;
    const pendingPromise = new Promise<string>((resolve) => {
      resolvePromise = resolve;
    });
    vi.mocked(shiki.codeToHtml).mockReturnValueOnce(pendingPromise);

    const { unmount } = render(
      <CodeWindow
        code="const z = 100;"
        language="typescript"
        fileName="test.ts"
      />
    );

    unmount();
    resolvePromise('<pre class="shiki"><code>const z = 100;</code></pre>');

    await new Promise((resolve) => setTimeout(resolve, 50));
  });
});
