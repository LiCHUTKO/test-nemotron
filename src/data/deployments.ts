import type { Deployment } from '../types';

const now = Date.now();
const min = 60_000;
const iso = (agoMs: number) => new Date(now - agoMs).toISOString();

/** Deployment pipeline snapshot across fleet services. */
export const DEPLOYMENTS: Deployment[] = [
  {
    id: 'dep-9017', service: 'telemetry-engine', version: 'v3.12.5', environment: 'production',
    branch: 'release/3.12', commit: 'a4f2c9e', author: 'j.nowak', startedAt: iso(14 * min),
    durationSec: 840, phase: 'verifying', progress: 82, status: 'running',
  },
  {
    id: 'dep-9016', service: 'agent-orchestrator', version: 'v1.17.1', environment: 'production',
    branch: 'main', commit: '7bd310a', author: 'a.wisniewska', startedAt: iso(31 * min),
    durationSec: 1500, phase: 'deploying', progress: 54, status: 'running',
  },
  {
    id: 'dep-9015', service: 'notification-service', version: 'v2.3.0', environment: 'staging',
    branch: 'feat/multi-channel', commit: 'c81d4f2', author: 'm.kowalczyk', startedAt: iso(44 * min),
    durationSec: 900, phase: 'testing', progress: 38, status: 'running',
  },
  {
    id: 'dep-9014', service: 'analytics-core', version: 'v2.8.10', environment: 'production',
    branch: 'hotfix/shard-rebalance', commit: 'e5a01bc', author: 'p.zielinski', startedAt: iso(9 * min),
    durationSec: 1200, phase: 'building', progress: 21, status: 'running',
  },
  {
    id: 'dep-9013', service: 'network-controller', version: 'v6.4.2', environment: 'production',
    branch: 'main', commit: '92ff7d1', author: 'k.tanaka', startedAt: iso(4 * min),
    durationSec: 600, phase: 'queued', progress: 4, status: 'queued',
  },
  {
    id: 'dep-9012', service: 'gateway-api', version: 'v4.18.2', environment: 'production',
    branch: 'release/4.18', commit: '4aa9e77', author: 'j.nowak', startedAt: iso(122 * min),
    durationSec: 1310, phase: 'completed', progress: 100, status: 'success',
  },
  {
    id: 'dep-9011', service: 'identity-service', version: 'v2.44.0', environment: 'production',
    branch: 'main', commit: '1c0be58', author: 'a.wisniewska', startedAt: iso(200 * min),
    durationSec: 1180, phase: 'completed', progress: 100, status: 'success',
  },
  {
    id: 'dep-9010', service: 'worker-fleet', version: 'v5.31.8', environment: 'staging',
    branch: 'feat/gpu-schedule', commit: 'de412b6', author: 'system', startedAt: iso(260 * min),
    durationSec: 940, phase: 'testing', progress: 100, status: 'failed',
  },
  {
    id: 'dep-9009', service: 'network-controller', version: 'v6.4.1', environment: 'production',
    branch: 'main', commit: '77c2a90', author: 'k.tanaka', startedAt: iso(340 * min),
    durationSec: 640, phase: 'completed', progress: 100, status: 'success',
  },
];
