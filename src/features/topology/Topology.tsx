import { useMemo, useState } from 'react';
import { LAYER_LABELS, TOPOLOGY_NODES } from '../../data/topology';
import { HealthDot, Meter, Panel, SectionHeader, StatusBadge } from '../../components/ui/primitives';
import { useAppStore } from '../../stores/useAppStore';
import type { HealthState, TopologyNode } from '../../types';

const W = 1240;
const H = 640;
const NODE_W = 136;
const NODE_H = 54;

const HEALTH_FILL: Record<HealthState, { fill: string; stroke: string }> = {
  healthy: { fill: '#0f2a1fee', stroke: '#43e8a066' },
  warning: { fill: '#2a2111ee', stroke: '#ffb45477' },
  critical: { fill: '#2a1218ee', stroke: '#ff5d6c88' },
  maintenance: { fill: '#1c1633ee', stroke: '#9a7bff77' },
};

interface Placed extends TopologyNode {
  x: number;
  y: number;
}

function layout(): Placed[] {
  const byLayer = new Map<number, TopologyNode[]>();
  for (const n of TOPOLOGY_NODES) {
    const arr = byLayer.get(n.layer) ?? [];
    arr.push(n);
    byLayer.set(n.layer, arr);
  }
  const out: Placed[] = [];
  for (const [layer, nodes] of byLayer) {
    const cx = 96 + layer * 152;
    nodes.forEach((n, i) => {
      const y = H / 2 - ((nodes.length - 1) * 104) / 2 + i * 104 - NODE_H / 2;
      out.push({ ...n, x: cx - NODE_W / 2, y });
    });
  }
  return out;
}

function edgePath(a: Placed, b: Placed): string {
  const x1 = a.x + NODE_W;
  const y1 = a.y + NODE_H / 2;
  const x2 = b.x;
  const y2 = b.y + NODE_H / 2;
  const dx = Math.max(40, (x2 - x1) / 2);
  return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
}

function toneFor(health: HealthState): 'ok' | 'warn' | 'crit' | 'violet' {
  if (health === 'healthy') return 'ok';
  if (health === 'warning') return 'warn';
  if (health === 'critical') return 'crit';
  return 'violet';
}

