import { useMemo, useState } from 'react';
import { Clock3, Search, UserRound } from 'lucide-react';
import { INCIDENTS } from '../../data/incidents';
import { filterIncidents, sortIncidents, type SeverityFilter, type StatusFilter } from '../../lib/filters';
import { isoToUtcClock, timeAgo } from '../../lib/format';
import { EmptyState, Panel, SectionHeader, StatusBadge } from '../../components/ui/primitives';
import type { IncidentStatus, Severity } from '../../types';

const SEV_TONE: Record<Severity, 'crit' | 'warn' | 'info' | 'muted'> = {
  'SEV-1': 'crit',
  'SEV-2': 'warn',
  'SEV-3': 'info',
  INFO: 'muted',
};

const STATUS_TONE: Record<IncidentStatus, 'warn' | 'info' | 'violet' | 'ok' | 'muted'> = {
  Investigating: 'warn',
  Identified: 'info',
  Mitigating: 'violet',
  Monitoring: 'info',
  Resolved: 'ok',
};

const SEV_OPTIONS: SeverityFilter[] = ['ALL', 'SEV-1', 'SEV-2', 'SEV-3', 'INFO'];
const STATUS_OPTIONS: StatusFilter[] = ['ALL', 'OPEN', 'Investigating', 'Identified', 'Mitigating', 'Monitoring', 'Resolved'];

export default function Incidents() {
  const [query, setQuery] = useState('');
  const [severity, setSeverity] = useState<SeverityFilter>('ALL');
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [selectedId, setSelectedId] = useState<string>('INC-2841');

  const list = useMemo(
    () => sortIncidents(filterIncidents(INCIDENTS, query, severity, status)),
    [query, severity, status],
  );
  const selected = list.find((i) => i.id === selectedId) ?? list[0] ?? null;
  const openCount = INCIDENTS.filter((i) => i.status !== 'Resolved').length;

  return (
    <div className="incidents">
      <SectionHeader
        eyebrow="AETHER // INCIDENT COMMAND"
        title="Incidents"
        description={`${openCount} open · coordinated triage, mitigation and review across every plane.`}
        right={
          <div className="filter-bar">
            <div className="filter-search">
              <Search size={14} aria-hidden="true" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search id, service, owner…"
                aria-label="Search incidents"
              />
            </div>
            <select className="select" value={severity} onChange={(e) => setSeverity(e.target.value as SeverityFilter)} aria-label="Filter by severity">
              {SEV_OPTIONS.map((o) => (
                <option key={o} value={o}>{o === 'ALL' ? 'All severities' : o}</option>
              ))}
            </select>
            <select className="select" value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)} aria-label="Filter by status">
              {STATUS_OPTIONS.map((o) => (
                <option key={o} value={o}>{o === 'ALL' ? 'All states' : o === 'OPEN' ? 'Open only' : o}</option>
              ))}
            </select>
          </div>
        }
      />

      <div className="incident-grid">
        <Panel pad={false} title="Incident queue" className="incident-list-panel">
          {list.length === 0 ? (
            <EmptyState title="No incidents match" hint="Loosen the filters to see the full queue." />
          ) : (
            <ul className="incident-list">
              {list.map((i) => (
                <li key={i.id}>
                  <button
                    type="button"
                    className={`incident-row${selected?.id === i.id ? ' is-selected' : ''}`}
                    onClick={() => setSelectedId(i.id)}
                    aria-current={selected?.id === i.id}
                  >
                    <StatusBadge tone={SEV_TONE[i.severity]}>{i.severity}</StatusBadge>
                    <span className="incident-main">
                      <strong>{i.title}</strong>
                      <small className="mono">{i.id} · {i.service} · {i.region}</small>
                    </span>
                    <span className="incident-meta">
                      <StatusBadge tone={STATUS_TONE[i.status]}>{i.status}</StatusBadge>
                      <small className="mono">{timeAgo(i.detectedAt)}</small>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {selected && (
          <Panel
            title={`${selected.id} — ${selected.title}`}
            subtitle={`${selected.service} · ${selected.region} · detected ${isoToUtcClock(selected.detectedAt)} UTC`}
            action={
              <span className="detail-badges">
                <StatusBadge tone={SEV_TONE[selected.severity]}>{selected.severity}</StatusBadge>
                <StatusBadge tone={STATUS_TONE[selected.status]}>{selected.status}</StatusBadge>
              </span>
            }
          >
            <p className="incident-desc">{selected.description}</p>
            <div className="incident-facts">
              <span><UserRound size={13} aria-hidden="true" /> {selected.owner}</span>
              <span><Clock3 size={13} aria-hidden="true" /> {timeAgo(selected.detectedAt)}</span>
            </div>
            <h4 className="mini-head">Response timeline</h4>
            <ol className="timeline">
              {selected.timeline.map((t) => (
                <li key={`${t.at}-${t.label}`}>
                  <span className="mono timeline-at">{t.at}</span>
                  <div>
                    <strong>{t.label}</strong>
                    {t.detail && <p>{t.detail}</p>}
                  </div>
                </li>
              ))}
            </ol>
            <h4 className="mini-head">Recommended action</h4>
            <p className="action-box">{selected.recommendedAction}</p>
          </Panel>
        )}
      </div>
    </div>
  );
}
