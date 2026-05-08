import { useEffect, useRef } from 'react';

function loadKaTeX() {
  return new Promise((resolve) => {
    if (window.katex) return resolve();
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
    document.head.appendChild(link);
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js';
    script.onload = resolve;
    document.head.appendChild(script);
  });
}

export default function MathDisplay({ latex, color = '#0055FF' }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!latex || !ref.current) return;
    const clean = latex.replace(/^\$+|\$+$/g, '').trim();
    loadKaTeX().then(() => {
      if (ref.current && window.katex) {
        try {
          window.katex.render(clean, ref.current, {
            throwOnError: false,
            displayMode: true,
          });
        } catch (e) {
          ref.current.textContent = latex;
        }
      }
    });
  }, [latex]);

  return (
    <div style={{
      width: '100%',
      textAlign: 'center',
      color,
      paddingTop: 8,
      paddingBottom: 16,
      boxSizing: 'border-box',
      lineHeight: 'normal',
    }}>
      <div ref={ref} />
    </div>
  );
}
