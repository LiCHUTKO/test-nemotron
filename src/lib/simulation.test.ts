import { describe, expect, it } from 'vitest';
import { createRng, deltaPctOf, generateSeries, stepSeries } from './simulation';

describe('simulation engine', () => {
  it('creates deterministic RNG streams per seed', () => {
    const a = createRng(42);
    const b = createRng(42);
    const c = createRng(43);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
    expect(a()).not.toBe(c());
  });

  it('generates the requested number of points within bounds', () => {
    const s = generateSeries(7, 60, { base: 50, amplitude: 20, min: 10, max: 90 });
    expect(s).toHaveLength(60);
    for (const v of s) {
      expect(v).toBeGreaterThanOrEqual(10);
      expect(v).toBeLessThanOrEqual(90);
    }
  });

  it('is deterministic for the same seed', () => {
    const cfg = { base: 46, amplitude: 22, min: 18, max: 92 };
    expect(generateSeries(11, 40, cfg)).toEqual(generateSeries(11, 40, cfg));
  });

  it('produces smooth transitions, not white noise', () => {
    const s = generateSeries(5, 100, { base: 50, amplitude: 20, min: 0, max: 100 });
    let jumps = 0;
    for (let i = 1; i < s.length; i++) {
      if (Math.abs(s[i] - s[i - 1]) > 25) jumps += 1;
    }
    expect(jumps).toBeLessThan(8);
  });

  it('steps a live series by shifting and appending in bounds', () => {
    const cfg = { base: 50, amplitude: 20, min: 10, max: 90 };
    const prev = generateSeries(9, 20, cfg);
    const rng = createRng(99);
    const next = stepSeries(prev, rng, cfg);
    expect(next).toHaveLength(20);
    expect(next[0]).toBe(prev[1]);
    for (const v of next) {
      expect(v).toBeGreaterThanOrEqual(10);
      expect(v).toBeLessThanOrEqual(90);
    }
  });

  it('computes series deltas', () => {
    expect(deltaPctOf([100, 110])).toBeCloseTo(10);
    expect(deltaPctOf([100, 90])).toBeCloseTo(-10);
    expect(deltaPctOf([5])).toBe(0);
  });
});
