import { useEffect, useState } from 'react';
import { codeToHtml } from 'shiki';

interface CodeWindowProps {
  code: string;
  language: string;
  fileName: string;
}

const grovkornetTheme = {
  name: 'grovkornet',
  type: 'dark',
  colors: {
    'editor.background': '#00000000',
    'editor.foreground': '#ffffff',
  },
  tokenColors: [
    {
      scope: ['keyword', 'modifier', 'storage.type', 'storage.modifier', 'keyword.control'],
      settings: { foreground: '#ff5722', fontStyle: 'bold' }
    },
    {
      scope: ['string', 'string.quoted'],
      settings: { foreground: '#d1d5db' }
    },
    {
      scope: ['entity.name.function', 'support.function', 'entity.name.class'],
      settings: { foreground: '#ff8b38' }
    },
    {
      scope: ['variable', 'parameter', 'entity.name.variable'],
      settings: { foreground: '#f3f4f6' }
    },
    {
      scope: ['comment', 'punctuation.definition.comment'],
      settings: { foreground: '#9ca3af', fontStyle: 'italic' }
    },
    {
      scope: ['constant', 'entity.name.type', 'support.type', 'entity.name.namespace'],
      settings: { foreground: '#ffffff', fontStyle: 'bold' }
    },
    {
      scope: ['punctuation', 'meta.brace'],
      settings: { foreground: '#9ca3af' }
    },
    {
      scope: ['entity.name.tag'],
      settings: { foreground: '#ff5722' }
    },
    {
      scope: ['entity.other.attribute-name'],
      settings: { foreground: '#ff8b38' }
    }
  ]
};

export default function CodeWindow({ code, language, fileName }: CodeWindowProps) {
  const [highlightedHtml, setHighlightedHtml] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    async function highlight() {
      setLoading(true);
      try {
        const html = await codeToHtml(code, {
          lang: language,
          theme: grovkornetTheme as any
        });
        if (active) {
          setHighlightedHtml(html);
        }
      } catch (err) {
        console.error(err);
        if (active) {
          setHighlightedHtml(`<pre class="shiki"><code>${code}</code></pre>`);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
    highlight();
    return () => {
      active = false;
    };
  }, [code, language]);

  return (
    <div style={{
      width: 'fit-content',
      padding: '1.25rem',
      minHeight: '100px',
      position: 'relative'
    }}>
      {fileName && (
        <div style={{
          marginBottom: '1rem',
          fontSize: '0.9rem',
          color: 'rgba(255, 255, 255, 0.7)',
          fontFamily: 'var(--font-mono)',
          fontWeight: 600,
          letterSpacing: '0.5px'
        }}>
          {fileName}
        </div>
      )}
      {loading && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)'
        }}>
          Highlighting...
        </div>
      )}
      <div 
        dangerouslySetInnerHTML={{ __html: highlightedHtml }} 
        style={{ width: 'fit-content' }}
      />
    </div>
  );
}
