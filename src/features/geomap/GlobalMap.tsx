import { useMemo, useState } from 'react';
import { GRID_COLS, GRID_ROWS, REGIONS, WORLD_ROWS, peersFor } from '../../data/regions';
import { HealthDot, Panel, SectionHeader, StatusBadge } from '../../components/ui/primitives';
import { useAppStore } from '../../stores/useAppStore';
import type { HealthState } from '../../types';

const W = 960;
const H = 480;
const CX = W / GRID_COLS;
const CY = H / GRID_ROWS;

const HEALTH_COLOR: Record<HealthState, string> = {
  healthy: '#43e8a0',
  warning: '#ffb454',
  critical: '#ff5d6c',
  maintenance: '#9a7bff',
};

function toneFor(health: HealthState): 'ok' | 'warn' | 'crit' | 'violet' {
  if (health === 'healthy') return 'ok';
  if (health === 'warning') return 'warn';
  if (health === 'critical') return 'crit';
  return 'violet';
}

/** Curved great-circle-style link between two normalized points. */
function linkPath(ax: number, ay: number, bx: number, by: number): string {
  const x1 = ax * W;
  const y1 = ay * H;
  const x2 = bx * W;
  const y2 = by * H;
  const mx = (x1 + x2) / 2;
  const my = Math.min(y1, y2) - Math.abs(x2 - x1) * 0.22 - 24;
  return `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
}

export default function GlobalMap() {
  const motionEnabled = useAppStore((s) => s.motionEnabled);
  const setInspectorNodeId = useAppStore((s) => s.setInspectorNodeId);
  const [selectedId, setSelectedId] = useState<string>('rg-fra');

  const selected = REGIONS.find((r) => r.id === selectedId) ?? REGIONS[0];
  const peers = useMemo(() => peersFor(selected.id), [selected.id]);

  const dots = useMemo(() => {
    const out: Array<{ x: number; y: number; key: string }> = [];
    for (const [row, spans] of Object.entries(WORLD_ROWS)) {
      const y = Number(row);
      for (const [a, b] of spans) {
        for (let x = a; x <= b; x++) {
          out.push({ x: x * CX + CX / 2, y: y * CY + CY / 2, key: `${y}-${x}` });
        }
      }
    }
    return out;
  }, []);

  return (
    <div className="geomap">
      <SectionHeader
        eyebrow="AETHER // GLOBAL FOOTPRINT"
        title="World Operations"
        description="Eight regions, one fabric. Select a region to trace its live traffic flows."
        right={<span className="badge badge-ok"><span className="dot dot-ok" /> MESH CONNECTED</span>}
      />

      <div className="map-grid">
        <Panel pad={false} title="Planetary mesh" className="map-canvas-panel">
          <svg viewBox={`0 0 ${W} ${H}`} className="map-svg" role="img" aria-label="Stylized world infrastructure map">
            {dots.map((d) => (
              <circle key={d.key} cx={d.x} cy={d.y} r={1.6} className="map-dot" />
            ))}
            {peers.map((p) => (
              <g key={p.id}>
                <path d={linkPath(selected.x, selected.y, p.x, p.y)} className="map-link" fill="none" />
                {motionEnabled && (
                  <>
                    <circle r={3.4} fill="#56c8ff" className="map-flow">
                      <animateMotion dur="3.2s" repeatCount="indefinite" path={linkPath(selected.x, selected.y, p.x, p.y)} />
                    </circle>
                    <circle r={2.2} fill="#9a7bff" className="map-flow" opacity={0.8}>
                      <animateMotion dur="4.6s" repeatCount="indefinite" path={linkPath(p.x, p.y, selected.x, selected.y)} />
                    </circle>
                  </>
                )}
              </g>
            ))}
            {REGIONS.map((r) => {
              const active = r.id === selected.id;
              return (
                <g
                  key={r.id}
                  transform={`translate(${r.x * W}, ${r.y * H})`}
                  className={`map-node${active ? ' is-active' : ''}`}
                  onClick={() => {
                    setSelectedId(r.id);
                    setInspectorNodeId(r.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedId(r.id);
                      setInspectorNodeId(r.id);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`${r.city}, ${r.health}, ${r.latencyMs} milliseconds`}
                >
                  <title>{`${r.city} — ${r.health} · ${r.latencyMs}ms · ${r.workloads} workloads`}</title>
                  {active && motionEnabled && <circle r={16} className="map-ring" fill="none" />}
                  <circle r={active ? 8 : 6} className="map-halo" fill="none" />
                  <circle r={active ? 5 : 4} fill={HEALTH_COLOR[r.health]} className="map-core" />
                  <text y={-14} textAnchor="middle" className="map-city">{r.city.toUpperCase()}</text>
                </g>
              );
            })}
          </svg>
          <div className="map-flows" aria-label="Active flows">
            {peers.map((p) => (
              <span key={p.id} className="mono">
                {selected.code} ⇄ {p.code} · {Math.round((selected.throughputGbps * p.throughputGbps) / 900)} Gbps
              </span>
            ))}
          </div>
        </Panel>

        <Panel
          title={`${selected.city} — ${selected.code}`}
          subtitle={`${selected.country} · click another node to retrace flows`}
          action={<StatusBadge tone={toneFor(selected.health)}>{selected.health.toUpperCase()}</StatusBadge>}
        >
          <div className="inspector">
            <div className="insp-grid">
              <div><p className="insp-k">Latency p95</p><p className="mono insp-v">{selected.latencyMs} ms</p></div>
              <div><p className="insp-k">Workloads</p><p className="mono insp-v">{selected.workloads}</p></div>
              <div><p className="insp-k">Throughput</p><p className="mono insp-v">{selected.throughputGbps} Gbps</p></div>
              <div><p className="insp-k">Health</p><p className="insp-v health-inline"><HealthDot health={selected.health} /> {selected.health}</p></div>
            </div>
            <p className="insp-k">All regions</p>
            <ul className="region-list">
              {REGIONS.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    className={`region-row${r.id === selected.id ? ' is-selected' : ''}`}
                    onClick={() => {
                      setSelectedId(r.id);
                      setInspectorNodeId(r.id);
                    }}
                  >
                    <HealthDot health={r.health} />
                    <span className="region-city">{r.city}</span>
                    <span className="mono region-lat">{r.latencyMs}ms</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </Panel>
      </div>
    </div>
  );
}
