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

  it('calls toggleDir when directory is clicked', () => {
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

    const dirNode = screen.getByText('src');
    dirNode.click();
    expect(toggleDir).toHaveBeenCalledWith('src');
  });

  it('calls onSelectFile when file is clicked', () => {
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

    const fileNode = screen.getByText('App.tsx');
    fileNode.click();
    expect(onSelectFile).toHaveBeenCalledWith('src/App.tsx');
  });

  it('renders selected file node with selected styles', () => {
    const toggleDir = vi.fn();
    const onSelectFile = vi.fn();

    render(
      <TreeList
        nodes={mockNodes}
        expandedDirs={{ 'src': true }}
        toggleDir={toggleDir}
        onSelectFile={onSelectFile}
        selectedPath="src/App.tsx"
        depth={0}
      />
    );

    const fileDiv = screen.getByText('App.tsx').closest('div');
    expect(fileDiv?.style.backgroundColor).toBe('rgba(255, 87, 34, 0.15)');
  });
});
