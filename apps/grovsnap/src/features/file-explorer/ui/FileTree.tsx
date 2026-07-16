import { useEffect, useState, useMemo } from 'react';
import { Search, Folder, FolderOpen } from 'lucide-react';
import { FileNode } from '../model/types';
import { fetchTree } from '../api/fetch-tree';
import { TreeList } from './TreeList';

function getAllDirPaths(nodes: FileNode[]): string[] {
  let paths: string[] = [];
  for (const node of nodes) {
    if (node.type === 'directory') {
      paths.push(node.path);
      if (node.children) {
        paths = paths.concat(getAllDirPaths(node.children));
      }
    }
  }
  return paths;
}

interface FileTreeProps {
  onSelectFile: (path: string) => void;
  selectedPath: string;
}

export default function FileTree({ onSelectFile, selectedPath }: FileTreeProps) {
  const [tree, setTree] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [expandedDirs, setExpandedDirs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadTree() {
      try {
        const data = await fetchTree();
        setTree(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Errore sconosciuto');
      } finally {
        setLoading(false);
      }
    }
    void loadTree();
  }, []);

  const toggleDir = (path: string) => {
    setExpandedDirs(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const allDirPaths = useMemo(() => getAllDirPaths(tree), [tree]);
  const areAllClosed = useMemo(() => allDirPaths.every(path => !expandedDirs[path]), [allDirPaths, expandedDirs]);

  const toggleAllDirs = () => {
    if (areAllClosed) {
      const newExpanded: Record<string, boolean> = {};
      allDirPaths.forEach(path => {
        newExpanded[path] = true;
      });
      setExpandedDirs(newExpanded);
    } else {
      setExpandedDirs({});
    }
  };

  const [prevSearch, setPrevSearch] = useState('');

  // Filter helper
  const filteredTree = useMemo(() => {
    if (!search) return tree;
    
    function filterNodes(nodes: FileNode[]): FileNode[] {
      const result: FileNode[] = [];
      for (const node of nodes) {
        if (node.type === 'directory' && node.children) {
          const matchingChildren = filterNodes(node.children);
          if (
            matchingChildren.length > 0 || 
            node.name.toLowerCase().includes(search.toLowerCase()) ||
            node.path.replace(/\\/g, '/').toLowerCase().includes(search.toLowerCase())
          ) {
            result.push({
              ...node,
              children: matchingChildren
            });
          }
        } else if (node.type === 'file') {
          if (
            node.name.toLowerCase().includes(search.toLowerCase()) ||
            node.path.replace(/\\/g, '/').toLowerCase().includes(search.toLowerCase())
          ) {
            result.push(node);
          }
        }
      }
      return result;
    }
    
    return filterNodes(tree);
  }, [tree, search]);

  if (search !== prevSearch) {
    setPrevSearch(search);
    if (search) {
      const autoExpanded: Record<string, boolean> = {};
      const collectDirs = (nodes: FileNode[]) => {
        for (const node of nodes) {
          if (node.type === 'directory' && node.children) {
            const hasMatches = (n: FileNode): boolean => {
              if (
                n.name.toLowerCase().includes(search.toLowerCase()) || 
                n.path.replace(/\\/g, '/').toLowerCase().includes(search.toLowerCase())
              ) return true;
              if (n.children) return n.children.some(hasMatches);
              return false;
            };
            if (hasMatches(node)) {
              autoExpanded[node.path] = true;
            }
            collectDirs(node.children);
          }
        }
      };
      collectDirs(tree);
      if (Object.keys(autoExpanded).length > 0) {
        setExpandedDirs(prev => ({ ...prev, ...autoExpanded }));
      }
    }
  }

  if (loading) {
    return <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '1rem 0' }}>Caricamento albero...</div>;
  }

  if (error) {
    return <div style={{ fontSize: '0.85rem', color: '#ff5f56', padding: '1rem 0' }}>Errore: {error}</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', minHeight: 0 }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            placeholder="Cerca file..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: '2.2rem',
              fontSize: '0.85rem',
            }}
          />
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        </div>
        <div
          onClick={toggleAllDirs}
          title={areAllClosed ? "Espandi tutte le cartelle" : "Comprimi tutte le cartelle"}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            border: '1px solid var(--border-glass)',
            background: 'rgba(255, 255, 255, 0.08)',
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          {areAllClosed ? (
            <FolderOpen size={16} style={{ color: 'var(--text-primary)' }} />
          ) : (
            <Folder size={16} style={{ color: 'var(--text-primary)' }} />
          )}
        </div>
      </div>

      <div style={{
        overflowY: 'auto',
        fontSize: '0.85rem',
        paddingRight: '4px',
        border: '1px solid var(--border-glass)',
        borderRadius: '8px',
        padding: '0.5rem',
        background: 'rgba(255, 255, 255, 0.01)',
        maxHeight: '300px'
      }}>
        {filteredTree.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', padding: '10px 0', textAlign: 'center' }}>Nessun file trovato</div>
        ) : (
          <TreeList
            nodes={filteredTree}
            expandedDirs={expandedDirs}
            toggleDir={toggleDir}
            onSelectFile={onSelectFile}
            selectedPath={selectedPath}
            depth={0}
          />
        )}
      </div>
    </div>
  );
}
