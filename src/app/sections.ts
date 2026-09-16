import type { SectionId } from '../types';

export interface SectionMeta {
  id: SectionId;
  label: string;
  group: 'Command' | 'Observe' | 'Respond' | 'Operate';
  hint: string;
}

export const SECTIONS: SectionMeta[] = [
  { id: 'overview', label: 'Overview', group: 'Command', hint: 'Executive status' },
  { id: 'telemetry', label: 'Telemetry', group: 'Observe', hint: 'Metrics & signals' },
  { id: 'infrastructure', label: 'Infrastructure', group: 'Observe', hint: 'Service topology' },
  { id: 'map', label: 'Global Map', group: 'Observe', hint: 'Regions & links' },
  { id: 'incidents', label: 'Incidents', group: 'Respond', hint: 'Command center' },
  { id: 'deployments', label: 'Deployments', group: 'Respond', hint: 'Release control' },
  { id: 'agents', label: 'AI Agents', group: 'Respond', hint: 'Autonomous ops' },
  { id: 'security', label: 'Security', group: 'Respond', hint: 'SOC overview' },
  { id: 'opslog', label: 'Operations Log', group: 'Operate', hint: 'Live event stream' },
  { id: 'terminal', label: 'Terminal', group: 'Operate', hint: 'Operator console' },
];

export function sectionLabel(id: SectionId): string {
  return SECTIONS.find((s) => s.id === id)?.label ?? id;
}
