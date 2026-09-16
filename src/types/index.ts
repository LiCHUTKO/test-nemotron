/** Shared domain types for the AETHER operations nexus. */

export type HealthState = 'healthy' | 'warning' | 'critical' | 'maintenance';

export type Environment = 'production' | 'staging' | 'development';

export type SectionId =
  | 'overview'
  | 'telemetry'
  | 'infrastructure'
  | 'map'
  | 'incidents'
  | 'deployments'
  | 'agents'
  | 'security'
  | 'opslog'
  | 'terminal';

export type Severity = 'SEV-1' | 'SEV-2' | 'SEV-3' | 'INFO';

export type IncidentStatus =
  | 'Investigating'
  | 'Identified'
  | 'Mitigating'
  | 'Monitoring'
  | 'Resolved';

export interface TimelineEntry {
  at: string;
  label: string;
  detail?: string;
}

export interface OpsIncident {
  id: string;
  severity: Severity;
  title: string;
  service: string;
  region: string;
  detectedAt: string;
  status: IncidentStatus;
  owner: string;
  description: string;
  timeline: TimelineEntry[];
  recommendedAction: string;
}

export type DeployPhase =
  | 'queued'
  | 'building'
  | 'testing'
  | 'deploying'
  | 'verifying'
  | 'completed';

export type DeployStatus = 'success' | 'running' | 'failed' | 'queued';

export interface Deployment {
  id: string;
  service: string;
  version: string;
  environment: Environment;
  branch: string;
  commit: string;
  author: string;
  startedAt: string;
  durationSec: number;
  phase: DeployPhase;
  progress: number;
  status: DeployStatus;
}

export type AgentState = 'active' | 'idle' | 'investigating' | 'handoff';

export interface AiAgent {
  id: string;
  name: string;
  role: string;
  state: AgentState;
  task: string;
  confidence: number;
  tasksCompleted: number;
  avgExecSec: number;
  lastAction: string;
  cpu: number;
  memory: number;
  activity: TimelineEntry[];
}

export type ThreatSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface SecurityEvent {
  id: string;
  type: string;
  severity: ThreatSeverity;
  source: string;
  destination: string;
  timestamp: string;
  status: 'blocked' | 'monitoring' | 'resolved';
  detail: string;
}

export interface RegionInfo {
  id: string;
  city: string;
  code: string;
  country: string;
  /** 0..1 normalized map position */
  x: number;
  y: number;
  health: HealthState;
  latencyMs: number;
  workloads: number;
  throughputGbps: number;
}

export interface TopologyNode {
  id: string;
  label: string;
  layer: number;
  kind: string;
  health: HealthState;
  region: string;
  version: string;
  uptimePct: number;
  cpu: number;
  memory: number;
  latencyMs: number;
  rps: number;
  dependsOn: string[];
  notes: string;
}

export interface OpsLogEntry {
  id: string;
  at: string;
  level: 'info' | 'ok' | 'warn' | 'critical' | 'agent' | 'security' | 'deploy';
  message: string;
}

export interface TelemetryPoint {
  t: number;
  value: number;
}

export interface KpiDatum {
  id: string;
  label: string;
  value: number;
  unit: string;
  decimals: number;
  deltaPct: number;
  series: number[];
}
