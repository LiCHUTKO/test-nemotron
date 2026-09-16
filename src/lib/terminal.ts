import { AGENTS } from '../data/agents';
import { DEPLOYMENTS } from '../data/deployments';
import { INCIDENTS } from '../data/incidents';
import { SECURITY_EVENTS, THREAT_LEVEL } from '../data/security';
import { TOPOLOGY_NODES } from '../data/topology';

export type TermKind = 'cmd' | 'out' | 'ok' | 'warn' | 'err' | 'dim' | 'matrix';

export interface TermLine {
  text: string;
  kind: TermKind;
}

export type TermAction = 'clear' | 'matrix-fx' | null;

export interface TermResult {
  lines: TermLine[];
  action: TermAction;
}

const BOOT_ISO = new Date().toISOString();

function uptime(): string {
  const s = Math.floor((Date.now() - new Date(BOOT_ISO).getTime()) / 1000) + 14 * 24 * 3600 + 6 * 3600;
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
}

const HELP: TermLine[] = [
  { text: 'Available commands:', kind: 'dim' },
  { text: '  help           show this reference', kind: 'out' },
  { text: '  status         platform status summary', kind: 'out' },
  { text: '  health         service health table', kind: 'out' },
  { text: '  nodes          topology node inventory', kind: 'out' },
  { text: '  regions        region latency and load', kind: 'out' },
  { text: '  agents         autonomous fleet roster', kind: 'out' },
  { text: '  incidents      open incident queue', kind: 'out' },
  { text: '  deployments    release pipeline snapshot', kind: 'out' },
  { text: '  security       threat posture summary', kind: 'out' },
  { text: '  network        backbone throughput snapshot', kind: 'out' },
  { text: '  uptime         nexus uptime', kind: 'out' },
  { text: '  whoami / about system info', kind: 'out' },
  { text: '  clear          wipe the console', kind: 'out' },
];

/**
 * Pure command interpreter for the operator console.
 * Returns printable lines plus an optional side-effect action.
 */
