import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Meter, StatusBadge } from './primitives';

describe('ui primitives', () => {
  it('renders status badges with tone classes', () => {
    render(<StatusBadge tone="crit">SEV-1</StatusBadge>);
    const badge = screen.getByText('SEV-1');
    expect(badge.className).toContain('badge-crit');
  });

  it('exposes meter semantics for assistive tech', () => {
    render(<Meter value={83} label="CPU load" />);
    const meter = screen.getByRole('meter', { name: 'CPU load' });
    expect(meter.getAttribute('aria-valuenow')).toBe('83');
  });

  it('clamps meter values to 0..100', () => {
    const { rerender } = render(<Meter value={140} label="over" />);
    expect(screen.getByRole('meter', { name: 'over' }).getAttribute('aria-valuenow')).toBe('100');
    rerender(<Meter value={-4} label="under" />);
    expect(screen.getByRole('meter', { name: 'under' }).getAttribute('aria-valuenow')).toBe('0');
  });
});
