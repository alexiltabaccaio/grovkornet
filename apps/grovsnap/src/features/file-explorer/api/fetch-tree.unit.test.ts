import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchTree } from './fetch-tree';

describe('fetchTree API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches tree successfully', async () => {
    const mockData = [{ name: 'src', path: 'src', type: 'directory' }];
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockData)
      })
    ) as any;

    const data = await fetchTree();
    expect(global.fetch).toHaveBeenCalledWith('/api/fs/tree');
    expect(data).toEqual(mockData);
  });

  it('throws error when response is not ok', async () => {
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false
      })
    ) as any;

    await expect(fetchTree()).rejects.toThrow('Failed to fetch file tree');
  });
});
