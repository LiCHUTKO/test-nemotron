import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from '../../stores/useAppStore';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Toasts from '../notifications/Toasts';

export default function AppShell({
  children,
  sectionKey,
  onSearchFocus,
}: {
  children: ReactNode;
  sectionKey: string;
  onSearchFocus: (el: HTMLInputElement | null) => void;
}) {
  const compactMode = useAppStore((s) => s.compactMode);
  const motionEnabled = useAppStore((s) => s.motionEnabled);

  return (
    <div className={`shell${compactMode ? ' is-compact' : ''}`}>
      <a className="skip-link" href="#workspace">
        Skip to workspace
      </a>
      <Sidebar />
      <div className="shell-main">
        <Topbar onSearchFocus={onSearchFocus} />
        <main id="workspace" className="workspace" tabIndex={-1}>
          <AnimatePresence mode="wait">
            <motion.div
              key={sectionKey}
              initial={motionEnabled ? { opacity: 0, y: 10 } : false}
              animate={{ opacity: 1, y: 0 }}
              exit={motionEnabled ? { opacity: 0, y: -8 } : undefined}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <Toasts />
    </div>
  );
}
