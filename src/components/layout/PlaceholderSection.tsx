import type { ReactNode } from 'react';
import { Cpu } from 'lucide-react';

/** Temporary stand-in rendered for modules that land in later milestones. */
export default function PlaceholderSection({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="placeholder">
      <span className="placeholder-icon" aria-hidden="true">
        <Cpu size={22} />
      </span>
      <h2>{label}</h2>
      <p>{hint}</p>
      <p className="mono placeholder-meta">MODULE QUEUED FOR DEPLOYMENT</p>
    </div>
  );
}

export function ShellMain({ children }: { children: ReactNode }) {
  return <div className="workspace">{children}</div>;
}
