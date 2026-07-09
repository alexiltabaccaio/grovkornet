import { useEffect, useState } from 'react';
import { codeToHtml } from 'shiki';
import { grovkornetTheme } from '../lib/theme';

interface CodeWindowProps {
  code: string;
  language: string;
  fileName: string;
}

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
