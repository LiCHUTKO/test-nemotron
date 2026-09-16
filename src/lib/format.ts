/** Small pure formatting helpers shared across the nexus. */

export function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

/** HH:MM:SS in the given IANA time zone (or local when omitted). */
export function formatClock(d: Date, timeZone?: string): string {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    ...(timeZone ? { timeZone } : {}),
  });
  return fmt.format(d);
}

export function formatUTC(d: Date): string {
  return formatClock(d, 'UTC');
}

/** Compact number: 1420 -> "1.42K", 8_420_000_000_000 -> "8.42T". */
export function formatCompact(n: number, decimals = 2): string {
  const abs = Math.abs(n);
  const units: Array<[number, string]> = [
    [1e12, 'T'],
    [1e9, 'G'],
    [1e6, 'M'],
    [1e3, 'K'],
  ];
  for (const [threshold, suffix] of units) {
    if (abs >= threshold) {
      return `${(n / threshold).toFixed(decimals)}${suffix}`;
    }
  }
  return `${n}`;
}

export function formatPct(n: number, decimals = 2): string {
  return `${n.toFixed(decimals)}%`;
}

/** "3m ago", "2h ago" style relative label from an ISO timestamp. */
export function timeAgo(iso: string, now: number = Date.now()): string {
  const diffSec = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (diffSec < 10) return 'just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const mins = Math.floor(diffSec / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

/** HH:MM:SS (UTC) extracted from an ISO timestamp. */
export function isoToUtcClock(iso: string): string {
  const d = new Date(iso);
  return `${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}:${pad2(d.getUTCSeconds())}`;
}

let toastSeq = 0;

/** Collision-safe local id for toasts / log entries. */
export function nextId(prefix: string): string {
  toastSeq += 1;
  return `${prefix}-${Date.now().toString(36)}-${toastSeq}`;
}