export function runTerminalCommand(raw: string): TermResult {
  const input = raw.trim();
  const [cmd, ...rest] = input.split(/\s+/);
  const arg = (rest.join(' ') || '').toLowerCase();

  switch ((cmd || '').toLowerCase()) {
    case '':
      return { lines: [], action: null };
    case 'help':
      return { lines: HELP, action: null };
    case 'clear':
      return { lines: [], action: 'clear' };
    case 'whoami':
      return { lines: [{ text: 'operator — SRE L3, scopes: observe, mitigate, deploy:staging', kind: 'ok' }], action: null };
    case 'about':
      return {
        lines: [
          { text: 'AETHER // Global Operations Nexus v4.2.17', kind: 'out' },
          { text: 'Realtime intelligence for autonomous infrastructure.', kind: 'dim' },
          { text: 'Build 4.2.17 · channel stable · region eu-west', kind: 'dim' },
        ],
        action: null,
      };
    case 'uptime':
      return { lines: [{ text: `nexus up ${uptime()} · SLO 99.982% (90d)`, kind: 'ok' }], action: null };
    case 'status':
      return {
        lines: [
          { text: 'PLATFORM STATUS — all planes reporting', kind: 'ok' },
          { text: `  health ......... 99.982%   nodes .......... 248`, kind: 'out' },
          { text: `  regions ........ 12        agents ......... ${AGENTS.length}`, kind: 'out' },
          { text: `  open incidents . ${INCIDENTS.filter((i) => i.status !== 'Resolved').length}         threat level ... ${THREAT_LEVEL.level}`, kind: 'warn' },
          { text: `  throughput ..... 8.42 Tbps error rate ..... 0.42%`, kind: 'out' },
        ],
        action: null,
      };
    case 'health': {
      const rows = TOPOLOGY_NODES.slice(0, 12).map((n) => {
        const mark = n.health === 'healthy' ? '●' : n.health === 'warning' ? '▲' : n.health === 'critical' ? '■' : '◆';
        return {
          text: `  ${mark} ${n.label.padEnd(28)} ${n.health.padEnd(12)} cpu ${String(n.cpu).padStart(3)}%  ${n.latencyMs}ms`,
          kind: (n.health === 'healthy' ? 'out' : n.health === 'critical' ? 'err' : 'warn') as TermKind,
        };
      });
      return { lines: [{ text: `HEALTH — ${TOPOLOGY_NODES.length} services (showing 12)`, kind: 'dim' }, ...rows], action: null };
    }
    case 'nodes':
      return {
        lines: [
          { text: `NODES — 248 active across 12 regions (top talkers):`, kind: 'dim' },
          ...TOPOLOGY_NODES.slice(1, 9).map((n) => ({
            text: `  ${n.id.padEnd(18)} ${n.region.padEnd(16)} ${String(n.rps).padStart(7)} rps`,
            kind: 'out' as TermKind,
          })),
        ],
        action: null,
      };
    case 'regions':
      return {
        lines: [
          { text: 'REGION      LAT(p95)   LOAD    STATUS', kind: 'dim' },
          { text: 'fra-eu-c1     18ms     62%     ● nominal', kind: 'out' },
          { text: 'waw-eu-c1     24ms     41%     ● nominal', kind: 'out' },
          { text: 'iad-us-e1     86ms     55%     ● nominal', kind: 'out' },
          { text: 'sgp-ap-se1   134ms     78%     ▲ degraded', kind: 'warn' },
          { text: 'nrt-ap-ne1    142ms     37%     ● nominal', kind: 'out' },
          { text: 'gru-sa-e1    188ms     22%     ● nominal', kind: 'out' },
        ],
        action: null,
      };
    case 'agents':
      return {
        lines: [
          { text: `FLEET — ${AGENTS.length} agents autonomous:`, kind: 'dim' },
          ...AGENTS.map((a) => ({
            text: `  ${a.name.padEnd(10)} ${a.role.padEnd(26)} ${a.state.padEnd(13)} conf ${a.confidence}%`,
            kind: (a.state === 'investigating' ? 'warn' : 'out') as TermKind,
          })),
        ],
        action: null,
      };
    case 'incidents': {
      const open = INCIDENTS.filter((i) => i.status !== 'Resolved');
      return {
        lines: [
          { text: `INCIDENTS — ${open.length} open:`, kind: open.length > 0 ? 'warn' : 'ok' },
          ...open.map((i) => ({
            text: `  ${i.id} [${i.severity}] ${i.title} — ${i.status} (${i.owner})`,
            kind: (i.severity === 'SEV-1' || i.severity === 'SEV-2' ? 'err' : 'out') as TermKind,
          })),
        ],
        action: null,
      };
    }
    case 'deployments':
      return {
        lines: [
          { text: 'PIPELINE — latest promotions:', kind: 'dim' },
          ...DEPLOYMENTS.slice(0, 6).map((d) => ({
            text: `  ${d.service.padEnd(20)} ${d.version.padEnd(9)} ${d.phase.padEnd(10)} ${d.status}`,
            kind: (d.status === 'failed' ? 'err' : d.status === 'running' ? 'warn' : 'ok') as TermKind,
          })),
        ],
        action: null,
      };
    case 'security':
      return {
        lines: [
          { text: `THREAT LEVEL: ${THREAT_LEVEL.level} (${THREAT_LEVEL.score}/100)`, kind: 'warn' },
          { text: `  blocked 12,408 · anomalies 128 · IDS alerts 23`, kind: 'out' },
          { text: `  latest: ${SECURITY_EVENTS[0].type} — ${SECURITY_EVENTS[0].status}`, kind: 'out' },
        ],
        action: null,
      };
    case 'network':
      return {
        lines: [
          { text: 'BACKBONE — 8.42 Tbps aggregate', kind: 'ok' },
          { text: '  fra ⇄ waw   612 Gbps   p95 11ms', kind: 'out' },
          { text: '  fra ⇄ iad   388 Gbps   p95 86ms', kind: 'out' },
          { text: '  sgp ⇄ nrt   204 Gbps   p95 64ms', kind: 'out' },
        ],
        action: null,
      };
    case 'matrix':
      return {
        lines: [
          { text: 'Wake up, operator…', kind: 'matrix' },
          { text: 'The Nexus has you.', kind: 'matrix' },
          { text: 'Follow the white packet.', kind: 'matrix' },
        ],
        action: 'matrix-fx',
      };
    case 'sudo':
      if (arg.startsWith('status') || arg === '') {
        return { lines: [{ text: 'operator is already omnipotent. Incident logged (just kidding).', kind: 'warn' }], action: null };
      }
      return { lines: [{ text: `sudo: unable to resolve '${arg}' — nice try.`, kind: 'err' }], action: null };
    default:
      return {
        lines: [{ text: `aether: command not found: ${cmd} — try 'help'`, kind: 'err' }],
        action: null,
      };
  }
}

export const TERMINAL_BOOT: TermLine[] = [
  { text: 'AETHER operator console — build 4.2.17', kind: 'dim' },
  { text: "Type 'help' to list commands. Try 'matrix' if you dare.", kind: 'dim' },
];
