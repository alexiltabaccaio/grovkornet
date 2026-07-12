import { useEffect, useState } from 'react';
import { codeToHtml, ThemeRegistration, ShikiTransformer } from 'shiki';
import { grovkornetTheme } from '../lib/theme';

interface CodeWindowProps {
  code: string;
  language: string;
  fileName: string;
  lineNumbers?: (number | string)[];
}

export default function CodeWindow({ code, language, fileName, lineNumbers }: CodeWindowProps) {
  const [highlightedHtml, setHighlightedHtml] = useState('');

  useEffect(() => {
    let active = true;
    async function highlight() {
      try {
        const transformers: ShikiTransformer[] = [];
        if (lineNumbers && lineNumbers.length > 0) {
          transformers.push({
            line(node, line) {
              const actualLine = lineNumbers[line - 1];
              if (actualLine === '...') {
                node.properties['data-line'] = '';
                const currentClass = node.properties['className'] as string[] | string | undefined;
                node.properties['className'] = Array.isArray(currentClass)
                  ? [...currentClass, 'gap-line']
                  : (currentClass ? [currentClass, 'gap-line'] : ['gap-line']);
              } else if (actualLine !== undefined) {
                node.properties['data-line'] = String(actualLine);
              }
            }
          });
        }
        
        const html = await codeToHtml(code, {
          lang: language,
          theme: grovkornetTheme as ThemeRegistration,
          transformers
        });
        if (active) {
          setHighlightedHtml(html);
        }
      } catch (err) {
        console.error(err);
        if (active) {
          setHighlightedHtml(`<pre class="shiki"><code>${code}</code></pre>`);
        }
      }
    }
    void highlight();
    return () => {
      active = false;
    };
  }, [code, language, lineNumbers]);

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

      <style>{`
        .shiki-container .line::before {
          content: attr(data-line);
          display: inline-block;
          width: 1.5rem;
          margin-right: 1.25rem;
          text-align: right;
          color: rgba(255, 255, 255, 0.25);
          user-select: none;
        }
        .shiki-container .gap-line::before {
          content: " ";
        }
        .shiki-container .gap-line {
          opacity: 0.5;
          font-style: italic;
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
