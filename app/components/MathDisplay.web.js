import { useEffect, useRef } from 'react';

// Charge KaTeX depuis CDN dynamiquement
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

export default function MathDisplay({ latex, color = '#0055FF', fontSize = 20 }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!latex || !ref.current) return;
    // Enlève les délimiteurs $ si présents
    const clean = latex.replace(/^\$\$?|\$\$?$/g, '').trim();
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
    <div
      ref={ref}
      style={{ color, fontSize, textAlign: 'center', marginBottom: 10, minHeight: 40 }}
    />
  );
}
