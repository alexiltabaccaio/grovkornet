import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
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

  afterEach(() => {
    cleanup();
  });

  it('renders loading state initially then tree items', async () => {
    render(<FileTree selectedPath="" onSelectFile={() => {}} />);
    expect(screen.getByText(/Caricamento/)).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText('src')).toBeDefined();
    });
  });

  it('renders error state when fetch fails', async () => {
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.reject(new Error('Network error'))
    ) as any;

    render(<FileTree selectedPath="" onSelectFile={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('Errore: Network error')).toBeDefined();
    });
  });

  it('filters file tree on search input and toggles all directories', async () => {
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve([
            {
              name: 'src',
              path: 'src',
              type: 'directory',
              children: [
                { name: 'App.tsx', path: 'src/App.tsx', type: 'file' },
                { name: 'index.ts', path: 'src/index.ts', type: 'file' }
              ]
            },
            {
              name: 'package.json',
              path: 'package.json',
              type: 'file'
            }
          ])
      })
    ) as any;

    render(<FileTree selectedPath="" onSelectFile={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('src')).toBeDefined();
      expect(screen.getByText('package.json')).toBeDefined();
    });

    // Check search filtering
    const searchInput = screen.getByPlaceholderText('Cerca file...');
    fireEvent.change(searchInput, { target: { value: 'App' } });

    // With 'App' query, 'App.tsx' should be shown, and 'package.json' should not
    await waitFor(() => {
      expect(screen.getByText('App.tsx')).toBeDefined();
      expect(screen.queryByText('package.json')).toBeNull();
    });

    // Reset search
    fireEvent.change(searchInput, { target: { value: '' } });
    await waitFor(() => {
      expect(screen.getByText('package.json')).toBeDefined();
    });

    // Click toggle expand/collapse directories
    // Since 'src' is still expanded from the search auto-expand, the button will be "Comprimi tutte le cartelle"
    const collapseBtn = screen.getByTitle('Comprimi tutte le cartelle');
    fireEvent.click(collapseBtn);

    // After collapsing, "App.tsx" should not be visible
    expect(screen.queryByText('App.tsx')).toBeNull();

    // Now all are closed, the button should be "Espandi tutte le cartelle"
    const expandBtn = screen.getByTitle('Espandi tutte le cartelle');
    fireEvent.click(expandBtn);

    // After expanding, "App.tsx" should be visible
    expect(screen.getByText('App.tsx')).toBeDefined();
  });

  it('toggles a single directory when clicked', async () => {
    render(<FileTree selectedPath="" onSelectFile={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('src')).toBeDefined();
    });

    const dirNode = screen.getByText('src');
    fireEvent.click(dirNode);

    expect(screen.getByText('App.tsx')).toBeDefined();

    fireEvent.click(dirNode);
    expect(screen.queryByText('App.tsx')).toBeNull();
  });
});