export default function Topology() {
  const placed = useMemo(layout, []);
  const byId = useMemo(() => new Map(placed.map((p) => [p.id, p])), [placed]);
  const motionEnabled = useAppStore((s) => s.motionEnabled);
  const inspectorNodeId = useAppStore((s) => s.inspectorNodeId);
  const setInspectorNodeId = useAppStore((s) => s.setInspectorNodeId);
  const [hoverId, setHoverId] = useState<string | null>(null);

  const selected = inspectorNodeId ? byId.get(inspectorNodeId) ?? null : null;

  const related = useMemo(() => {
    if (!selected) return null;
    const set = new Set<string>([selected.id, ...selected.dependsOn]);
    for (const p of placed) {
      if (p.dependsOn.includes(selected.id)) set.add(p.id);
    }
    return set;
  }, [selected, placed]);

  const edges = useMemo(() => {
    const list: Array<{ key: string; d: string; hot: boolean }> = [];
    for (const p of placed) {
      for (const dep of p.dependsOn) {
        const src = byId.get(dep);
        if (!src) continue;
        const d = edgePath(src, p);
        const hot = related ? related.has(p.id) && related.has(dep) : false;
        list.push({ key: `${dep}->${p.id}`, d, hot });
      }
    }
    return list;
  }, [placed, byId, related]);

  const counts = useMemo(() => {
    const c: Record<HealthState, number> = { healthy: 0, warning: 0, critical: 0, maintenance: 0 };
    for (const p of placed) c[p.health] += 1;
    return c;
  }, [placed]);

  return (
    <div className="topology">
      <SectionHeader
        eyebrow="AETHER // INFRASTRUCTURE TOPOLOGY"
        title="Service Graph"
        description="Live dependency fabric from ingress to storage. Select any node to inspect it; related services highlight automatically."
        right={
          <div className="legend" aria-label="Health legend">
            <span><HealthDot health="healthy" /> {counts.healthy}</span>
            <span><HealthDot health="warning" /> {counts.warning}</span>
            <span><HealthDot health="critical" /> {counts.critical}</span>
            <span><HealthDot health="maintenance" /> {counts.maintenance}</span>
          </div>
        }
      />

      <div className="topo-grid">
        <Panel className="topo-canvas-panel" pad={false} title="Dependency fabric">
          <div className="topo-scroll">
            <svg viewBox={`0 0 ${W} ${H}`} className="topo-svg" role="img" aria-label="Infrastructure service topology graph">
              {LAYER_LABELS.map((label, i) => (
                <text key={label} x={96 + i * 152} y={26} textAnchor="middle" className="topo-layer">
                  {label.toUpperCase()}
                </text>
              ))}
              {edges.map((e, i) => (
                <g key={e.key}>
                  <path d={e.d} className={`topo-edge${e.hot ? ' is-hot' : ''}${related && !e.hot ? ' is-dim' : ''}`} fill="none" />
                  {motionEnabled && (
                    <circle r={3} className="topo-pulse" fill="#56c8ff">
                      <animateMotion dur={`${3 + (i % 4)}s`} repeatCount="indefinite" path={e.d} />
                    </circle>
                  )}
                </g>
              ))}
              {placed.map((p) => {
                const c = HEALTH_FILL[p.health];
                const dim = related && !related.has(p.id);
                const active = selected?.id === p.id || hoverId === p.id;
                return (
                  <g
                    key={p.id}
                    transform={`translate(${p.x}, ${p.y})`}
                    className={`topo-node${dim ? ' is-dim' : ''}${active ? ' is-active' : ''}`}
                    onClick={() => setInspectorNodeId(selected?.id === p.id ? null : p.id)}
                    onMouseEnter={() => setHoverId(p.id)}
                    onMouseLeave={() => setHoverId(null)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setInspectorNodeId(selected?.id === p.id ? null : p.id);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`${p.label}, ${p.health}`}
                  >
                    <title>{`${p.label} — ${p.health}, ${p.region}, CPU ${p.cpu}%`}</title>
                    <rect width={NODE_W} height={NODE_H} rx={10} fill={c.fill} stroke={c.stroke} strokeWidth={active ? 2 : 1.2} />
                    <circle cx={14} cy={NODE_H / 2} r={4} className={`topo-health topo-${p.health}`} />
                    <text x={26} y={23} className="topo-label">{p.label}</text>
                    <text x={26} y={39} className="topo-sub">{`${p.region} · ${p.version}`}</text>
                  </g>
                );
              })}
            </svg>
          </div>
        </Panel>

        <Panel
          title={selected ? selected.label : 'Fleet inspector'}
          subtitle={selected ? `${selected.kind} · ${selected.region}` : 'Select a node in the graph'}
          action={selected ? <StatusBadge tone={toneFor(selected.health)}>{selected.health.toUpperCase()}</StatusBadge> : undefined}
        >
          {selected ? (
            <div className="inspector">
              <div className="insp-grid">
                <div><p className="insp-k">Uptime</p><p className="mono insp-v">{selected.uptimePct.toFixed(3)}%</p></div>
                <div><p className="insp-k">Latency</p><p className="mono insp-v">{selected.latencyMs} ms</p></div>
                <div><p className="insp-k">Throughput</p><p className="mono insp-v">{selected.rps.toLocaleString()} rps</p></div>
                <div><p className="insp-k">Version</p><p className="mono insp-v">{selected.version}</p></div>
              </div>
              <div className="insp-meter">
                <div className="insp-meter-row"><span>CPU {selected.cpu}%</span><Meter value={selected.cpu} label={`${selected.label} CPU`} /></div>
                <div className="insp-meter-row"><span>MEM {selected.memory}%</span><Meter value={selected.memory} label={`${selected.label} memory`} /></div>
              </div>
              <p className="insp-k">Depends on</p>
              <div className="chip-row">
                {selected.dependsOn.length === 0 && <span className="badge badge-muted">NONE — EDGE</span>}
                {selected.dependsOn.map((d) => (
                  <button key={d} type="button" className="chip-btn" onClick={() => setInspectorNodeId(d)}>
                    {byId.get(d)?.label ?? d}
                  </button>
                ))}
              </div>
              <p className="insp-k">Operator notes</p>
              <p className="insp-notes">{selected.notes}</p>
              <div className="insp-events">
                <p className="insp-k">Recent events</p>
                <ul>
                  <li><span className="mono">09:41:12</span> Health check passed (200, 41ms)</li>
                  <li><span className="mono">09:36:03</span> Autoscale evaluated — no action</li>
                  <li><span className="mono">09:21:47</span> Config hash verified {selected.version}</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="inspector">
              <div className="insp-grid">
                <div><p className="insp-k">Services</p><p className="mono insp-v">{placed.length}</p></div>
                <div><p className="insp-k">Healthy</p><p className="mono insp-v">{counts.healthy}</p></div>
                <div><p className="insp-k">Degraded</p><p className="mono insp-v">{counts.warning + counts.critical}</p></div>
                <div><p className="insp-k">In maintenance</p><p className="mono insp-v">{counts.maintenance}</p></div>
              </div>
              <p className="insp-notes">Click any service node to inspect resources, dependencies and recent events. Edge pulses show live request flow while motion is enabled.</p>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
