import { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, CheckCheck, ChevronDown, Menu, Search, Trash2 } from 'lucide-react';
import type { Environment } from '../../types';
import { SECTIONS } from '../../app/sections';
import { useClock } from '../../hooks/useClock';
import { formatClock, formatUTC } from '../../lib/format';
import { useAppStore } from '../../stores/useAppStore';
import { HealthDot } from '../ui/primitives';

const ENVS: Environment[] = ['production', 'staging', 'development'];

export default function Topbar({ onSearchFocus }: { onSearchFocus: (el: HTMLInputElement | null) => void }) {
  const now = useClock();
  const section = useAppStore((s) => s.section);
  const environment = useAppStore((s) => s.environment);
  const setEnvironment = useAppStore((s) => s.setEnvironment);
  const setSection = useAppStore((s) => s.setSection);
  const setMobileNavOpen = useAppStore((s) => s.setMobileNavOpen);
  const toasts = useAppStore((s) => s.toasts);
  const clearToasts = useAppStore((s) => s.clearToasts);
  const dismissToast = useAppStore((s) => s.dismissToast);
  const setPaletteOpen = useAppStore((s) => s.setPaletteOpen);
  const motionEnabled = useAppStore((s) => s.motionEnabled);

  const [query, setQuery] = useState('');
  const [bellOpen, setBellOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement | null>(null);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return SECTIONS.filter(
      (s) => s.label.toLowerCase().includes(q) || s.hint.toLowerCase().includes(q),
    ).slice(0, 5);
  }, [query]);

  const go = (id: (typeof SECTIONS)[number]['id']) => {
    setSection(id);
    setQuery('');
    searchRef.current?.blur();
  };

  return (
    <header className="topbar" aria-label="Global status bar">
      <button
        type="button"
        className="icon-btn nav-open"
        aria-label="Open navigation"
        onClick={() => setMobileNavOpen(true)}
      >
        <Menu size={18} />
      </button>

      <button type="button" className="health-pill" onClick={() => setSection('overview')} aria-label="Global health: operational. Go to overview.">
        <HealthDot health="healthy" pulse={motionEnabled} />
        <span className="health-text">OPERATIONAL</span>
        <span className="mono health-slo">SLO 99.98%</span>
      </button>

      <div className="clocks" aria-label="Clocks">
        <div className="clock">
          <span className="clock-label mono">UTC</span>
          <span className="clock-value mono">{formatUTC(now)}</span>
        </div>
        <div className="clock clock-local">
          <span className="clock-label mono">LOCAL</span>
          <span className="clock-value mono">{formatClock(now)}</span>
        </div>
      </div>

      <div className="top-search">
        <Search size={15} aria-hidden="true" />
        <input
          ref={(el) => {
            searchRef.current = el;
            onSearchFocus(el);
          }}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && matches.length > 0) go(matches[0].id);
            if (e.key === 'Escape') {
              setQuery('');
              searchRef.current?.blur();
            }
          }}
          placeholder="Search modules…  ( Ctrl+K )"
          value={query}
          aria-label="Search modules"
          role="combobox"
          aria-expanded={matches.length > 0}
          aria-controls="top-search-results"
          autoComplete="off"
        />
        {matches.length > 0 && (
          <ul className="search-results" id="top-search-results" role="listbox">
            {matches.map((m) => (
              <li key={m.id} role="option" aria-selected={section === m.id}>
                <button type="button" onClick={() => go(m.id)}>
                  <span>{m.label}</span>
                  <small>{m.hint}</small>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        type="button"
        className="env-select"
        aria-label={`Environment: ${environment}. Activate to cycle environments.`}
        title={`Environment: ${environment}`}
        onClick={() => setEnvironment(ENVS[(ENVS.indexOf(environment) + 1) % ENVS.length])}
      >
        <span className={`dot dot-${environment === 'production' ? 'ok' : environment === 'staging' ? 'warn' : 'maint'}`} aria-hidden="true" />
        <span className="mono env-name">{environment.slice(0, 4).toUpperCase()}</span>
        <ChevronDown size={13} aria-hidden="true" />
      </button>

      <div className="bell-wrap">
        <button
          type="button"
          className="icon-btn bell-btn"
          aria-label={`Notifications, ${toasts.length} unread`}
          aria-expanded={bellOpen}
          onClick={() => setBellOpen((o) => !o)}
        >
          <Bell size={17} />
          {toasts.length > 0 && <span className="bell-count">{toasts.length}</span>}
        </button>
        <AnimatePresence>
          {bellOpen && (
            <motion.div
              className="bell-panel"
              role="dialog"
              aria-label="Notifications"
              initial={motionEnabled ? { opacity: 0, y: -6 } : false}
              animate={{ opacity: 1, y: 0 }}
              exit={motionEnabled ? { opacity: 0, y: -6 } : undefined}
              transition={{ duration: 0.16 }}
            >
              <div className="bell-head">
                <strong>Notifications</strong>
                <div className="bell-actions">
                  <button type="button" className="icon-btn" aria-label="Mark all read" onClick={() => { clearToasts(); setBellOpen(false); }}>
                    <CheckCheck size={15} />
                  </button>
                  <button type="button" className="icon-btn" aria-label="Clear notifications" onClick={() => { clearToasts(); }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              {toasts.length === 0 ? (
                <p className="bell-empty">All clear — no active alerts.</p>
              ) : (
                <ul className="bell-list">
                  {toasts.map((t) => (
                    <li key={t.id} className={`bell-item bell-${t.severity}`}>
                      <div>
                        <p>{t.title}</p>
                        {t.detail && <small>{t.detail}</small>}
                      </div>
                      <button type="button" className="icon-btn" aria-label={`Dismiss ${t.title}`} onClick={() => dismissToast(t.id)}>
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button type="button" className="cmdk-btn mono" onClick={() => setPaletteOpen(true)} aria-label="Open command palette">
        ⌘K
      </button>

      <div className="operator" aria-label="Signed in as Operator">
        <span className="avatar" aria-hidden="true">
          OP
        </span>
        <span className="operator-text">
          <strong>Operator</strong>
          <small className="mono">SRE · L3</small>
        </span>
      </div>
    </header>
  );
}
