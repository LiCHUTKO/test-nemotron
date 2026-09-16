export interface ChartDatum {
  t: string;
  v: number;
}

function labelFor(i: number, n: number, range: string): string {
  if (range === '7D') return `D-${n - 1 - i}`;
  const totalMin = range === '1H' ? 60 : range === '6H' ? 360 : 1440;
  const minsAgo = Math.round(((n - 1 - i) / Math.max(1, n - 1)) * totalMin);
  if (minsAgo >= 60) return `-${Math.floor(minsAgo / 60)}h${minsAgo % 60 ? `${minsAgo % 60}m` : ''}`;
  return `-${minsAgo}m`;
}

/** Map a raw numeric series to labeled chart datum for a range. */
export function toChartData(series: number[], range: string): ChartDatum[] {
  const n = series.length;
  return series.map((v, i) => ({
    t: labelFor(i, n, range),
    v,
  }));
}
