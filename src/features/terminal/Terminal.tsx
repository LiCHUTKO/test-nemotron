import { useEffect, useRef, useState } from 'react';
import { TERMINAL_BOOT, runTerminalCommand, type TermLine } from '../../lib/terminal';
import { Panel, SectionHeader } from '../../components/ui/primitives';
import { useAppStore } from '../../stores/useAppStore';
import { nextId } from '../../lib/format';

interface Row extends TermLine {
  id: string;
}

const MAX_ROWS = 220;

export default function Terminal() {
  const motionEnabled = useAppStore((s) => s.motionEnabled);
  const [rows, setRows] = useState<Row[]>(() =>
    TERMINAL_BOOT.map((l) => ({ ...l, id: nextId('term') })),
  );
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [matrixFx, setMatrixFx] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [rows]);

  useEffect(() => {
    if (!matrixFx) return;
    const id = window.setTimeout(() => setMatrixFx(false), motionEnabled ? 5000 : 0);
    return () => window.clearTimeout(id);
  }, [matrixFx, motionEnabled]);

  const push = (lines: TermLine[]) => {
    setRows((prev) =>
      [...prev, ...lines.map((l) => ({ ...l, id: nextId('term') }))].slice(-MAX_ROWS),
    );
  };

  const exec = (raw: string) => {
    const cmd = raw.trim();
    push([{ text: `operator@aether:~$ ${cmd}`, kind: 'cmd' }]);
    if (!cmd) return;
    const result = runTerminalCommand(cmd);
    if (result.action === 'clear') {
      setRows([]);
    } else {
      push(result.lines);
      if (result.action === 'matrix-fx') setMatrixFx(true);
    }
    setHistory((h) => [cmd, ...h].slice(0, 50));
    setHistIdx(-1);
  };

  return (
    <div className="terminal-view">
      <SectionHeader
        eyebrow="AETHER // OPERATOR CONSOLE"
        title="Terminal"
        description="A real console into the simulated fabric. History, autofocus and easter eggs included."
      />
      <Panel pad={false} title="operator@aether">
        <div
          className={`term${matrixFx ? ' term-matrix' : ''}`}
          onClick={() => inputRef.current?.focus()}
          role="presentation"
        >
          <div className="term-scroll" ref={scrollRef} aria-live="polite" aria-label="Terminal output">
            {rows.map((r) => (
              <div key={r.id} className={`term-line term-${r.kind}`}>
                {r.text}
              </div>
            ))}
            <form
              className="term-input-row"
              onSubmit={(e) => {
                e.preventDefault();
                exec(input);
                setInput('');
              }}
            >
              <span className="term-prompt" aria-hidden="true">
                operator@aether:~$
              </span>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    const next = Math.min(histIdx + 1, history.length - 1);
                    if (history[next]) {
                      setHistIdx(next);
                      setInput(history[next]);
                    }
                  } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    const next = histIdx - 1;
                    setHistIdx(next);
                    setInput(next >= 0 ? history[next] : '');
                  }
                }}
                aria-label="Terminal input"
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                className="term-input"
              />
            </form>
          </div>
        </div>
      </Panel>
    </div>
  );
}
