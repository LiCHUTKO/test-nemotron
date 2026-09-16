import { useEffect, useRef } from 'react';
import { useAppStore, type ToastSeverity } from '../stores/useAppStore';

const ROTATION: Array<{ title: string; detail: string; severity: ToastSeverity }> = [
  { title: 'Deployment completed', detail: 'gateway-api v4.18.2 verified in production', severity: 'ok' },
  { title: 'Latency spike detected', detail: 'edge-sgp p95 +22ms — rerouting engaged', severity: 'warn' },
  { title: 'AI investigation finished', detail: 'Sentinel closed anomaly sweep: no drift beyond 2σ', severity: 'info' },
  { title: 'Service recovered', detail: 'Gateway eu-3 health check green after 42s', severity: 'ok' },
  { title: 'Security threat blocked', detail: 'Credential-stuffing wave throttled at edge-fra', severity: 'critical' },
  { title: 'Network optimization completed', detail: 'FRA ⇄ WAW p95 down 11ms after rebalance', severity: 'ok' },
];

/**
 * Ambient event simulator — one interval pushes a rotating premium toast.
 * Mounted once at the app root; cleaned up on unmount.
 */
export function useEventSimulation(active: boolean) {
  const pushToast = useAppStore((s) => s.pushToast);
  const idx = useRef(0);

  useEffect(() => {
    if (!active) return;
    // First toast lands quickly so the system feels alive, then every 22s.
    const first = window.setTimeout(() => {
      pushToast(ROTATION[0]);
      idx.current = 1;
    }, 6000);
    const id = window.setInterval(() => {
      pushToast(ROTATION[idx.current % ROTATION.length]);
      idx.current += 1;
    }, 22000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, [active, pushToast]);
}
