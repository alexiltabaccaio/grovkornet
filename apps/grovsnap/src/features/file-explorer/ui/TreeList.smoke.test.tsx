import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { TreeList } from './TreeList';

describe('TreeList Smoke Test', () => {
  const mockNodes = [
    {
      name: 'src',
      path: 'src',
      type: 'directory' as const,
      children: [
        { name: 'App.tsx', path: 'src/App.tsx', type: 'file' as const }
      ]
    }
  ];

  afterEach(() => {
    cleanup();
  });

  it('renders directory names', () => {
    const toggleDir = vi.fn();
    const onSelectFile = vi.fn();

    render(
      <TreeList
        nodes={mockNodes}
        expandedDirs={{}}
        toggleDir={toggleDir}
        onSelectFile={onSelectFile}
        selectedPath=""
        depth={0}
      />
    );

    expect(screen.getByText('src')).toBeDefined();
    // App.tsx shouldn't be rendered because expandedDirs['src'] is false
    expect(screen.queryByText('App.tsx')).toBeNull();
  });

  it('renders expanded child files', () => {
    const toggleDir = vi.fn();
    const onSelectFile = vi.fn();

    render(
      <TreeList
        nodes={mockNodes}
        expandedDirs={{ 'src': true }}
        toggleDir={toggleDir}
        onSelectFile={onSelectFile}
        selectedPath=""
        depth={0}
      />
    );

    expect(screen.getByText('src')).toBeDefined();
    expect(screen.getByText('App.tsx')).toBeDefined();
  });
});
