import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import AppShell from '../components/layout/AppShell';
import Atmosphere from '../components/layout/Atmosphere';
import BootScreen from '../components/layout/BootScreen';
import ErrorBoundary from '../components/layout/ErrorBoundary';
import PlaceholderSection from '../components/layout/PlaceholderSection';
import CommandPalette from '../components/palette/CommandPalette';
import GlobalInspector from '../components/inspector/GlobalInspector';
import { SECTIONS } from './sections';
import { useAppStore } from '../stores/useAppStore';
import { useEventSimulation } from '../hooks/useEventSimulation';
import { useKonamiCode } from '../hooks/useKonami';

const Overview = lazy(() => import('../features/overview/Overview'));
const Telemetry = lazy(() => import('../features/telemetry/Telemetry'));
const Topology = lazy(() => import('../features/topology/Topology'));
const Incidents = lazy(() => import('../features/incidents/Incidents'));
const Deployments = lazy(() => import('../features/deployments/Deployments'));
const Security = lazy(() => import('../features/security/Security'));
const Agents = lazy(() => import('../features/agents/Agents'));
const Terminal = lazy(() => import('../features/terminal/Terminal'));
const GlobalMap = lazy(() => import('../features/geomap/GlobalMap'));
const OpsLog = lazy(() => import('../features/opslog/OpsLog'));

const BUILT: string[] = [
  'overview',
  'telemetry',
  'infrastructure',
  'incidents',
  'deployments',
  'security',
  'agents',
  'terminal',
  'map',
  'opslog',
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
  const pushToast = useAppStore((s) => s.pushToast);
  const [cosmic, setCosmic] = useState(false);
  const searchRef = useRef<HTMLInputElement | null>(null);

  const onSearchFocus = useCallback((el: HTMLInputElement | null) => {
    searchRef.current = el;
  }, []);

  const onFocusTerminal = useCallback(() => {
    const el = document.querySelector<HTMLInputElement>('.term-input');
    el?.focus();
  }, []);

  useEventSimulation(bootComplete);

  const onKonami = useCallback(() => {
    pushToast({ title: 'CHEAT CODE ACCEPTED', detail: 'Operator clearance elevated to COSMIC.', severity: 'info' });
    setCosmic(true);
    window.setTimeout(() => setCosmic(false), 8000);
  }, [pushToast]);
  useKonamiCode(onKonami);

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
        <div className={cosmic ? 'shell-cosmic' : undefined}>
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
            {section === 'map' && <GlobalMap />}
            {section === 'opslog' && <OpsLog />}
            {!BUILT.includes(section) && (
              <PlaceholderSection
                label={meta?.label ?? section}
                hint={meta?.hint ?? 'Operations module'}
              />
            )}
          </Suspense>
        </AppShell>
        </div>
      )}
      <GlobalInspector />
      {paletteOpen && <CommandPalette onFocusTerminal={onFocusTerminal} />}
    </ErrorBoundary>
  );
}
