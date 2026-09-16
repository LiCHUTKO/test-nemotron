import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../stores/useAppStore';

const STAGES = ['CORE SYSTEMS', 'NETWORK FABRIC', 'TELEMETRY', 'AI AGENTS', 'SECURITY GRID'] as const;

/** Cinematic startup sequence; short by design (~2s). */
export default function BootScreen() {
  const setBootComplete = useAppStore((s) => s.setBootComplete);
  const motionEnabled = useAppStore((s) => s.motionEnabled);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (!motionEnabled) {
      setBootComplete(true);
      return;
    }
    if (stage >= STAGES.length) {
      const done = window.setTimeout(() => setBootComplete(true), 350);
      return () => window.clearTimeout(done);
    }
    const id = window.setTimeout(() => setStage((s) => s + 1), 300);
    return () => window.clearTimeout(id);
  }, [stage, motionEnabled, setBootComplete]);

  if (!motionEnabled) return null;

  const progress = Math.min(100, (stage / STAGES.length) * 100);

  return (
    <motion.div
      className="boot"
      role="status"
      aria-label="Initializing AETHER"
      exit={{ opacity: 0, filter: 'blur(6px)' }}
      transition={{ duration: 0.4 }}
    >
      <div className="boot-inner">
        <p className="boot-eyebrow mono">AETHER // GLOBAL OPERATIONS NEXUS</p>
        <h1 className="boot-title">INITIALIZING</h1>
        <div className="boot-bar" aria-hidden="true">
          <div className="boot-bar-fill" style={{ width: `${progress}%` }} />
        </div>
        <ul className="boot-stages">
          {STAGES.map((s, i) => (
            <li key={s} className={`boot-stage${i < stage ? ' is-done' : ''}${i === stage ? ' is-active' : ''}`}>
              <span className="boot-stage-box" aria-hidden="true">
                {i < stage ? '✓' : ''}
              </span>
              <span className="mono">{s}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
