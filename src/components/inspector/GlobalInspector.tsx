import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { REGIONS } from '../../data/regions';
import { TOPOLOGY_NODES } from '../../data/topology';
import { useAppStore } from '../../stores/useAppStore';
import { StatusBadge } from '../ui/primitives';
import { NodeDetails, RegionDetails } from './details';
import type { HealthState } from '../../types';

function toneFor(health: HealthState): 'ok' | 'warn' | 'crit' | 'violet' {
  if (health === 'healthy') return 'ok';
  if (health === 'warning') return 'warn';
  if (health === 'critical') return 'crit';
  return 'violet';
}

/**
 * Global system inspector slide-over. Opens for any selected node/region
 * while the user is outside the infrastructure section (which has its own
 * inline panel for the same selection).
 */
export default function GlobalInspector() {
  const inspectorNodeId = useAppStore((s) => s.inspectorNodeId);
  const setInspectorNodeId = useAppStore((s) => s.setInspectorNodeId);
  const section = useAppStore((s) => s.section);
  const motionEnabled = useAppStore((s) => s.motionEnabled);

  useEffect(() => {
    if (!inspectorNodeId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setInspectorNodeId(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [inspectorNodeId, setInspectorNodeId]);

  const node = inspectorNodeId ? TOPOLOGY_NODES.find((n) => n.id === inspectorNodeId) ?? null : null;
  const region = !node && inspectorNodeId ? REGIONS.find((r) => r.id === inspectorNodeId) ?? null : null;
  const open = Boolean(inspectorNodeId && (node || region) && section !== 'infrastructure');

  const title = node ? node.label : region ? `${region.city} — ${region.code}` : '';
  const subtitle = node ? `${node.kind} · ${node.region}` : region ? region.country : '';
  const health = node?.health ?? region?.health ?? 'healthy';

  return (
    <AnimatePresence>
      {open && (
        <>
          <div className="inspector-scrim" onClick={() => setInspectorNodeId(null)} aria-hidden="true" />
          <motion.aside
            className="inspector-drawer"
            role="dialog"
            aria-modal="true"
            aria-label={`Inspector: ${title}`}
            initial={motionEnabled ? { x: 360, opacity: 0 } : false}
            animate={{ x: 0, opacity: 1 }}
            exit={motionEnabled ? { x: 360, opacity: 0 } : undefined}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="drawer-head">
              <div>
                <p className="eyebrow">SYSTEM INSPECTOR</p>
                <h3>{title}</h3>
                <p className="panel-sub">{subtitle}</p>
              </div>
              <div className="drawer-head-right">
                <StatusBadge tone={toneFor(health)}>{health.toUpperCase()}</StatusBadge>
                <button type="button" className="icon-btn" aria-label="Close inspector" onClick={() => setInspectorNodeId(null)}>
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="drawer-body">
              {node && (
                <NodeDetails
                  node={node}
                  resolveDep={(id) => TOPOLOGY_NODES.find((n) => n.id === id)?.label ?? id}
                  onSelectDep={(id) => setInspectorNodeId(id)}
                />
              )}
              {region && <RegionDetails region={region} />}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
