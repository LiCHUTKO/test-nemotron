import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { CheckCircle2, Info, TriangleAlert, OctagonX, X } from 'lucide-react';
import { useAppStore, type ToastSeverity } from '../../stores/useAppStore';

const ICONS: Record<ToastSeverity, typeof Info> = {
  info: Info,
  ok: CheckCircle2,
  warn: TriangleAlert,
  critical: OctagonX,
};

/** Premium toast stack, bottom-right. Auto-dismisses after 6s. */
export default function Toasts() {
  const toasts = useAppStore((s) => s.toasts);
  const dismissToast = useAppStore((s) => s.dismissToast);
  const motionEnabled = useAppStore((s) => s.motionEnabled);

  useEffect(() => {
    if (toasts.length === 0) return;
    const id = window.setTimeout(() => dismissToast(toasts[toasts.length - 1].id), 6000);
    return () => window.clearTimeout(id);
  }, [toasts, dismissToast]);

  return (
    <div className="toasts" aria-live="polite" aria-label="Event notifications">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = ICONS[t.severity];
          return (
            <div
              key={t.id}
              className={`toast toast-${t.severity}${motionEnabled ? ' toast-anim' : ''}`}
              role="status"
            >
              <Icon size={16} aria-hidden="true" />
              <div className="toast-text">
                <p>{t.title}</p>
                {t.detail && <small>{t.detail}</small>}
              </div>
              <button type="button" className="icon-btn" aria-label={`Dismiss ${t.title}`} onClick={() => dismissToast(t.id)}>
                <X size={14} />
              </button>
            </div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
