import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  Bot,
  Info,
  LayoutGrid,
  MoonStar,
  Scan,
  ScrollText,
  Server,
  ShieldAlert,
  Shrink,
  Siren,
  Globe2,
  SquareTerminal,
  Rocket,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { SectionId } from '../../types';
import { useAppStore } from '../../stores/useAppStore';

interface Action {
  id: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  run: () => void;
}

/** Ctrl+K command palette — navigation plus interface actions. */
export default function CommandPalette({ onFocusTerminal }: { onFocusTerminal: () => void }) {
  const paletteOpen = useAppStore((s) => s.paletteOpen);
  const setPaletteOpen = useAppStore((s) => s.setPaletteOpen);
  const setSection = useAppStore((s) => s.setSection);
  const toggleCompact = useAppStore((s) => s.toggleCompact);
  const toggleMotion = useAppStore((s) => s.toggleMotion);
  const compactMode = useAppStore((s) => s.compactMode);
  const motionEnabled = useAppStore((s) => s.motionEnabled);
  const pushToast = useAppStore((s) => s.pushToast);

  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const go = (id: SectionId) => {
    setSection(id);
    setPaletteOpen(false);
    if (id === 'terminal') {
      window.setTimeout(onFocusTerminal, 120);
    }
  };

  const actions: Action[] = useMemo(
    () => [
      { id: 'go-overview', label: 'Go to Overview', hint: 'Executive status', icon: LayoutGrid, run: () => go('overview') },
      { id: 'go-telemetry', label: 'Go to Telemetry', hint: 'Signals wall', icon: Activity, run: () => go('telemetry') },
      { id: 'go-infra', label: 'Go to Infrastructure', hint: 'Service graph', icon: Server, run: () => go('infrastructure') },
      { id: 'go-map', label: 'Go to Global Map', hint: 'Regions', icon: Globe2, run: () => go('map') },
      { id: 'go-incidents', label: 'Open Incidents', hint: 'Command center', icon: Siren, run: () => go('incidents') },
      { id: 'go-deploy', label: 'Open Deployments', hint: 'Release control', icon: Rocket, run: () => go('deployments') },
      { id: 'go-agents', label: 'Open Agents', hint: 'Fleet ops', icon: Bot, run: () => go('agents') },
      { id: 'go-security', label: 'Open Security', hint: 'SOC view', icon: ShieldAlert, run: () => go('security') },
      { id: 'go-opslog', label: 'Open Operations Log', hint: 'Live stream', icon: ScrollText, run: () => go('opslog') },
      { id: 'focus-terminal', label: 'Focus Terminal', hint: 'Operator console', icon: SquareTerminal, run: () => go('terminal') },
      { id: 'toggle-compact', label: compactMode ? 'Disable Compact Mode' : 'Enable Compact Mode', hint: 'Interface density', icon: Shrink, run: () => { toggleCompact(); setPaletteOpen(false); } },
      { id: 'toggle-motion', label: motionEnabled ? 'Disable Motion' : 'Enable Motion', hint: 'Animations', icon: MoonStar, run: () => { toggleMotion(); setPaletteOpen(false); } },
      {
        id: 'sysinfo', label: 'Open System Information', hint: 'Build & fabric', icon: Info,
        run: () => {
          pushToast({ title: 'AETHER v4.2.17 · stable', detail: '248 nodes · 12 regions · SLO 99.982%', severity: 'info' });
          setPaletteOpen(false);
        },
      },
      { id: 'scan', label: 'Run Deep Scan', hint: 'Simulated sweep', icon: Scan, run: () => { pushToast({ title: 'Deep scan started', detail: 'Sweeping 248 nodes for drift…', severity: 'info' }); setPaletteOpen(false); } },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [compactMode, motionEnabled],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions;
    return actions.filter((a) => `${a.label} ${a.hint}`.toLowerCase().includes(q));
  }, [actions, query]);

  useEffect(() => {
    if (paletteOpen) {
      setQuery('');
      setIndex(0);
      window.setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [paletteOpen]);

  useEffect(() => {
    setIndex(0);
  }, [query]);

  if (!paletteOpen) return null;

  return (
    <div className="palette-scrim" onClick={() => setPaletteOpen(false)} role="presentation">
      <div
        className="palette"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="palette-input-row">
          <span className="mono palette-kbd">⌘K</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setPaletteOpen(false);
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setIndex((i) => Math.min(i + 1, filtered.length - 1));
              }
              if (e.key === 'ArrowUp') {
                e.preventDefault();
                setIndex((i) => Math.max(i - 1, 0));
              }
              if (e.key === 'Enter' && filtered[index]) filtered[index].run();
            }}
            placeholder="Type a command or search modules…"
            aria-label="Command palette input"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={filtered[index] ? `palette-${filtered[index].id}` : undefined}
            autoComplete="off"
          />
        </div>
        <ul className="palette-list" id="palette-list" role="listbox" aria-label="Commands">
          {filtered.length === 0 && <li className="palette-empty">No matching commands.</li>}
          {filtered.map((a, i) => (
            <li key={a.id} role="option" id={`palette-${a.id}`} aria-selected={i === index}>
              <button
                type="button"
                className={`palette-item${i === index ? ' is-active' : ''}`}
                onMouseEnter={() => setIndex(i)}
                onClick={() => a.run()}
              >
                <a.icon size={16} aria-hidden="true" />
                <span className="palette-label">{a.label}</span>
                <small>{a.hint}</small>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
