import type { OpsIncident } from '../types';

/** Canonical incident dataset for the command center. */
export const INCIDENTS: OpsIncident[] = [
  {
    id: 'INC-2841',
    severity: 'SEV-2',
    title: 'Analytics shard hotspot causing query spill',
    service: 'analytics-core',
    region: 'us-east-1',
    detectedAt: new Date(Date.now() - 47 * 60_000).toISOString(),
    status: 'Mitigating',
    owner: 'M. Kowalczyk',
    description:
      'Shard 7 of the analytics cluster is receiving 4.6× its nominal key range after a tenant backfill job mis-hashed partition keys. Queries are spilling to disk, p99 latency is 410ms against a 120ms SLO, and two downstream dashboards are serving stale tiles.',
    timeline: [
      { at: '08:54:11', label: 'Detected', detail: 'SLO burn alert fired — p99 latency 3.4× baseline' },
      { at: '08:59:40', label: 'Triaged', detail: 'Sentinel correlated hotspot to backfill job bf-9917' },
      { at: '09:07:22', label: 'Action taken', detail: 'Backfill throttled to 15%; shard drain started' },
      { at: '09:33:05', label: 'Mitigating', detail: 'Rebalance at 62% — spill rate falling' },
    ],
    recommendedAction: 'Let the rebalance finish, then re-hash bf-9917 keys before resuming full backfill rate.',
  },
  {
    id: 'INC-2839',
    severity: 'SEV-2',
    title: 'Telemetry ingest lag above 4s in eu-central-1',
    service: 'telemetry-engine',
    region: 'eu-central-1',
    detectedAt: new Date(Date.now() - 96 * 60_000).toISOString(),
    status: 'Investigating',
    owner: 'J. Nowak',
    description:
      'Partition leadership churned three times in twenty minutes after broker kafka-04 reported disk pressure. Consumer lag peaked at 4.2s and is oscillating. No data loss — write-ahead buffers are absorbing the backlog.',
    timeline: [
      { at: '08:05:48', label: 'Detected', detail: 'Consumer lag crossed 2s threshold' },
      { at: '08:12:19', label: 'Investigating', detail: 'Orion flagged kafka-04 disk at 87% and leadership churn' },
      { at: '08:40:02', label: 'Escalated', detail: 'Paged storage on-call; rebalance plan drafted' },
    ],
    recommendedAction: 'Drain kafka-04, force preferred-replica election, then re-admit the broker.',
  },
  {
    id: 'INC-2836',
    severity: 'SEV-3',
    title: 'AI inference GPU saturation at 91%',
    service: 'agent-orchestrator',
    region: 'eu-west-1',
    detectedAt: new Date(Date.now() - 3.2 * 3_600_000).toISOString(),
    status: 'Identified',
    owner: 'A. Wiśniewska',
    description:
      'Inference queue depth tripled after two nodes were cordoned for a driver rollout while a batch-scoring surge landed. Interactive agent calls are slower (p95 132ms) but within the degraded-mode budget.',
    timeline: [
      { at: '06:12:30', label: 'Detected', detail: 'GPU saturation crossed 85% for 10 minutes' },
      { at: '06:28:14', label: 'Identified', detail: 'Root cause: cordon + scoring surge collision' },
      { at: '07:02:55', label: 'Queued fix', detail: 'Two spare A100 nodes warming; rollout paused' },
    ],
    recommendedAction: 'Uncordon spare capacity first, then resume the driver rollout one node at a time.',
  },
  {
    id: 'INC-2831',
    severity: 'SEV-3',
    title: 'Elevated edge latency via Singapore PoP',
    service: 'edge gateways',
    region: 'ap-southeast-1',
    detectedAt: new Date(Date.now() - 7.5 * 3_600_000).toISOString(),
    status: 'Monitoring',
    owner: 'K. Tanaka',
    description:
      'Subsea cable maintenance shifted 30% of APAC traffic through Singapore, lifting p95 by 22ms. Anycast weights were adjusted and latency is trending down; watching for packet loss on the backup path.',
    timeline: [
      { at: '02:04:41', label: 'Detected', detail: 'p95 latency +22ms on SGP egress' },
      { at: '02:19:03', label: 'Action taken', detail: 'Anycast weights shifted 15% toward Tokyo' },
      { at: '04:45:37', label: 'Monitoring', detail: 'p95 recovering; loss rate 0.02%' },
    ],
    recommendedAction: 'Hold weights until maintenance window closes at 18:00 UTC, then rebalance.',
  },
  {
    id: 'INC-2827',
    severity: 'SEV-1',
    title: 'Auth quorum flap during leader election',
    service: 'auth-cluster',
    region: 'eu-central-1',
    detectedAt: new Date(Date.now() - 26 * 3_600_000).toISOString(),
    status: 'Resolved',
    owner: 'P. Zieliński',
    description:
      'A misconfigured election timeout caused the auth quorum to flap twice, failing over sessions for 94 seconds. Token refresh retried cleanly; 0.3% of requests returned 503. Post-mortem action items are tracked and the timeout fix is deployed.',
    timeline: [
      { at: 'yesterday 07:41', label: 'Detected', detail: 'Quorum lost — automatic failover engaged' },
      { at: 'yesterday 07:43', label: 'Mitigating', detail: 'Traffic pinned to eu-west-1 quorum' },
      { at: 'yesterday 08:20', label: 'Resolved', detail: 'Election timeout patched; quorum stable 24h' },
    ],
    recommendedAction: 'Closed. Remaining action: chaos-test election paths in staging (tracked).',
  },
  {
    id: 'INC-2822',
    severity: 'INFO',
    title: 'Planned replica upgrade window',
    service: 'database cluster',
    region: 'eu-west-1',
    detectedAt: new Date(Date.now() - 31 * 3_600_000).toISOString(),
    status: 'Resolved',
    owner: 'System',
    description:
      'Scheduled minor-version upgrade of the postgres replica fleet. Completed inside the window with 41s of read-replica lag at peak. No customer impact.',
    timeline: [
      { at: 'yesterday 02:00', label: 'Started', detail: 'Replica drained from read pool' },
      { at: 'yesterday 02:38', label: 'Resolved', detail: 'Replica re-admitted; lag caught up' },
    ],
    recommendedAction: 'No action required.',
  },
];
