import { useEffect, useState } from 'react';
import { codeToHtml, ThemeRegistration } from 'shiki';
import { grovkornetTheme } from '../lib/theme';

interface CodeWindowProps {
  code: string;
  language: string;
  fileName: string;
  startLine?: number;
}

export default function CodeWindow({ code, language, fileName, startLine = 1 }: CodeWindowProps) {
  const [highlightedHtml, setHighlightedHtml] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    async function highlight() {
      setLoading(true);
      try {
        const html = await codeToHtml(code, {
          lang: language,
          theme: grovkornetTheme as ThemeRegistration
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
    void highlight();
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
      <style>{`
        .shiki-container {
          counter-reset: step ${startLine - 1};
        }
        .shiki-container .line::before {
          counter-increment: step;
          content: counter(step);
          display: inline-block;
          width: 1.5rem;
          margin-right: 1.25rem;
          text-align: right;
          color: rgba(255, 255, 255, 0.25);
          user-select: none;
        }
      `}</style>
      <div 
        className="shiki-container"
        dangerouslySetInnerHTML={{ __html: highlightedHtml }} 
        style={{ width: 'fit-content' }}
      />
    </div>
  );
}
