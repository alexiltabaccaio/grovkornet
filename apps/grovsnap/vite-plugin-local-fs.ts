import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Plugin } from 'vite';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

const EXCLUDE_DIRS = new Set([
  'node_modules',
  '.git',
  '.next',
  '.expo',
  'dist',
  'build',
  'ios',
  'android',
  'bin',
  'obj',
  'gradle',
  '.gradle',
  '.idea',
  '.vscode',
  'out',
  'artifacts'
]);

const ALLOWED_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.json', '.css', '.html', '.md',
  '.cpp', '.h', '.kt', '.swift', '.gradle', '.xml', '.yml', '.yaml', '.txt', '.jsonl'
]);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

async function buildTree(dirPath: string, baseDir: string): Promise<FileNode[]> {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const nodes: FileNode[] = [];

  for (const entry of entries) {
    // Skip hidden files/dirs except .agents
    if (entry.name.startsWith('.') && entry.name !== '.agents') {
      continue;
    }

    const fullPath = path.join(dirPath, entry.name);
    const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');

    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry.name)) continue;
      
      try {
        const children = await buildTree(fullPath, baseDir);
        // Only include directories that have allowed files inside
        if (children.length > 0) {
          nodes.push({
            name: entry.name,
            path: relativePath,
            type: 'directory',
            children
          });
        }
      } catch (err) {
        // Handle potential permission errors silently
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (ALLOWED_EXTENSIONS.has(ext)) {
        nodes.push({
          name: entry.name,
          path: relativePath,
          type: 'file'
        });
      }
    }
  }

  // Sort: directories first, then files alphabetically
  return nodes.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'directory' ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
}

export function localFsPlugin(): Plugin {
  return {
    name: 'vite-plugin-local-fs',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url || '', `http://${req.headers.host}`);
        
        if (url.pathname === '/api/fs/tree') {
          try {
            const tree = await buildTree(rootDir, rootDir);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(tree));
          } catch (err: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }
        
        if (url.pathname === '/api/fs/file') {
          const filePath = url.searchParams.get('path');
          if (!filePath) {
            res.statusCode = 400;
            res.end('Missing path parameter');
            return;
          }
          
          try {
            const safePath = path.resolve(rootDir, filePath);
            // Prevent path traversal
            if (!safePath.startsWith(rootDir)) {
              res.statusCode = 403;
              res.end('Access denied');
              return;
            }
            
            const content = await fs.readFile(safePath, 'utf-8');
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.end(content);
          } catch (err: any) {
            res.statusCode = 500;
            res.end(err.message);
          }
          return;
        }

        next();
      });
    }
  };
}
