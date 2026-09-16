import type { RegionInfo } from '../types';

/** Global region footprint. x/y are normalized 0..1 map positions. */
export const REGIONS: RegionInfo[] = [
  { id: 'rg-fra', city: 'Frankfurt', code: 'fra-eu-c1', country: 'Germany', x: 0.523, y: 0.222, health: 'healthy', latencyMs: 18, workloads: 54, throughputGbps: 612 },
  { id: 'rg-waw', city: 'Warsaw', code: 'waw-eu-c1', country: 'Poland', x: 0.558, y: 0.209, health: 'healthy', latencyMs: 24, workloads: 31, throughputGbps: 284 },
  { id: 'rg-iad', city: 'Virginia', code: 'iad-us-e1', country: 'USA', x: 0.283, y: 0.294, health: 'healthy', latencyMs: 86, workloads: 47, throughputGbps: 388 },
  { id: 'rg-pdx', city: 'Oregon', code: 'pdx-us-w2', country: 'USA', x: 0.166, y: 0.256, health: 'healthy', latencyMs: 112, workloads: 26, throughputGbps: 196 },
  { id: 'rg-sgp', city: 'Singapore', code: 'sgp-ap-se1', country: 'Singapore', x: 0.789, y: 0.494, health: 'warning', latencyMs: 134, workloads: 38, throughputGbps: 342 },
  { id: 'rg-nrt', city: 'Tokyo', code: 'nrt-ap-ne1', country: 'Japan', x: 0.887, y: 0.303, health: 'healthy', latencyMs: 142, workloads: 29, throughputGbps: 204 },
  { id: 'rg-syd', city: 'Sydney', code: 'syd-ap-se2', country: 'Australia', x: 0.92, y: 0.687, health: 'healthy', latencyMs: 188, workloads: 14, throughputGbps: 96 },
  { id: 'rg-gru', city: 'São Paulo', code: 'gru-sa-e1', country: 'Brazil', x: 0.37, y: 0.631, health: 'maintenance', latencyMs: 171, workloads: 12, throughputGbps: 74 },
];

/**
 * Stylized dotted-world landmass as run-length spans per grid row.
 * 64 × 32 equirectangular grid — an impression, not a survey.
 */
export const WORLD_ROWS: Record<number, Array<[number, number]>> = {
  1: [[13, 20], [28, 31]],
  2: [[3, 7], [13, 24], [28, 31], [38, 58]],
  3: [[4, 7], [13, 24], [29, 30], [33, 35], [38, 60]],
  4: [[4, 7], [13, 24], [30, 30], [33, 36], [38, 61]],
  5: [[14, 24], [29, 30], [31, 32], [33, 37], [39, 62]],
  6: [[14, 25], [31, 31], [33, 39], [41, 61]],
  7: [[8, 20], [32, 40], [42, 60], [61, 62]],
  8: [[8, 21], [32, 41], [43, 60], [61, 61]],
  9: [[9, 19], [32, 45], [47, 56], [60, 60]],
  10: [[8, 13], [19, 20], [32, 46], [48, 50], [52, 57]],
  11: [[8, 12], [32, 45], [49, 49], [53, 56]],
  12: [[9, 13], [33, 38], [44, 46], [53, 57]],
  13: [[10, 13], [34, 44], [49, 50], [54, 55]],
  14: [[14, 18], [35, 45], [55, 60]],
  15: [[15, 22], [36, 44], [55, 61]],
  16: [[14, 23], [36, 44], [60, 62]],
  17: [[16, 24], [36, 43], [56, 60]],
  18: [[16, 23], [37, 42], [45, 45], [55, 61]],
  19: [[16, 21], [37, 42], [45, 45], [55, 61]],
  20: [[17, 20], [38, 41], [56, 60], [63, 63]],
  21: [[17, 20], [38, 40], [57, 59], [62, 63]],
  22: [[17, 19], [62, 62]],
  23: [[17, 19]],
  24: [[17, 18]],
};

export const GRID_COLS = 64;
export const GRID_ROWS = 32;

/** Busiest peers for the selected region (by throughput). */
export function peersFor(regionId: string, count = 3): RegionInfo[] {
  const self = REGIONS.find((r) => r.id === regionId);
  if (!self) return [];
  return [...REGIONS]
    .filter((r) => r.id !== regionId)
    .sort((a, b) => b.throughputGbps - a.throughputGbps)
    .slice(0, count);
}
