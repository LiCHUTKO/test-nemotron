import { Meter } from '../ui/primitives';
import { HealthDot } from '../ui/primitives';
import type { RegionInfo, TopologyNode } from '../../types';

/** Shared inspector bodies — reused by inline panels and the slide-over. */

export function NodeDetails({
  node,
  resolveDep,
  onSelectDep,
}: {
  node: TopologyNode;
  resolveDep: (id: string) => string;
  onSelectDep: (id: string) => void;
}) {
  return (
    <div className="inspector">
      <div className="insp-grid">
        <div><p className="insp-k">Uptime</p><p className="mono insp-v">{node.uptimePct.toFixed(3)}%</p></div>
        <div><p className="insp-k">Latency</p><p className="mono insp-v">{node.latencyMs} ms</p></div>
        <div><p className="insp-k">Throughput</p><p className="mono insp-v">{node.rps.toLocaleString()} rps</p></div>
        <div><p className="insp-k">Version</p><p className="mono insp-v">{node.version}</p></div>
      </div>
      <div className="insp-meter">
        <div className="insp-meter-row"><span>CPU {node.cpu}%</span><Meter value={node.cpu} label={`${node.label} CPU`} /></div>
        <div className="insp-meter-row"><span>MEM {node.memory}%</span><Meter value={node.memory} label={`${node.label} memory`} /></div>
      </div>
      <p className="insp-k">Depends on</p>
      <div className="chip-row">
        {node.dependsOn.length === 0 && <span className="badge badge-muted">NONE — EDGE</span>}
        {node.dependsOn.map((d) => (
          <button key={d} type="button" className="chip-btn" onClick={() => onSelectDep(d)}>
            {resolveDep(d)}
          </button>
        ))}
      </div>
      <p className="insp-k">Operator notes</p>
      <p className="insp-notes">{node.notes}</p>
      <div className="insp-events">
        <p className="insp-k">Recent events</p>
        <ul>
          <li><span className="mono">09:41:12</span> Health check passed (200, 41ms)</li>
          <li><span className="mono">09:36:03</span> Autoscale evaluated — no action</li>
          <li><span className="mono">09:21:47</span> Config hash verified {node.version}</li>
        </ul>
      </div>
    </div>
  );
}

export function RegionDetails({ region }: { region: RegionInfo }) {
  return (
    <div className="inspector">
      <div className="insp-grid">
        <div><p className="insp-k">Latency p95</p><p className="mono insp-v">{region.latencyMs} ms</p></div>
        <div><p className="insp-k">Workloads</p><p className="mono insp-v">{region.workloads}</p></div>
        <div><p className="insp-k">Throughput</p><p className="mono insp-v">{region.throughputGbps} Gbps</p></div>
        <div><p className="insp-k">Health</p><p className="insp-v health-inline"><HealthDot health={region.health} /> {region.health}</p></div>
      </div>
      <p className="insp-k">Placement</p>
      <p className="insp-notes">{region.city}, {region.country} — {region.code}. Serves regional edge, inference overflow and replica reads.</p>
      <div className="insp-events">
        <p className="insp-k">Recent events</p>
        <ul>
          <li><span className="mono">09:41:21</span> Route weights verified by Orion</li>
          <li><span className="mono">09:33:48</span> Capacity headroom {Math.max(8, 100 - region.workloads * 2)}% — nominal</li>
          <li><span className="mono">09:12:05</span> Snapshot replicated to neighbor region</li>
        </ul>
      </div>
    </div>
  );
}
