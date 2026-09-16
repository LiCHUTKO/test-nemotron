/**
 * Centralized simulation engine.
 *
 * All "live" data in the nexus derives from here so behavior is coherent,
 * ranges are realistic (smooth random-walk, never white-noise garbage) and
 * every interval lives in exactly one hook with proper cleanup.
 */

/** Deterministic PRNG (mulberry32) so series are stable per seed. */
export function createRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface SeriesConfig {
  base: number;
  amplitude: number;
  min: number;
  max: number;
  /** slow drift cycles over the window, e.g. business-hours wave */
  cycles?: number;
  /** deterministic trend from first to last point (+/- fraction of base) */
  trend?: number;
  decimals?: number;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

/** Smooth random-walk series with a sinusoidal daily component. */
export function generateSeries(seed: number, points: number, cfg: SeriesConfig): number[] {
  const rng = createRng(seed);
  const out: number[] = [];
  const cycles = cfg.cycles ?? 1.5;
  const trend = cfg.trend ?? 0;
  let walk = 0;
  const decimals = cfg.decimals ?? 2;
  for (let i = 0; i < points; i++) {
    const phase = (i / points) * Math.PI * 2 * cycles;
    const wave = Math.sin(phase + seed) * cfg.amplitude * 0.55;
    const drift = (trend * cfg.base * i) / Math.max(1, points - 1);
    walk += (rng() - 0.5) * cfg.amplitude * 0.34;
    walk *= 0.94; // mean reversion keeps it smooth
    const spike = rng() > 0.985 ? cfg.amplitude * 0.9 * rng() : 0;
    const v = clamp(cfg.base + wave + drift + walk + spike, cfg.min, cfg.max);
    out.push(Number(v.toFixed(decimals)));
  }
  return out;
}

/** Advance a live series by one smooth step (shift + append). */
export function stepSeries(prev: number[], rng: () => number, cfg: SeriesConfig): number[] {
  const last = prev[prev.length - 1] ?? cfg.base;
  const delta = (rng() - 0.5) * cfg.amplitude * 0.22;
  const pull = (cfg.base - last) * 0.06; // gentle mean reversion
  const spike = rng() > 0.97 ? cfg.amplitude * 0.5 * rng() : 0;
  const next = clamp(
    last + delta + pull + spike,
    cfg.min,
    cfg.max,
  );
  return [...prev.slice(1), Number(next.toFixed(cfg.decimals ?? 2))];
}

export type TelemetryRange = '1H' | '6H' | '24H' | '7D';

export const TELEMETRY_RANGES: readonly TelemetryRange[] = ['1H', '6H', '24H', '7D'] as const;

export const RANGE_POINTS: Record<TelemetryRange, number> = {
  '1H': 60,
  '6H': 72,
  '24H': 96,
  '7D': 84,
};

export interface MetricDef {
  key: string;
  label: string;
  unit: string;
  color: string;
  seed: number;
  cfg: SeriesConfig;
  invertTrend?: boolean;
}

export const METRICS: MetricDef[] = [
  { key: 'cpu', label: 'CPU Utilization', unit: '%', color: '#56c8ff', seed: 11, cfg: { base: 46, amplitude: 22, min: 18, max: 92, cycles: 2 } },
  { key: 'mem', label: 'Memory Utilization', unit: '%', color: '#9a7bff', seed: 23, cfg: { base: 62, amplitude: 12, min: 40, max: 89, cycles: 1 } },
  { key: 'rps', label: 'Request Throughput', unit: 'k/s', color: '#3ce6c3', seed: 37, cfg: { base: 84, amplitude: 30, min: 35, max: 165, cycles: 2.5 } },
  { key: 'bw', label: 'Network Bandwidth', unit: 'Gbps', color: '#4f7cff', seed: 41, cfg: { base: 412, amplitude: 150, min: 180, max: 780, cycles: 2 } },
  { key: 'lat', label: 'Latency p95', unit: 'ms', color: '#ffb454', seed: 53, cfg: { base: 118, amplitude: 60, min: 42, max: 320, cycles: 1.5 }, invertTrend: true },
  { key: 'err', label: 'Error Rate', unit: '%', color: '#ff5d6c', seed: 67, cfg: { base: 0.42, amplitude: 0.5, min: 0.02, max: 2.4, cycles: 1, decimals: 3 }, invertTrend: true },
  { key: 'iops', label: 'Storage IOPS', unit: 'k', color: '#43e8a0', seed: 79, cfg: { base: 128, amplitude: 55, min: 60, max: 260, cycles: 2 } },
];

/** Throughput backbone for the overview hero chart. */
export function backboneSeries(seed: number, points: number): number[] {
  return generateSeries(seed, points, {
    base: 8.4,
    amplitude: 1.6,
    min: 5.2,
    max: 11.8,
    cycles: 2,
    trend: 0.04,
  });
}

export function deltaPctOf(series: number[]): number {
  if (series.length < 2) return 0;
  const first = series[0];
  const last = series[series.length - 1];
  if (first === 0) return 0;
  return ((last - first) / Math.abs(first)) * 100;
}
