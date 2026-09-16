import { Suspense, lazy, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import AppShell from '../components/layout/AppShell';
import Atmosphere from '../components/layout/Atmosphere';
import BootScreen from '../components/layout/BootScreen';
import ErrorBoundary from '../components/layout/ErrorBoundary';
import PlaceholderSection from '../components/layout/PlaceholderSection';
import { SECTIONS } from './sections';
import { useAppStore } from '../stores/useAppStore';

const Overview = lazy(() => import('../features/overview/Overview'));
const Telemetry = lazy(() => import('../features/telemetry/Telemetry'));
const Topology = lazy(() => import('../features/topology/Topology'));

function SectionFallback() {
  return (
    <div className="placeholder" role="status" aria-label="Loading module">
      <p className="mono placeholder-meta">LOADING MODULE…</p>
    </div>
  );
}

export default function App() {
  const section = useAppStore((s) => s.section);
  const bootComplete = useAppStore((s) => s.bootComplete);
  const searchRef = useRef<HTMLInputElement | null>(null);

  const onSearchFocus = useCallback((el: HTMLInputElement | null) => {
    searchRef.current = el;
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const meta = SECTIONS.find((s) => s.id === section);

  return (
    <ErrorBoundary>
      <Atmosphere />
      <AnimatePresence>{!bootComplete && <BootScreen />}</AnimatePresence>
      {bootComplete && (
        <AppShell sectionKey={section} onSearchFocus={onSearchFocus}>
          <Suspense fallback={<SectionFallback />}>
            {section === 'overview' && <Overview />}
            {section === 'telemetry' && <Telemetry />}
            {section === 'infrastructure' && <Topology />}
            {!['overview', 'telemetry', 'infrastructure'].includes(section) && (
              <PlaceholderSection
                label={meta?.label ?? section}
                hint={meta?.hint ?? 'Operations module'}
              />
            )}
          </Suspense>
        </AppShell>
      )}
    </ErrorBoundary>
  );
}
