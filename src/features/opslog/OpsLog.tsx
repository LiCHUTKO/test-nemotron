import { useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play, Search, Trash2 } from 'lucide-react';
import { nextId } from '../../lib/format';
import { createRng } from '../../lib/simulation';
import { EmptyState, Panel, SectionHeader, StatusBadge } from '../../components/ui/primitives';
import type { OpsLogEntry } from '../../types';

const SERVICES = [
  'gateway eu-3', 'api-core', 'auth-cluster', 'telemetry-engine', 'edge-fra',
  'edge-sgp', 'db-primary', 'msg-queue', 'workers-stream', 'ai-inference',
];

const AGENTS = ['Sentinel', 'Orion', 'Atlas', 'Helios', 'Nova', 'Argus'];

const TEMPLATES: Array<{ level: OpsLogEntry['level']; make: (rng: () => number) => string }> = [
  { level: 'ok', make: (r) => `Gateway ${pick(r, ['eu-3', 'us-1', 'ap-2'])} health check recovered` },
  { level: 'agent', make: (r) => `${pick(r, AGENTS)} started anomaly investigation in ${pick(r, ['eu-central-1', 'us-east-1', 'ap-southeast-1'])}` },
  { level: 'deploy', make: (r) => `Deployment ${pick(r, SERVICES)} v${4 + Math.floor(r() * 2)}.${Math.floor(r() * 20)}.${Math.floor(r() * 9)} validated` },
  { level: 'info', make: (r) => `Network route optimized between ${pick(r, ['FRA', 'WAW', 'IAD', 'NRT'])} and ${pick(r, ['WAW', 'FRA', 'SGP', 'GRU'])}` },
  { level: 'security', make: () => 'Suspicious authentication event blocked at edge' },
  { level: 'ok', make: (r) => `Autoscale evaluated for ${pick(r, SERVICES)} — no action` },
  { level: 'agent', make: (r) => `${pick(r, AGENTS)} filed report: drift within ${(r() * 2).toFixed(1)}σ` },
  { level: 'warn', make: (r) => `Consumer lag ${(1 + r() * 3).toFixed(1)}s on ${pick(r, ['kafka-04', 'kafka-07', 'kafka-11'])}` },
  { level: 'info', make: (r) => `Snapshot verified for ${pick(r, ['db-primary', 'object-storage'])} — RPO ${(2 + r() * 5).toFixed(0)}s` },
  { level: 'deploy', make: () => 'Canary analysis passed — error delta within budget' },
  { level: 'critical', make: (r) => `Shard hotspot on ${pick(r, ['analytics-7', 'telemetry-3'])} — rebalance advised` },
  { level: 'ok', make: (r) => `Replica ${pick(r, ['eu-west-1', 'us-east-1'])} caught up — lag 0.4s` },
];

function pick(rng: () => number, arr: string[]): string {
  return arr[Math.floor(rng() * arr.length)];
}

function stamp(): string {
  return new Date().toISOString().slice(11, 19);
}

const LEVEL_TONE: Record<OpsLogEntry['level'], 'ok' | 'warn' | 'crit' | 'info' | 'muted' | 'violet'> = {
  info: 'info',
  ok: 'ok',
  warn: 'warn',
  critical: 'crit',
  agent: 'violet',
  security: 'crit',
  deploy: 'info',
};

const LEVEL_FILTERS = ['ALL', 'info', 'ok', 'warn', 'critical', 'agent', 'security', 'deploy'] as const;

export default function OpsLog() {
  const [entries, setEntries] = useState<OpsLogEntry[]>(() => seedEntries());
  const [paused, setPaused] = useState(false);
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState<(typeof LEVEL_FILTERS)[number]>('ALL');
  const rngRef = useRef(createRng(Date.now() % 100000));

  function seedEntries(): OpsLogEntry[] {
    const rng = createRng(987654);
    const base = Date.now();
    return Array.from({ length: 30 }, (_, i) => {
      const tpl = TEMPLATES[Math.floor(rng() * TEMPLATES.length)];
      const at = new Date(base - (29 - i) * 4000).toISOString().slice(11, 19);
      return { id: nextId('ops'), at, level: tpl.level, message: tpl.make(rng) };
    });
  }

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      const rng = rngRef.current;
      const tpl = TEMPLATES[Math.floor(rng() * TEMPLATES.length)];
      const entry: OpsLogEntry = { id: nextId('ops'), at: stamp(), level: tpl.level, message: tpl.make(rng) };
      setEntries((prev) => [entry, ...prev].slice(0, 150));
    }, 2200);
    return () => window.clearInterval(id);
  }, [paused]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      if (level !== 'ALL' && e.level !== level) return false;
      if (q && !`${e.message} ${e.at}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [entries, query, level]);

  return (
    <div className="opslog">
      <SectionHeader
        eyebrow="AETHER // LIVE OPERATIONS LOG"
        title="Event Stream"
        description="Every heartbeat of the fabric, newest first. Pause to freeze time."
        right={
          <div className="filter-bar">
            <div className="filter-search">
              <Search size={14} aria-hidden="true" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter stream…" aria-label="Filter operations log" />
            </div>
            <select className="select" value={level} onChange={(e) => setLevel(e.target.value as (typeof LEVEL_FILTERS)[number])} aria-label="Filter by level">
              {LEVEL_FILTERS.map((l) => (
                <option key={l} value={l}>{l === 'ALL' ? 'All levels' : l}</option>
              ))}
            </select>
            <button type="button" className="btn btn-ghost" onClick={() => setPaused((p) => !p)} aria-pressed={paused}>
              {paused ? <Play size={14} /> : <Pause size={14} />} {paused ? 'Resume' : 'Pause'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setEntries([])} aria-label="Clear log">
              <Trash2 size={14} />
            </button>
          </div>
        }
      />

      <Panel
        title={paused ? 'Stream paused' : 'Streaming live'}
        subtitle={`${visible.length} events in buffer`}
        action={
          paused
            ? <span className="badge badge-warn">PAUSED</span>
            : <span className="badge badge-ok"><span className="dot dot-ok dot-pulse" /> LIVE</span>
        }
        pad={false}
      >
        {visible.length === 0 ? (
          <EmptyState title="Stream is empty" hint="Resume the stream or clear the filters." />
        ) : (
          <ul className="ops-stream" aria-live={paused ? 'off' : 'polite'} aria-label="Operations events">
            {visible.map((e) => (
              <li key={e.id} className={`ops-row ops-${e.level}`}>
                <span className="mono ops-at">[{e.at}]</span>
                <StatusBadge tone={LEVEL_TONE[e.level]}>{e.level.toUpperCase()}</StatusBadge>
                <span className="ops-msg">{e.message}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
