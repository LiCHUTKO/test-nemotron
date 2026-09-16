import { useEffect, useMemo, useRef, useState } from 'react';
import {
  RANGE_POINTS,
  createRng,
  generateSeries,
  stepSeries,
  type SeriesConfig,
  type TelemetryRange,
} from '../lib/simulation';

/**
 * Live-evolving numeric series. Regenerates on range/config change and
 * appends one smooth step per tick. Exactly one interval per instance,
 * always cleaned up.
 */
export function useLiveSeries(
  seed: number,
  range: TelemetryRange,
  cfg: SeriesConfig,
  tickMs = 2500,
  live = true,
): number[] {
  const points = RANGE_POINTS[range];
  const [series, setSeries] = useState<number[]>(() => generateSeries(seed, points, cfg));
  const rngRef = useRef<() => number>(() => 0);

  const cfgKey = useMemo(
    () => JSON.stringify({ b: cfg.base, a: cfg.amplitude, lo: cfg.min, hi: cfg.max, c: cfg.cycles, t: cfg.trend, d: cfg.decimals }),
    [cfg],
  );

  useEffect(() => {
    setSeries(generateSeries(seed, points, cfg));
    rngRef.current = createRng(seed * 7919 + points);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed, points, cfgKey]);

  useEffect(() => {
    if (!live) return;
    const id = window.setInterval(() => {
      setSeries((prev) => stepSeries(prev, rngRef.current, cfg));
    }, tickMs);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, tickMs, cfgKey]);

  return series;
}
