import {
  Activity,
  Bell,
  Bot,
  ChevronRight,
  Globe2,
  LayoutGrid,
  ScrollText,
  Server,
  ShieldAlert,
  Siren,
  SquareTerminal,
  Rocket,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { SectionId } from '../../types';
import { SECTIONS } from '../../app/sections';
import { useAppStore } from '../../stores/useAppStore';

const ICONS: Record<SectionId, LucideIcon> = {
  overview: LayoutGrid,
  telemetry: Activity,
  infrastructure: Server,
  map: Globe2,
  incidents: Siren,
  deployments: Rocket,
  agents: Bot,
  security: ShieldAlert,
  opslog: ScrollText,
  terminal: SquareTerminal,
};

const GROUPS = ['Command', 'Observe', 'Respond', 'Operate'] as const;

export default function Sidebar() {
  const section = useAppStore((s) => s.section);
  const setSection = useAppStore((s) => s.setSection);
  const mobileNavOpen = useAppStore((s) => s.mobileNavOpen);
  const setMobileNavOpen = useAppStore((s) => s.setMobileNavOpen);
  const compactMode = useAppStore((s) => s.compactMode);

  return (
    <>
      <div
        className={`nav-scrim${mobileNavOpen ? ' is-open' : ''}`}
        onClick={() => setMobileNavOpen(false)}
        aria-hidden="true"
      />
      <aside className={`sidebar${mobileNavOpen ? ' is-open' : ''}`} aria-label="Primary">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            <span className="brand-core" />
            <span className="brand-ring" />
          </span>
          {!compactMode && (
            <span className="brand-text">
              <strong>AETHER</strong>
              <small className="mono">OPS NEXUS · v4.2</small>
            </span>
          )}
          <button
            type="button"
            className="icon-btn nav-close"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close navigation"
          >
            <X size={16} />
          </button>
        </div>

        <nav className="nav">
          {GROUPS.map((group) => (
            <div key={group} className="nav-group">
              {!compactMode && <p className="nav-group-label mono">{group}</p>}
              {SECTIONS.filter((s) => s.group === group).map((s) => {
                const Icon = ICONS[s.id];
                const active = section === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    className={`nav-item${active ? ' is-active' : ''}`}
                    onClick={() => setSection(s.id)}
                    aria-current={active ? 'page' : undefined}
                    title={compactMode ? s.label : undefined}
                  >
                    <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
                    {!compactMode && (
                      <>
                        <span className="nav-label">{s.label}</span>
                        {s.id === 'incidents' && (
                          <span className="nav-pill" aria-label="3 open incidents">
                            3
                          </span>
                        )}
                        {active && <ChevronRight size={14} className="nav-caret" aria-hidden="true" />}
                      </>
                    )}
                    {active && <span className="nav-active-bar" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-foot">
          <div className="foot-row">
            <Bell size={14} aria-hidden="true" />
            {!compactMode && <span>All channels nominal</span>}
            <span className="dot dot-ok" aria-hidden="true" />
          </div>
          {!compactMode && <p className="mono foot-meta">BUILD 4.2.17 · EU-WEST</p>}
        </div>
      </aside>
    </>
  );
}
