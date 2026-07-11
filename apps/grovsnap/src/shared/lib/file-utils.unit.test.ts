import { describe, it, expect } from 'vitest';
import { getLanguageFromPath } from './file-utils';

describe('getLanguageFromPath', () => {
  it('should detect typescript files', () => {
    expect(getLanguageFromPath('App.tsx')).toBe('typescript');
    expect(getLanguageFromPath('index.ts')).toBe('typescript');
  });

  it('should detect javascript files', () => {
    expect(getLanguageFromPath('App.jsx')).toBe('javascript');
    expect(getLanguageFromPath('index.js')).toBe('javascript');
  });

  it('should detect other common extensions', () => {
    expect(getLanguageFromPath('main.cpp')).toBe('cpp');
    expect(getLanguageFromPath('Camera.kt')).toBe('kotlin');
    expect(getLanguageFromPath('style.css')).toBe('css');
    expect(getLanguageFromPath('data.json')).toBe('json');
    expect(getLanguageFromPath('Script.swift')).toBe('swift');
    expect(getLanguageFromPath('app.py')).toBe('python');
    expect(getLanguageFromPath('index.html')).toBe('html');
    expect(getLanguageFromPath('run.sh')).toBe('bash');
    expect(getLanguageFromPath('build.bash')).toBe('bash');
  });

  it('should fallback to text for unknown extensions', () => {
    expect(getLanguageFromPath('README.md')).toBe('text');
    expect(getLanguageFromPath('no-ext')).toBe('text');
  });
});
