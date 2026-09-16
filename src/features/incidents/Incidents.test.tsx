import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Incidents from './Incidents';

describe('incident command center', () => {
  it('renders the queue and selects an incident by default', () => {
    render(<Incidents />);
    expect(screen.getByText('INC-2841 — Analytics shard hotspot causing query spill')).toBeInTheDocument();
    expect(screen.getByText(/Shard 7 of the analytics cluster/)).toBeInTheDocument();
  });

  it('filters the queue through search', async () => {
    const user = userEvent.setup();
    render(<Incidents />);
    const search = screen.getByLabelText('Search incidents');
    await user.clear(search);
    await user.type(search, 'telemetry');
    expect(screen.queryByText(/Analytics shard hotspot/)).not.toBeInTheDocument();
    expect(screen.getAllByText(/Telemetry ingest lag/).length).toBeGreaterThan(0);
  });

  it('shows an empty state when nothing matches', async () => {
    const user = userEvent.setup();
    render(<Incidents />);
    await user.type(screen.getByLabelText('Search incidents'), 'zzz-no-match');
    expect(screen.getByText('No incidents match')).toBeInTheDocument();
  });

  it('switches detail view when a row is clicked', async () => {
    const user = userEvent.setup();
    render(<Incidents />);
    await user.click(screen.getByRole('button', { name: /AI inference GPU saturation/i }));
    expect(screen.getByText(/Interactive agent calls are slower/)).toBeInTheDocument();
  });
});
