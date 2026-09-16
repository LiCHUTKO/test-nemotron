import type { IncidentStatus, OpsIncident, Severity } from '../types';

export type SeverityFilter = 'ALL' | Severity;
export type StatusFilter = 'ALL' | IncidentStatus | 'OPEN';

/** Pure incident filtering — search across id/title/service/owner, then facets. */
export function filterIncidents(
  incidents: OpsIncident[],
  query: string,
  severity: SeverityFilter,
  status: StatusFilter,
): OpsIncident[] {
  const q = query.trim().toLowerCase();
  return incidents.filter((i) => {
    if (severity !== 'ALL' && i.severity !== severity) return false;
    if (status === 'OPEN' && i.status === 'Resolved') return false;
    if (status !== 'ALL' && status !== 'OPEN' && i.status !== status) return false;
    if (!q) return true;
    return [i.id, i.title, i.service, i.owner, i.region]
      .join(' ')
      .toLowerCase()
      .includes(q);
  });
}

const SEVERITY_RANK: Record<Severity, number> = {
  'SEV-1': 0,
  'SEV-2': 1,
  'SEV-3': 2,
  INFO: 3,
};

/** Open incidents first, then by severity, then newest. */
export function sortIncidents(incidents: OpsIncident[]): OpsIncident[] {
  return [...incidents].sort((a, b) => {
    const aOpen = a.status === 'Resolved' ? 1 : 0;
    const bOpen = b.status === 'Resolved' ? 1 : 0;
    if (aOpen !== bOpen) return aOpen - bOpen;
    const sev = SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity];
    if (sev !== 0) return sev;
    return new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime();
  });
}
