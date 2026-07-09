import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import FileTree from './FileTree';

describe('FileTree Smoke Test', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve([
            {
              name: 'src',
              path: 'src',
              type: 'directory',
              children: [{ name: 'App.tsx', path: 'src/App.tsx', type: 'file' }]
            }
          ])
      })
    ) as any;
  });

  it('renders loading state initially then tree items', async () => {
    render(<FileTree selectedPath="" onSelectFile={() => {}} />);
    expect(screen.getByText(/Caricamento/)).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText('src')).toBeDefined();
    });
  });
});
