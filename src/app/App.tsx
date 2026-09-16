import { useCallback, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import AppShell from '../components/layout/AppShell';
import Atmosphere from '../components/layout/Atmosphere';
import BootScreen from '../components/layout/BootScreen';
import ErrorBoundary from '../components/layout/ErrorBoundary';
import PlaceholderSection from '../components/layout/PlaceholderSection';
import { SECTIONS } from './sections';
import { useAppStore } from '../stores/useAppStore';

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
          <PlaceholderSection
            label={meta?.label ?? section}
            hint={meta?.hint ?? 'Operations module'}
          />
        </AppShell>
      )}
    </ErrorBoundary>
  );
}
