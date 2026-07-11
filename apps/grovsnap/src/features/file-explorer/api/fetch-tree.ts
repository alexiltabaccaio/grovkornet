import { FileNode } from '../model/types';

export async function fetchTree(): Promise<FileNode[]> {
  const res = await fetch('/api/fs/tree');
  if (!res.ok) {
    throw new Error('Failed to fetch file tree');
  }
  return res.json() as Promise<FileNode[]>;
}
