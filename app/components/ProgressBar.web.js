import { useEffect, useRef } from 'react';

const chargerScript = (url) => new Promise((resolve) => {
  if (document.querySelector(`script[src="${url}"]`)) return resolve();
  const script = document.createElement('script');
  script.src = url;
  script.onload = resolve;
  document.head.appendChild(script);
});

const chargerCSS = (url) => {
  if (document.querySelector(`link[href="${url}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;
  document.head.appendChild(link);
};

export default function ProgressBar({ value = 0, preset = 'energy' }) {
  const divRef = useRef(null);
  const barRef = useRef(null);

  useEffect(() => {
    chargerCSS('https://cdn.jsdelivr.net/npm/@loadingio/loading-bar@0.1.1/dist/loading-bar.css');

    chargerScript('https://cdn.jsdelivr.net/npm/@loadingio/loading-bar@0.1.1/dist/loading-bar.js').then(() => {
      if (divRef.current && !barRef.current && window.ldBar) {
        barRef.current = new window.ldBar(divRef.current, { preset, label: false });
        barRef.current.set(value);
      }
    });

    return () => { barRef.current = null; };
  }, []);

  useEffect(() => {
    if (barRef.current) barRef.current.set(value);
  }, [value]);

  return (
    <div
      ref={divRef}
      className="ldBar label-center"
      data-preset={preset}
      style={{ minWidth: 320, height: 50, marginBottom: 0 }}
    />
  );
}
