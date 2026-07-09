export const getLanguageFromPath = (filePath: string): string => {
  const ext = filePath.split('.').pop()?.toLowerCase();
  if (ext === 'tsx' || ext === 'ts') return 'typescript';
  if (ext === 'jsx' || ext === 'js') return 'javascript';
  if (ext === 'cpp' || ext === 'h') return 'cpp';
  if (ext === 'kt') return 'kotlin';
  if (ext === 'swift') return 'swift';
  if (ext === 'py') return 'python';
  if (ext === 'css') return 'css';
  if (ext === 'html') return 'html';
  if (ext === 'json') return 'json';
  if (ext === 'sh' || ext === 'bash') return 'bash';
  return 'text';
};
