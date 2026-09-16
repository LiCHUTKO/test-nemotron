import { describe, expect, it } from 'vitest';
import { toChartData } from './chart';
import { formatClock, formatCompact, formatPct, isoToUtcClock, timeAgo } from './format';

describe('chart helpers', () => {
  it('maps series to labeled datum preserving values', () => {
    const data = toChartData([1, 2, 3], '1H');
    expect(data).toHaveLength(3);
    expect(data.map((d) => d.v)).toEqual([1, 2, 3]);
    expect(data[2].t).toBe('-0m');
  });

  it('labels 7D windows by day offsets', () => {
    const data = toChartData([1, 2, 3, 4], '7D');
    expect(data[0].t).toBe('D-3');
    expect(data[3].t).toBe('D-0');
  });
});

describe('formatters', () => {
  it('compacts large numbers with units', () => {
    expect(formatCompact(142)).toBe('142');
    expect(formatCompact(1420)).toBe('1.42K');
    expect(formatCompact(8_420_000_000_000)).toBe('8.42T');
  });

  it('formats percentages', () => {
    expect(formatPct(99.982)).toBe('99.98%');
  });

  it('formats clocks in UTC deterministically', () => {
    const d = new Date('2026-09-16T09:41:12Z');
    expect(formatClock(d, 'UTC')).toBe('09:41:12');
    expect(isoToUtcClock('2026-09-16T09:41:12.000Z')).toBe('09:41:12');
  });

  it('describes relative time', () => {
    const now = new Date('2026-09-16T10:00:00Z').getTime();
    expect(timeAgo(new Date(now - 5000).toISOString(), now)).toBe('just now');
    expect(timeAgo(new Date(now - 90_000).toISOString(), now)).toBe('1m ago');
    expect(timeAgo(new Date(now - 3 * 3_600_000).toISOString(), now)).toBe('3h ago');
  });
});
