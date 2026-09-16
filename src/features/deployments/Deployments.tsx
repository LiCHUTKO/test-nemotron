import { useEffect, useMemo, useState } from 'react';
import { CircleCheck, CircleX, GitBranch, Loader } from 'lucide-react';
import { DEPLOYMENTS } from '../../data/deployments';
import { timeAgo } from '../../lib/format';
import { Meter, Panel, SectionHeader, StatusBadge } from '../../components/ui/primitives';
import type { DeployPhase, Deployment } from '../../types';

const PHASES: DeployPhase[] = ['queued', 'building', 'testing', 'deploying', 'verifying', 'completed'];

function phaseIndex(p: DeployPhase): number {
  return PHASES.indexOf(p);
}

function statusTone(s: Deployment['status']): 'ok' | 'info' | 'crit' | 'muted' {
  if (s === 'success') return 'ok';
  if (s === 'running') return 'info';
  if (s === 'failed') return 'crit';
  return 'muted';
}

/** Single deployment card with an animated phase pipeline. */
function DeploymentCard({ dep, tick }: { dep: Deployment; tick: number }) {
  // Running deployments creep forward locally for a living pipeline feel.
  const progress = dep.status === 'running'
    ? Math.min(97, dep.progress + (tick % 7))
    : dep.progress;
  const activeIdx = dep.status === 'failed' ? 2 : phaseIndex(dep.phase);

  return (
    <article className={`deploy${dep.status === 'failed' ? ' is-failed' : ''}`}>
      <div className="deploy-top">
        <div>
          <strong>{dep.service}</strong>
          <span className="mono deploy-ver">{dep.version} · {dep.environment}</span>
        </div>
        <StatusBadge tone={statusTone(dep.status)}>{dep.status.toUpperCase()}</StatusBadge>
      </div>

      <div className="phases" aria-label={`Pipeline phase: ${dep.phase}`}>
        {PHASES.map((p, i) => (
          <div key={p} className="phase">
            <span
              className={`phase-dot${i < activeIdx || dep.status === 'success' ? ' is-done' : ''}${i === activeIdx && dep.status !== 'success' ? ' is-active' : ''}${dep.status === 'failed' && i === activeIdx ? ' is-failed' : ''}`}
              aria-hidden="true"
            />
            <small className={i === activeIdx ? 'is-active' : ''}>{p}</small>
            {i < PHASES.length - 1 && <span className={`phase-link${i < activeIdx ? ' is-done' : ''}`} aria-hidden="true" />}
          </div>
        ))}
      </div>

      <Meter value={progress} label={`${dep.service} progress`} />
      <div className="deploy-meta mono">
        <span><GitBranch size={12} aria-hidden="true" /> {dep.branch} · {dep.commit}</span>
        <span>{dep.author}</span>
        <span>{timeAgo(dep.startedAt)}</span>
      </div>
    </article>
  );
}

export default function Deployments() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 3000);
    return () => window.clearInterval(id);
  }, []);

  const stats = useMemo(() => {
    const running = DEPLOYMENTS.filter((d) => d.status === 'running').length;
    const success = DEPLOYMENTS.filter((d) => d.status === 'success').length;
    const failed = DEPLOYMENTS.filter((d) => d.status === 'failed').length;
    return { running, success, failed, total: DEPLOYMENTS.length };
  }, []);

  return (
    <div className="deployments">
      <SectionHeader
        eyebrow="AETHER // DEPLOYMENT CONTROL"
        title="Release Pipeline"
        description="Every promotion from commit to production, verified stage by stage."
        right={
          <div className="stat-chips">
            <span className="badge badge-info"><Loader size={12} aria-hidden="true" /> {stats.running} RUNNING</span>
            <span className="badge badge-ok"><CircleCheck size={12} aria-hidden="true" /> {stats.success} SUCCESS</span>
            <span className="badge badge-crit"><CircleX size={12} aria-hidden="true" /> {stats.failed} FAILED</span>
          </div>
        }
      />
      <Panel title="Fleet promotions" subtitle={`${stats.total} tracked releases · live progress`}>
        <div className="deploy-grid">
          {DEPLOYMENTS.map((d) => (
            <DeploymentCard key={d.id} dep={d} tick={tick} />
          ))}
        </div>
      </Panel>
    </div>
  );
}
