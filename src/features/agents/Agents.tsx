import { useState } from 'react';
import { Bot } from 'lucide-react';
import { AGENTS } from '../../data/agents';
import { Meter, Panel, SectionHeader, StatusBadge } from '../../components/ui/primitives';
import type { AgentState } from '../../types';

const STATE_TONE: Record<AgentState, 'ok' | 'warn' | 'info' | 'muted' | 'violet'> = {
  active: 'ok',
  investigating: 'warn',
  idle: 'muted',
  handoff: 'violet',
};

export default function Agents() {
  const [selectedId, setSelectedId] = useState<string>('sentinel');
  const selected = AGENTS.find((a) => a.id === selectedId) ?? AGENTS[0];
  const active = AGENTS.filter((a) => a.state === 'active' || a.state === 'investigating').length;

  return (
    <div className="agents">
      <SectionHeader
        eyebrow="AETHER // AI AGENT OPERATIONS"
        title="Autonomous Fleet"
        description={`${active} of ${AGENTS.length} agents engaged · every action logged, every decision explainable.`}
        right={<span className="badge badge-ok"><span className="dot dot-ok" /> FLEET NOMINAL</span>}
      />

      <div className="agent-grid">
        <div className="agent-cards" role="list" aria-label="Agent roster">
          {AGENTS.map((a) => (
            <button
              key={a.id}
              type="button"
              role="listitem"
              className={`agent-card${selected.id === a.id ? ' is-selected' : ''}`}
              onClick={() => setSelectedId(a.id)}
              aria-current={selected.id === a.id}
            >
              <span className="agent-avatar" aria-hidden="true">
                <Bot size={18} />
              </span>
              <span className="agent-main">
                <strong>{a.name}</strong>
                <small>{a.role}</small>
                <small className="agent-task">“{a.task}”</small>
              </span>
              <StatusBadge tone={STATE_TONE[a.state]}>{a.state.toUpperCase()}</StatusBadge>
            </button>
          ))}
        </div>

        <Panel
          title={`${selected.name} — ${selected.role}`}
          subtitle={`Confidence ${selected.confidence}% · ${selected.tasksCompleted.toLocaleString()} tasks completed`}
          action={<StatusBadge tone={STATE_TONE[selected.state]}>{selected.state.toUpperCase()}</StatusBadge>}
        >
          <div className="agent-detail">
            <p className="agent-task-now">“{selected.task}”</p>
            <div className="insp-grid">
              <div><p className="insp-k">Avg execution</p><p className="mono insp-v">{selected.avgExecSec}s</p></div>
              <div><p className="insp-k">Tasks done</p><p className="mono insp-v">{selected.tasksCompleted.toLocaleString()}</p></div>
            </div>
            <div className="insp-meter">
              <div className="insp-meter-row"><span>CPU {selected.cpu}%</span><Meter value={selected.cpu} label={`${selected.name} CPU`} /></div>
              <div className="insp-meter-row"><span>CONF {selected.confidence}%</span><Meter value={selected.confidence} label={`${selected.name} confidence`} /></div>
            </div>
            <p className="insp-k">Last action</p>
            <p className="insp-notes">{selected.lastAction}</p>
            <h4 className="mini-head">Activity log</h4>
            <ol className="timeline">
              {selected.activity.map((t) => (
                <li key={`${t.at}-${t.label}`}>
                  <span className="mono timeline-at">{t.at}</span>
                  <div>
                    <strong>{t.label}</strong>
                    {t.detail && <p>{t.detail}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Panel>
      </div>
    </div>
  );
}
