import { describe, expect, it } from 'vitest';
import { filterIncidents, sortIncidents } from './filters';
import { INCIDENTS } from '../data/incidents';

describe('incident filtering', () => {
  it('returns everything with neutral filters', () => {
    expect(filterIncidents(INCIDENTS, '', 'ALL', 'ALL')).toHaveLength(INCIDENTS.length);
  });

  it('filters by severity', () => {
    const sev2 = filterIncidents(INCIDENTS, '', 'SEV-2', 'ALL');
    expect(sev2.length).toBeGreaterThan(0);
    expect(sev2.every((i) => i.severity === 'SEV-2')).toBe(true);
  });

  it('filters to open incidents only', () => {
    const open = filterIncidents(INCIDENTS, '', 'ALL', 'OPEN');
    expect(open.length).toBeGreaterThan(0);
    expect(open.every((i) => i.status !== 'Resolved')).toBe(true);
  });

  it('filters by exact status', () => {
    const mitigating = filterIncidents(INCIDENTS, '', 'ALL', 'Mitigating');
    expect(mitigating.every((i) => i.status === 'Mitigating')).toBe(true);
  });

  it('searches across id, title, service and owner', () => {
    expect(filterIncidents(INCIDENTS, 'inc-2841', 'ALL', 'ALL')).toHaveLength(1);
    expect(filterIncidents(INCIDENTS, 'analytics', 'ALL', 'ALL').length).toBeGreaterThan(0);
    expect(filterIncidents(INCIDENTS, 'kowalczyk', 'ALL', 'ALL').length).toBeGreaterThan(0);
    expect(filterIncidents(INCIDENTS, 'no-such-thing-xyz', 'ALL', 'ALL')).toHaveLength(0);
  });

  it('combines search with facet filters', () => {
    const res = filterIncidents(INCIDENTS, 'telemetry', 'SEV-2', 'ALL');
    expect(res.every((i) => i.severity === 'SEV-2')).toBe(true);
  });
});

describe('incident sorting', () => {
  it('puts open incidents before resolved ones', () => {
    const sorted = sortIncidents(INCIDENTS);
    const firstResolved = sorted.findIndex((i) => i.status === 'Resolved');
    const lastOpen = sorted.map((i) => i.status).lastIndexOf('Mitigating');
    expect(firstResolved).toBeGreaterThan(lastOpen);
  });

  it('orders open incidents by severity rank', () => {
    const sorted = sortIncidents(INCIDENTS).filter((i) => i.status !== 'Resolved');
    const ranks = sorted.map((i) => ({ 'SEV-1': 0, 'SEV-2': 1, 'SEV-3': 2, INFO: 3 })[i.severity]);
    expect([...ranks].sort((a, b) => a - b)).toEqual(ranks);
  });

  it('does not mutate the input array', () => {
    const copy = [...INCIDENTS];
    sortIncidents(INCIDENTS);
    expect(INCIDENTS).toEqual(copy);
  });
});
