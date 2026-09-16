import { useEffect, useMemo, useRef, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { LIVE_TEMPLATES, SECURITY_EVENTS, SECURITY_STATS, THREAT_LEVEL } from '../../data/security';
import { isoToUtcClock, timeAgo } from '../../lib/format';
import { nextId } from '../../lib/format';
import { Meter, Panel, SectionHeader, StatusBadge, TrendChip } from '../../components/ui/primitives';
import { createRng } from '../../lib/simulation';
import { useAppStore } from '../../stores/useAppStore';
import type { SecurityEvent, ThreatSeverity } from '../../types';

const SEV_TONE: Record<ThreatSeverity, 'crit' | 'warn' | 'info' | 'muted'> = {
  critical: 'crit',
  high: 'warn',
  medium: 'info',
  low: 'muted',
};

const STATUS_TONE: Record<SecurityEvent['status'], 'ok' | 'info' | 'warn'> = {
  blocked: 'ok',
  monitoring: 'warn',
  resolved: 'info',
};

const FILTERS = ['ALL', 'critical', 'high', 'medium', 'low'] as const;

export default function Security() {
  const motionEnabled = useAppStore((s) => s.motionEnabled);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('ALL');
  const [events, setEvents] = useState<SecurityEvent[]>(SECURITY_EVENTS);
  const rngRef = useRef(createRng(5150));

  // A new sensor finding lands every ~9s while motion is enabled.
  useEffect(() => {
    if (!motionEnabled) return;
    const id = window.setInterval(() => {
      const rng = rngRef.current;
      const tpl = LIVE_TEMPLATES[Math.floor(rng() * LIVE_TEMPLATES.length)];
      const evt: SecurityEvent = {
        id: nextId('sec-live'),
        type: tpl.type,
        severity: tpl.severity,
        source: `sensor ${Math.floor(rng() * 40) + 1} · edge`,
        destination: 'soc-ingest',
        timestamp: new Date().toISOString(),
        status: 'monitoring',
        detail: tpl.detail,
      };
      setEvents((prev) => [evt, ...prev].slice(0, 24));
    }, 9000);
    return () => window.clearInterval(id);
  }, [motionEnabled]);

  const visible = useMemo(
    () => (filter === 'ALL' ? events : events.filter((e) => e.severity === filter)),
    [events, filter],
  );

  return (
    <div className="security">
      <SectionHeader
        eyebrow="AETHER // SECURITY OPERATIONS"
        title="Threat Surface"
        description="SOC view across edge, identity and workload planes. Findings stream live from the sensor grid."
        right={
          <select className="select" value={filter} onChange={(e) => setFilter(e.target.value as (typeof FILTERS)[number])} aria-label="Filter by severity">
            {FILTERS.map((f) => (
              <option key={f} value={f}>{f === 'ALL' ? 'All severities' : f}</option>
            ))}
          </select>
        }
      />

      <div className="sec-top">
        <Panel title="Global threat level" subtitle={THREAT_LEVEL.note}>
          <div className="threat">
            <span className="threat-badge" aria-label={`Threat level ${THREAT_LEVEL.level}`}>
              <ShieldAlert size={20} aria-hidden="true" /> {THREAT_LEVEL.level}
            </span>
            <Meter value={THREAT_LEVEL.score} label="Threat score" />
            <p className="mono threat-score">{THREAT_LEVEL.score} / 100</p>
          </div>
        </Panel>
        <div className="sec-stats">
          {SECURITY_STATS.map((s) => (
            <div key={s.id} className="sec-stat">
              <p className="sec-stat-label">{s.label}</p>
              <p className="mono sec-stat-value">{s.value.toLocaleString('en-US')}</p>
              <TrendChip deltaPct={s.deltaPct} invert={s.id !== 'blocked' && s.id !== 'firewall'} />
            </div>
          ))}
        </div>
      </div>

      <Panel title="Security events" subtitle={`${visible.length} findings · newest first`} pad={false}>
        <div className="table-wrap">
          <table className="grid">
            <thead>
              <tr>
                <th scope="col">Severity</th>
                <th scope="col">Event</th>
                <th scope="col">Source → Target</th>
                <th scope="col">Detected</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((e) => (
                <tr key={e.id}>
                  <td><StatusBadge tone={SEV_TONE[e.severity]}>{e.severity.toUpperCase()}</StatusBadge></td>
                  <td>
                    <strong>{e.type}</strong>
                    <br />
                    <small className="row-sub">{e.detail}</small>
                  </td>
                  <td className="mono row-mono">{e.source} → {e.destination}</td>
                  <td className="mono row-mono" title={isoToUtcClock(e.timestamp)}>{timeAgo(e.timestamp)}</td>
                  <td><StatusBadge tone={STATUS_TONE[e.status]}>{e.status.toUpperCase()}</StatusBadge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
