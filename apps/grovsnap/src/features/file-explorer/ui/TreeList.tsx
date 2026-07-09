import { Folder, File, ChevronRight, ChevronDown } from 'lucide-react';
import { FileNode } from '../model/types';

interface TreeListProps {
  nodes: FileNode[];
  expandedDirs: Record<string, boolean>;
  toggleDir: (path: string) => void;
  onSelectFile: (path: string) => void;
  selectedPath: string;
  depth: number;
}

export function TreeList({ nodes, expandedDirs, toggleDir, onSelectFile, selectedPath, depth }: TreeListProps) {
  return (
    <ul style={{ listStyle: 'none', paddingLeft: depth === 0 ? 0 : '12px', margin: 0 }}>
      {nodes.map(node => {
        const isExpanded = !!expandedDirs[node.path];
        const isSelected = selectedPath === node.path;
        
        if (node.type === 'directory') {
          return (
            <li key={node.path} style={{ margin: '2px 0' }}>
              <div
                onClick={() => toggleDir(node.path)}
                className="tree-node"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 6px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  userSelect: 'none',
                  color: 'var(--text-primary)',
                  transition: 'background 0.15s'
                }}
              >
                {isExpanded ? <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} /> : <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />}
                <Folder size={14} style={{ color: 'var(--accent-secondary)' }} />
                <span style={{ fontWeight: 500 }}>{node.name}</span>
              </div>
              {isExpanded && node.children && (
                <TreeList
                  nodes={node.children}
                  expandedDirs={expandedDirs}
                  toggleDir={toggleDir}
                  onSelectFile={onSelectFile}
                  selectedPath={selectedPath}
                  depth={depth + 1}
                />
              )}
            </li>
          );
        } else {
          return (
            <li key={node.path} style={{ margin: '2px 0' }}>
              <div
                onClick={() => onSelectFile(node.path)}
                className="tree-node"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 6px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  userSelect: 'none',
                  color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                  backgroundColor: isSelected ? 'rgba(255, 87, 34, 0.15)' : 'transparent',
                  border: isSelected ? '1px solid rgba(255, 87, 34, 0.3)' : '1px solid transparent',
                  transition: 'all 0.15s'
                }}
              >
                <span style={{ width: '14px' }} />
                <File size={14} style={{ color: isSelected ? 'var(--accent-primary)' : 'var(--text-muted)' }} />
                <span>{node.name}</span>
              </div>
            </li>
          );
        }
      })}
    </ul>
  );
}
