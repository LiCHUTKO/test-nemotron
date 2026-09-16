import type { AiAgent } from '../types';

/** Autonomous fleet roster for the agent operations view. */
export const AGENTS: AiAgent[] = [
  {
    id: 'sentinel', name: 'Sentinel', role: 'Infrastructure Analyst', state: 'investigating',
    task: 'Investigating latency anomaly in eu-central-1', confidence: 91,
    tasksCompleted: 1284, avgExecSec: 14.2, lastAction: 'Correlated telemetry lag to kafka-04 disk pressure',
    cpu: 62, memory: 58,
    activity: [
      { at: '09:41:15', label: 'Started anomaly investigation', detail: 'p95 drift 2.4σ on telemetry-engine' },
      { at: '09:38:02', label: 'Sweep finished', detail: '14 services scanned, 1 flagged' },
      { at: '09:31:47', label: 'Report filed', detail: 'Weekly capacity outlook published' },
      { at: '09:22:10', label: 'Autoscale advised', detail: 'Recommended +40 stream workers' },
    ],
  },
  {
    id: 'orion', name: 'Orion', role: 'Network Optimizer', state: 'active',
    task: 'Rebalancing anycast weights toward Tokyo PoP', confidence: 96,
    tasksCompleted: 2311, avgExecSec: 8.7, lastAction: 'Shifted 15% of APAC egress FRA → NRT',
    cpu: 44, memory: 39,
    activity: [
      { at: '09:41:21', label: 'Route optimized', detail: 'FRA–WAW p95 down 11ms' },
      { at: '09:35:56', label: 'Path probed', detail: 'SGP backup path loss 0.02%' },
      { at: '09:20:14', label: 'Weights adjusted', detail: 'Anycast shift 15% toward Tokyo' },
    ],
  },
  {
    id: 'atlas', name: 'Atlas', role: 'Deployment Validator', state: 'active',
    task: 'Validating production deployment telemetry-engine v3.12.5', confidence: 88,
    tasksCompleted: 942, avgExecSec: 22.5, lastAction: 'Canary analysis passed at 82% rollout',
    cpu: 51, memory: 47,
    activity: [
      { at: '09:40:33', label: 'Canary check passed', detail: 'Error delta +0.01% within budget' },
      { at: '09:33:19', label: 'Verification started', detail: 'telemetry-engine v3.12.5' },
      { at: '09:12:44', label: 'Release signed', detail: 'gateway-api v4.18.2 promoted' },
    ],
  },
  {
    id: 'helios', name: 'Helios', role: 'Log Intelligence Agent', state: 'active',
    task: 'Comparing gateway error distributions across regions', confidence: 93,
    tasksCompleted: 3120, avgExecSec: 5.4, lastAction: 'Clustered 41k log lines into 6 signatures',
    cpu: 38, memory: 52,
    activity: [
      { at: '09:39:58', label: 'Signatures updated', detail: '6 error clusters, 1 novel' },
      { at: '09:30:11', label: ' Drain completed', detail: '2.1M lines compacted to 6 patterns' },
      { at: '09:15:27', label: 'Novelty flagged', detail: 'New 502 signature on edge-sgp' },
    ],
  },
  {
    id: 'nova', name: 'Nova', role: 'Incident Triage Agent', state: 'investigating',
    task: 'Triaging telemetry ingest lag for INC-2839', confidence: 84,
    tasksCompleted: 764, avgExecSec: 31.8, lastAction: 'Drafted rebalance plan for kafka-04',
    cpu: 57, memory: 61,
    activity: [
      { at: '09:40:02', label: 'Escalation drafted', detail: 'Storage on-call paged with context' },
      { at: '09:28:36', label: 'Timeline assembled', detail: 'INC-2839 evidence bundle ready' },
      { at: '09:12:19', label: 'Hypothesis ranked', detail: 'Disk pressure 87% likely root cause' },
    ],
  },
  {
    id: 'argus', name: 'Argus', role: 'Security Investigator', state: 'active',
    task: 'Analyzing suspicious authentication pattern from 3 ASNs', confidence: 89,
    tasksCompleted: 1108, avgExecSec: 17.3, lastAction: 'Throttled credential-stuffing wave at edge',
    cpu: 49, memory: 44,
    activity: [
      { at: '09:37:44', label: 'Wave throttled', detail: '4,120 attempts / 5 min contained' },
      { at: '09:26:09', label: 'ASN profiled', detail: '3 source networks fingerprinted' },
      { at: '09:09:52', label: 'Session challenged', detail: 'Impossible-travel step-up issued' },
    ],
  },
  {
    id: 'vector', name: 'Vector', role: 'Capacity Planner', state: 'idle',
    task: 'Idle — next forecast cycle in 12 minutes', confidence: 97,
    tasksCompleted: 542, avgExecSec: 44.1, lastAction: 'Published 7-day GPU demand forecast',
    cpu: 12, memory: 21,
    activity: [
      { at: '08:55:00', label: 'Forecast published', detail: '7-day GPU demand +18% expected' },
      { at: '08:40:12', label: 'Model retrained', detail: 'MAPE improved to 3.1%' },
    ],
  },
  {
    id: 'specter', name: 'Specter', role: 'Resilience / Chaos Agent', state: 'handoff',
    task: 'Handing off election-path chaos test to staging crew', confidence: 82,
    tasksCompleted: 389, avgExecSec: 52.6, lastAction: 'Verified auth quorum failover in 94s window',
    cpu: 33, memory: 29,
    activity: [
      { at: '09:05:19', label: 'Experiment sealed', detail: 'Election-path blast radius confirmed safe' },
      { at: '08:47:33', label: 'Handoff opened', detail: 'Staging crew acknowledged' },
    ],
  },
];
