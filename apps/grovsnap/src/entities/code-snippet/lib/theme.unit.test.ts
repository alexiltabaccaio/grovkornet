import { describe, it, expect } from 'vitest';
import { grovkornetTheme } from './theme';

describe('grovkornetTheme', () => {
  it('has a valid Shiki theme structure', () => {
    expect(grovkornetTheme.name).toBe('grovkornet');
    expect(grovkornetTheme.type).toBe('dark');
    expect(grovkornetTheme.colors).toBeDefined();
    expect(grovkornetTheme.colors['editor.background']).toBe('#00000000');
    expect(Array.isArray(grovkornetTheme.tokenColors)).toBe(true);
    expect(grovkornetTheme.tokenColors.length).toBeGreaterThan(0);
  });
});
