import { Suspense, lazy, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import AppShell from '../components/layout/AppShell';
import Atmosphere from '../components/layout/Atmosphere';
import BootScreen from '../components/layout/BootScreen';
import ErrorBoundary from '../components/layout/ErrorBoundary';
import PlaceholderSection from '../components/layout/PlaceholderSection';
import CommandPalette from '../components/palette/CommandPalette';
import { SECTIONS } from './sections';
import { useAppStore } from '../stores/useAppStore';
import { useEventSimulation } from '../hooks/useEventSimulation';

const Overview = lazy(() => import('../features/overview/Overview'));
const Telemetry = lazy(() => import('../features/telemetry/Telemetry'));
const Topology = lazy(() => import('../features/topology/Topology'));
const Incidents = lazy(() => import('../features/incidents/Incidents'));
const Deployments = lazy(() => import('../features/deployments/Deployments'));
const Security = lazy(() => import('../features/security/Security'));
const Agents = lazy(() => import('../features/agents/Agents'));
const Terminal = lazy(() => import('../features/terminal/Terminal'));

const BUILT: string[] = [
  'overview',
  'telemetry',
  'infrastructure',
  'incidents',
  'deployments',
  'security',
  'agents',
  'terminal',
];

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
  const setPaletteOpen = useAppStore((s) => s.setPaletteOpen);
  const paletteOpen = useAppStore((s) => s.paletteOpen);
  const searchRef = useRef<HTMLInputElement | null>(null);

  const onSearchFocus = useCallback((el: HTMLInputElement | null) => {
    searchRef.current = el;
  }, []);

  const onFocusTerminal = useCallback(() => {
    const el = document.querySelector<HTMLInputElement>('.term-input');
    el?.focus();
  }, []);

  useEventSimulation(bootComplete);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(!useAppStore.getState().paletteOpen);
      }
      if (e.key === 'Escape' && useAppStore.getState().paletteOpen) {
        setPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setPaletteOpen]);

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
            {section === 'incidents' && <Incidents />}
            {section === 'deployments' && <Deployments />}
            {section === 'security' && <Security />}
            {section === 'agents' && <Agents />}
            {section === 'terminal' && <Terminal />}
            {!BUILT.includes(section) && (
              <PlaceholderSection
                label={meta?.label ?? section}
                hint={meta?.hint ?? 'Operations module'}
              />
            )}
          </Suspense>
        </AppShell>
      )}
      {paletteOpen && <CommandPalette onFocusTerminal={onFocusTerminal} />}
    </ErrorBoundary>
  );
}
