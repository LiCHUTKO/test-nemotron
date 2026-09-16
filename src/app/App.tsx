import { useEffect, useState } from 'react';

/**
 * Temporary scaffold shell — replaced by the full application shell in the
 * "application shell and design system" milestone.
 */
export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setReady(true), 250);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: 'var(--bg-0)',
        color: 'var(--text-1)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <p className="mono" style={{ letterSpacing: '0.4em', color: 'var(--accent)' }}>
          AETHER
        </p>
        <h1 style={{ fontWeight: 650 }}>Global Operations Nexus</h1>
        <p style={{ color: 'var(--text-2)' }}>
          {ready ? 'Scaffold online — building systems…' : 'Initializing…'}
        </p>
      </div>
    </main>
  );
}
