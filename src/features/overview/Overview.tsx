import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import TelemetryChart from '../../components/visualization/TelemetryChart';
import { toChartData } from '../../lib/chart';
import { HealthDot, Panel, SectionHeader, Sparkline, TrendChip } from '../../components/ui/primitives';
import { backboneSeries, createRng } from '../../lib/simulation';
import { formatCompact } from '../../lib/format';
import { useKpis } from '../../hooks/useKpis';
import { useAppStore } from '../../stores/useAppStore';

const FEED_TEMPLATES = [
  'Sentinel finished anomaly sweep across eu-central-1 — no drift beyond 2σ',
  'Network route optimized between FRA and WAW — p95 down 11ms',
  'Deployment api-core v4.18.2 passed verification in production',
  'Gateway eu-3 health check recovered after 42s brownout',
  'Orion rebalanced telemetry partitions — ingest lag falling',
  'Suspicious authentication burst blocked at edge-fra',
  'Atlas pre-scaled stream workers ahead of forecast peak',
  'Snapshot verified for db-primary — RPO 4s, RTO 38s',
];

function useActivityFeed(live: boolean): string[] {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!live) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 4000);
    return () => window.clearInterval(id);
  }, [live]);
  const rng = useMemo(() => createRng(777 + tick), [tick]);
  return useMemo(() => {
    const start = Math.floor(rng() * FEED_TEMPLATES.length);
    return Array.from({ length: 5 }, (_, i) => FEED_TEMPLATES[(start + i) % FEED_TEMPLATES.length]);
  }, [rng]);
}

const CORE_SERVICES = [
  { name: 'Edge Fabric', health: 'healthy' as const, slo: '99.999%' },
  { name: 'API Gateways', health: 'healthy' as const, slo: '99.992%' },
  { name: 'Auth & Identity', health: 'healthy' as const, slo: '99.998%' },
  { name: 'Telemetry Engine', health: 'warning' as const, slo: '99.971%' },
  { name: 'AI Inference', health: 'warning' as const, slo: '99.962%' },
  { name: 'Analytics', health: 'critical' as const, slo: '99.912%' },
];

export default function Overview() {
  const kpis = useKpis(true);
  const setSection = useAppStore((s) => s.setSection);
  const motionEnabled = useAppStore((s) => s.motionEnabled);
  const feed = useActivityFeed(motionEnabled);

  const [backbone, setBackbone] = useState<number[]>(() => backboneSeries(4242, 72));
  useEffect(() => {
    if (!motionEnabled) return;
    const rng = createRng(424242);
    const id = window.setInterval(() => {
      setBackbone((prev) => {
        const last = prev[prev.length - 1];
        const next = Math.min(11.8, Math.max(5.2, last + (rng() - 0.5) * 0.5 + (8.4 - last) * 0.05));
        return [...prev.slice(1), Number(next.toFixed(2))];
      });
    }, 2500);
    return () => window.clearInterval(id);
  }, [motionEnabled]);

  const current = backbone[backbone.length - 1];

  return (
    <div className="overview">
      <SectionHeader
        eyebrow="AETHER // EXECUTIVE OVERVIEW"
        title="Global Status"
        description="Real-time intelligence across regions, services, agents and threat surfaces."
        right={
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setSection('incidents')}>
              Open incidents <ArrowRight size={15} />
            </button>
            <button type="button" className="btn btn-primary" onClick={() => setSection('telemetry')}>
              <Zap size={15} /> Live telemetry
            </button>
          </>
        }
      />

      <div className="grid-kpi" role="list" aria-label="Key performance indicators">
        {kpis.map((k) => (
          <article key={k.id} className="kpi" role="listitem">
            <div className="kpi-top">
              <p className="kpi-label">{k.label}</p>
              <TrendChip deltaPct={k.deltaPct} invert={k.id === 'incidents' || k.id === 'threats' || k.id === 'lat'} />
            </div>
            <p className="kpi-value mono">
              {k.id === 'nodes' || k.id === 'threats' ? formatCompact(k.value, 0) : k.value.toLocaleString('en-US', { maximumFractionDigits: k.decimals, minimumFractionDigits: k.decimals })}
              <span className="kpi-unit">{k.unit}</span>
            </p>
            <Sparkline data={k.series} id={k.id} />
          </article>
        ))}
      </div>

      <div className="overview-row">
        <Panel
          title="Network throughput — global backbone"
          subtitle={`Live aggregate across 12 regions · now ${current.toFixed(2)} Tbps`}
          className="span-2"
          action={<span className="badge badge-ok"><span className="dot dot-ok" /> FLOWING</span>}
        >
          <TelemetryChart id="overview-tput" data={toChartData(backbone, '1H')} color="#56c8ff" unit="Tbps" height={240} />
        </Panel>

        <Panel title="Platform health" subtitle="SLO adherence by plane">
          <ul className="health-list">
            {CORE_SERVICES.map((s) => (
              <li key={s.name}>
                <HealthDot health={s.health} pulse={motionEnabled && s.health !== 'healthy'} />
                <span className="health-name">{s.name}</span>
                <span className="mono health-slo-val">{s.slo}</span>
              </li>
            ))}
          </ul>
          <div className="health-foot">
            <ShieldCheck size={15} aria-hidden="true" />
            <span>4 planes nominal · 2 degraded · 1 critical — see incident command.</span>
          </div>
        </Panel>
      </div>

      <Panel
        title="Autonomous operations — live feed"
        subtitle="What the agent fleet and fabric are doing right now"
        action={<button type="button" className="btn btn-ghost" onClick={() => setSection('opslog')}>Full log <ArrowRight size={14} /></button>}
      >
        <ul className="feed">
          {feed.map((line, i) => (
            <li key={`${i}-${line}`}>
              <span className="mono feed-time">
                {new Date(Date.now() - (4 - i) * 47000).toISOString().slice(11, 19)}
              </span>
              <span className="feed-line">{line}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
