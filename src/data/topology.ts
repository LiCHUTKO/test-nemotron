import type { TopologyNode } from '../types';

/** Canonical service graph for the infrastructure topology view. */
export const TOPOLOGY_NODES: TopologyNode[] = [
  {
    id: 'internet', label: 'Global Internet', layer: 0, kind: 'ingress', health: 'healthy',
    region: 'global', version: '—', uptimePct: 99.999, cpu: 8, memory: 12, latencyMs: 4, rps: 184000,
    dependsOn: [], notes: 'Tier-1 transit + peering across 34 PoPs.',
  },
  {
    id: 'edge-fra', label: 'Edge Gateway · FRA', layer: 1, kind: 'edge', health: 'healthy',
    region: 'eu-central-1', version: 'v6.4.1', uptimePct: 99.995, cpu: 41, memory: 55, latencyMs: 11, rps: 48200,
    dependsOn: ['internet'], notes: 'Anycast edge, WAF + DDoS scrubbing inline.',
  },
  {
    id: 'edge-sgp', label: 'Edge Gateway · SGP', layer: 1, kind: 'edge', health: 'warning',
    region: 'ap-southeast-1', version: 'v6.4.1', uptimePct: 99.981, cpu: 78, memory: 71, latencyMs: 34, rps: 31500,
    dependsOn: ['internet'], notes: 'Elevated p95 after subsea cable maintenance.',
  },
  {
    id: 'api-primary', label: 'API Gateway · Primary', layer: 2, kind: 'gateway', health: 'healthy',
    region: 'eu-central-1', version: 'v4.18.2', uptimePct: 99.992, cpu: 52, memory: 61, latencyMs: 18, rps: 72400,
    dependsOn: ['edge-fra', 'edge-sgp'], notes: 'Envoy fleet, 200rps autoscale step.',
  },
  {
    id: 'api-secondary', label: 'API Gateway · Secondary', layer: 2, kind: 'gateway', health: 'healthy',
    region: 'eu-west-1', version: 'v4.18.2', uptimePct: 99.99, cpu: 38, memory: 49, latencyMs: 22, rps: 38900,
    dependsOn: ['edge-fra'], notes: 'Warm standby, takes 30% of EU burst.',
  },
  {
    id: 'auth', label: 'Auth Cluster', layer: 3, kind: 'stateful', health: 'healthy',
    region: 'eu-central-1', version: 'v3.9.0', uptimePct: 99.998, cpu: 33, memory: 58, latencyMs: 9, rps: 21400,
    dependsOn: ['api-primary', 'api-secondary'], notes: 'HSM-backed sessions, 5-node quorum.',
  },
  {
    id: 'svc-identity', label: 'Identity Service', layer: 4, kind: 'service', health: 'healthy',
    region: 'eu-central-1', version: 'v2.44.0', uptimePct: 99.993, cpu: 44, memory: 52, latencyMs: 14, rps: 19800,
    dependsOn: ['auth'], notes: 'OAuth/OIDC + device trust evaluation.',
  },
  {
    id: 'svc-core', label: 'Core API Services', layer: 4, kind: 'service', health: 'healthy',
    region: 'eu-central-1', version: 'v5.31.7', uptimePct: 99.989, cpu: 57, memory: 66, latencyMs: 21, rps: 45600,
    dependsOn: ['auth'], notes: '12 domain services behind one facade.',
  },
  {
    id: 'svc-telemetry', label: 'Telemetry Engine', layer: 4, kind: 'service', health: 'warning',
    region: 'eu-central-1', version: 'v3.12.4', uptimePct: 99.971, cpu: 83, memory: 77, latencyMs: 46, rps: 62300,
    dependsOn: ['api-primary'], notes: 'Ingest lag 4.2s — partition rebalance in progress.',
  },
  {
    id: 'monitoring', label: 'Monitoring Layer', layer: 4, kind: 'platform', health: 'healthy',
    region: 'global', version: 'v2.20.1', uptimePct: 99.999, cpu: 29, memory: 44, latencyMs: 6, rps: 9800,
    dependsOn: ['svc-core', 'svc-telemetry'], notes: 'SLO burn alerts wired to incident command.',
  },
  {
    id: 'msg-queue', label: 'Message Queue', layer: 5, kind: 'platform', health: 'healthy',
    region: 'eu-central-1', version: 'v7.1.3', uptimePct: 99.996, cpu: 48, memory: 63, latencyMs: 3, rps: 88100,
    dependsOn: ['svc-core'], notes: '3.1M msgs/min, consumer lag nominal.',
  },
  {
    id: 'workers-stream', label: 'Stream Workers', layer: 5, kind: 'workers', health: 'healthy',
    region: 'eu-central-1', version: 'v5.31.7', uptimePct: 99.987, cpu: 61, memory: 69, latencyMs: 25, rps: 33400,
    dependsOn: ['msg-queue'], notes: '480 pods, HPA 55–720.',
  },
  {
    id: 'workers-batch', label: 'Batch Workers', layer: 5, kind: 'workers', health: 'healthy',
    region: 'us-east-1', version: 'v5.30.2', uptimePct: 99.991, cpu: 54, memory: 71, latencyMs: 88, rps: 12600,
    dependsOn: ['msg-queue'], notes: 'Nightly model scoring + ETL.',
  },
  {
    id: 'ai-inference', label: 'AI Inference Cluster', layer: 5, kind: 'ai', health: 'warning',
    region: 'eu-west-1', version: 'v1.17.0', uptimePct: 99.962, cpu: 91, memory: 84, latencyMs: 132, rps: 5400,
    dependsOn: ['msg-queue', 'svc-core'], notes: 'GPU saturation 91% — 2 nodes cordoned for driver rollout.',
  },
  {
    id: 'analytics', label: 'Analytics Cluster', layer: 6, kind: 'analytics', health: 'critical',
    region: 'us-east-1', version: 'v2.8.9', uptimePct: 99.912, cpu: 96, memory: 93, latencyMs: 410, rps: 2100,
    dependsOn: ['workers-batch', 'svc-telemetry'], notes: 'Shard 7 hot — queries spilling, SEV-2 open.',
  },
  {
    id: 'db-primary', label: 'Database · Primary', layer: 6, kind: 'database', health: 'healthy',
    region: 'eu-central-1', version: 'pg16.3', uptimePct: 99.999, cpu: 47, memory: 72, latencyMs: 2, rps: 28900,
    dependsOn: ['svc-core', 'workers-stream'], notes: 'Synchronous replica in eu-west-1.',
  },
  {
    id: 'db-replica', label: 'Database · Replica', layer: 6, kind: 'database', health: 'maintenance',
    region: 'eu-west-1', version: 'pg16.3', uptimePct: 99.99, cpu: 22, memory: 58, latencyMs: 14, rps: 11200,
    dependsOn: ['db-primary'], notes: 'Minor version upgrade window until 11:30 UTC.',
  },
  {
    id: 'object-storage', label: 'Object Storage', layer: 7, kind: 'storage', health: 'healthy',
    region: 'multi-eu', version: 'v9.2.0', uptimePct: 99.9999, cpu: 19, memory: 34, latencyMs: 28, rps: 15700,
    dependsOn: ['db-primary', 'analytics', 'ai-inference'], notes: '11 nines durability, erasure-coded.',
  },
];

export const LAYER_LABELS = [
  'Ingress',
  'Edge',
  'Gateway',
  'Identity',
  'Services',
  'Compute',
  'Data',
  'Storage',
];
