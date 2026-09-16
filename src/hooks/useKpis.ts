import { useEffect, useRef, useState } from 'react';
import { createRng, deltaPctOf, generateSeries } from '../lib/simulation';
import type { KpiDatum } from '../types';

interface KpiDef {
  id: string;
  label: string;
  unit: string;
  decimals: number;
  base: number;
  jitter: number;
  min: number;
  max: number;
}

const DEFS: KpiDef[] = [
  { id: 'health', label: 'System Health', unit: '%', decimals: 3, base: 99.982, jitter: 0.008, min: 99.9, max: 99.999 },
  { id: 'nodes', label: 'Active Nodes', unit: '', decimals: 0, base: 248, jitter: 1.6, min: 240, max: 256 },
  { id: 'regions', label: 'Global Regions', unit: '', decimals: 0, base: 12, jitter: 0, min: 12, max: 12 },
  { id: 'agents', label: 'Active AI Agents', unit: '', decimals: 0, base: 18, jitter: 0.8, min: 15, max: 21 },
  { id: 'incidents', label: 'Open Incidents', unit: '', decimals: 0, base: 3, jitter: 0.4, min: 1, max: 6 },
  { id: 'deploys', label: 'Deployments Today', unit: '', decimals: 0, base: 27, jitter: 0.5, min: 24, max: 34 },
  { id: 'threats', label: 'Threat Events', unit: '', decimals: 0, base: 142, jitter: 3, min: 120, max: 180 },
  { id: 'tput', label: 'Network Throughput', unit: ' Tbps', decimals: 2, base: 8.42, jitter: 0.12, min: 7.4, max: 9.6 },
];

/** Live executive KPIs with sparklines, drifting on a single 2.5s interval. */
export function useKpis(live = true): KpiDatum[] {
  const [values, setValues] = useState<number[]>(DEFS.map((d) => d.base));
  const rngRef = useRef(createRng(20260916));

  const sparks = useRef<Record<string, number[]>>({});
  if (Object.keys(sparks.current).length === 0) {
    for (let i = 0; i < DEFS.length; i++) {
      const d = DEFS[i];
      sparks.current[d.id] = generateSeries(1000 + i * 131, 28, {
        base: d.base,
        amplitude: Math.max(d.jitter * 4, d.base * 0.01),
        min: d.min - (d.max - d.min) * 0.15,
        max: d.max + (d.max - d.min) * 0.15,
        decimals: d.decimals,
      });
    }
  }

  const [, force] = useState(0);

  useEffect(() => {
    if (!live) return;
    const id = window.setInterval(() => {
      const rng = rngRef.current;
      setValues((prev) =>
        prev.map((v, i) => {
          const d = DEFS[i];
          const nv = Math.min(d.max, Math.max(d.min, v + (rng() - 0.5) * 2 * d.jitter));
          const rounded = Number(nv.toFixed(d.decimals));
          const spark = sparks.current[d.id];
          spark.push(rounded);
          spark.shift();
          return rounded;
        }),
      );
      force((n) => n + 1);
    }, 2500);
    return () => window.clearInterval(id);
  }, [live]);

  return DEFS.map((d, i) => ({
    id: d.id,
    label: d.label,
    value: values[i],
    unit: d.unit,
    decimals: d.decimals,
    deltaPct: deltaPctOf(sparks.current[d.id]),
    series: [...sparks.current[d.id]],
  }));
}
