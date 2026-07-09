import { useEffect, useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { FileNode } from '../model/types';
import { fetchTree } from '../api/fetch-tree';
import { TreeList } from './TreeList';

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
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadTree();
  }, []);

  const toggleDir = (path: string) => {
    setExpandedDirs(prev => ({ ...prev, [path]: !prev[path] }));
  };

  // Filter helper
  const filteredTree = useMemo(() => {
    if (!search) return tree;
    
    const autoExpanded: Record<string, boolean> = {};
    
    function filterNodes(nodes: FileNode[]): FileNode[] {
      const result: FileNode[] = [];
      for (const node of nodes) {
        if (node.type === 'directory' && node.children) {
          const matchingChildren = filterNodes(node.children);
          if (matchingChildren.length > 0 || node.name.toLowerCase().includes(search.toLowerCase())) {
            result.push({
              ...node,
              children: matchingChildren
            });
            autoExpanded[node.path] = true;
          }
        } else if (node.type === 'file') {
          if (node.name.toLowerCase().includes(search.toLowerCase())) {
            result.push(node);
          }
        }
      }
      return result;
    }
    
    const res = filterNodes(tree);
    if (search) {
      setExpandedDirs(prev => ({ ...prev, ...autoExpanded }));
    }
    return res;
  }, [tree, search]);

  if (loading) {
    return <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '1rem 0' }}>Caricamento albero...</div>;
  }

  if (error) {
    return <div style={{ fontSize: '0.85rem', color: '#ff5f56', padding: '1rem 0' }}>Errore: {error}</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', minHeight: 0 }}>
      <div style={{ position: 'relative' }}>
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
