import type { SecurityEvent } from '../types';

const now = Date.now();
const iso = (agoMs: number) => new Date(now - agoMs).toISOString();

export const THREAT_LEVEL: { level: string; score: number; note: string } = {
  level: 'ELEVATED',
  score: 62,
  note: 'Credential-stuffing wave from 3 ASNs; edge mitigations holding.',
};

export const SECURITY_STATS = [
  { id: 'blocked', label: 'Blocked Requests', value: 12408, deltaPct: 3.1 },
  { id: 'sessions', label: 'Suspicious Sessions', value: 37, deltaPct: -12.4 },
  { id: 'anomalies', label: 'Auth Anomalies', value: 128, deltaPct: 8.8 },
  { id: 'firewall', label: 'Firewall Actions', value: 4912, deltaPct: 1.9 },
  { id: 'ids', label: 'IDS Alerts', value: 23, deltaPct: -4.2 },
];

export const SECURITY_EVENTS: SecurityEvent[] = [
  { id: 'sec-5012', type: 'Credential Stuffing', severity: 'high', source: '185.220.××.××', destination: 'auth-cluster', timestamp: iso(3 * 60_000), status: 'blocked', detail: '4,120 attempts / 5 min against /oauth/token — ASN throttled' },
  { id: 'sec-5011', type: 'Impossible Travel', severity: 'high', source: 'user session 8f3a', destination: 'identity-service', timestamp: iso(11 * 60_000), status: 'monitoring', detail: 'Login WAW → SGP within 9 minutes; step-up auth issued' },
  { id: 'sec-5010', type: 'Port Scan', severity: 'medium', source: '45.148.××.××', destination: 'edge-fra', timestamp: iso(19 * 60_000), status: 'blocked', detail: 'Horizontal scan of 2,400 ports; source null-routed for 1h' },
  { id: 'sec-5009', type: 'Brute Force Attempt', severity: 'medium', source: '91.108.××.××', destination: 'api-gw-primary', timestamp: iso(26 * 60_000), status: 'blocked', detail: 'SSH dictionary burst; fail2ban engaged after 40 tries' },
  { id: 'sec-5008', type: 'Suspicious Token Usage', severity: 'high', source: 'svc-account deployer', destination: 'object-storage', timestamp: iso(38 * 60_000), status: 'monitoring', detail: 'Token used outside deploy window; scope review opened' },
  { id: 'sec-5007', type: 'Privilege Escalation Attempt', severity: 'critical', source: 'pod worker-7d9c', destination: 'kube-api', timestamp: iso(52 * 60_000), status: 'blocked', detail: 'cluster-admin binding rejected by admission policy' },
  { id: 'sec-5006', type: 'Credential Stuffing', severity: 'medium', source: '103.99.××.××', destination: 'auth-cluster', timestamp: iso(64 * 60_000), status: 'blocked', detail: '1,870 attempts; captcha challenge rate 100%' },
  { id: 'sec-5005', type: 'Port Scan', severity: 'low', source: '198.51.××.××', destination: 'edge-sgp', timestamp: iso(81 * 60_000), status: 'resolved', detail: 'Research scanner (grayscale) — allowlisted after review' },
  { id: 'sec-5004', type: 'Brute Force Attempt', severity: 'low', source: '172.68.××.××', destination: 'api-gw-secondary', timestamp: iso(97 * 60_000), status: 'blocked', detail: 'Low-and-slow login probing; IP reputation flagged' },
  { id: 'sec-5003', type: 'Suspicious Token Usage', severity: 'medium', source: 'ci-runner 12', destination: 'container-registry', timestamp: iso(118 * 60_000), status: 'resolved', detail: 'Token rotated; pipeline pinned to short-lived OIDC' },
  { id: 'sec-5002', type: 'Impossible Travel', severity: 'medium', source: 'user session 41bc', destination: 'identity-service', timestamp: iso(141 * 60_000), status: 'resolved', detail: 'VPN egress change confirmed by user; session kept' },
  { id: 'sec-5001', type: 'Privilege Escalation Attempt', severity: 'high', source: 'pod batch-3a11', destination: 'kube-api', timestamp: iso(165 * 60_000), status: 'blocked', detail: 'hostPath mount denied; workload rescheduled' },
];

export const LIVE_TEMPLATES: Array<Pick<SecurityEvent, 'type' | 'severity' | 'detail'>> = [
  { type: 'Credential Stuffing', severity: 'medium', detail: 'Fresh wave against /oauth/token — edge throttle holding' },
  { type: 'Port Scan', severity: 'low', detail: 'Vertical scan of gateway range; tarpitting engaged' },
  { type: 'Brute Force Attempt', severity: 'medium', detail: 'Password spray across 40 accounts; lockouts minimal' },
  { type: 'Suspicious Token Usage', severity: 'high', detail: 'Stale service token seen from new ASN; review opened' },
];
