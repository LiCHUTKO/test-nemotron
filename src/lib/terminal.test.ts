import { describe, expect, it } from 'vitest';
import { runTerminalCommand } from './terminal';

describe('terminal command parser', () => {
  it('returns empty output for blank input', () => {
    expect(runTerminalCommand('   ')).toEqual({ lines: [], action: null });
  });

  it('lists commands on help', () => {
    const res = runTerminalCommand('help');
    expect(res.action).toBeNull();
    const text = res.lines.map((l) => l.text).join('\n');
    for (const cmd of ['status', 'health', 'nodes', 'incidents', 'clear']) {
      expect(text).toContain(cmd);
    }
  });

  it('is case-insensitive and trims whitespace', () => {
    const a = runTerminalCommand('  STATUS ');
    const b = runTerminalCommand('status');
    expect(a.lines).toEqual(b.lines);
  });

  it('reports unknown commands with guidance', () => {
    const res = runTerminalCommand('frobnicate');
    expect(res.action).toBeNull();
    expect(res.lines).toHaveLength(1);
    expect(res.lines[0].kind).toBe('err');
    expect(res.lines[0].text).toContain('frobnicate');
  });

  it('clears via action, not lines', () => {
    expect(runTerminalCommand('clear')).toEqual({ lines: [], action: 'clear' });
  });

  it('summarizes platform status with live counts', () => {
    const res = runTerminalCommand('status');
    const text = res.lines.map((l) => l.text).join('\n');
    expect(text).toContain('99.982%');
    expect(text).toContain('248');
  });

  it('lists open incidents with severities', () => {
    const res = runTerminalCommand('incidents');
    const text = res.lines.map((l) => l.text).join('\n');
    expect(text).toContain('INC-2841');
    expect(text).toContain('SEV-2');
  });

  it('renders agent roster from fleet data', () => {
    const res = runTerminalCommand('agents');
    const text = res.lines.map((l) => l.text).join('\n');
    expect(text).toContain('Sentinel');
    expect(text).toContain('Argus');
  });

  it('handles easter eggs: matrix and sudo', () => {
    const matrix = runTerminalCommand('matrix');
    expect(matrix.action).toBe('matrix-fx');
    expect(matrix.lines.length).toBeGreaterThan(0);

    const sudo = runTerminalCommand('sudo status');
    expect(sudo.action).toBeNull();
    expect(sudo.lines[0].text.toLowerCase()).toContain('omnipotent');
  });

  it('answers whoami, about and uptime', () => {
    expect(runTerminalCommand('whoami').lines[0].text).toContain('operator');
    expect(runTerminalCommand('about').lines[0].text).toContain('AETHER');
    expect(runTerminalCommand('uptime').lines[0].text).toContain('nexus up');
  });
});
