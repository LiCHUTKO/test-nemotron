import { create } from 'zustand';
import type { Environment, SectionId } from '../types';
import { nextId } from '../lib/format';

export type ToastSeverity = 'info' | 'ok' | 'warn' | 'critical';

export interface Toast {
  id: string;
  title: string;
  detail?: string;
  severity: ToastSeverity;
  at: number;
}

interface AppState {
  section: SectionId;
  environment: Environment;
  compactMode: boolean;
  motionEnabled: boolean;
  paletteOpen: boolean;
  inspectorNodeId: string | null;
  mobileNavOpen: boolean;
  bootComplete: boolean;
  toasts: Toast[];
  setSection: (s: SectionId) => void;
  setEnvironment: (e: Environment) => void;
  toggleCompact: () => void;
  toggleMotion: () => void;
  setPaletteOpen: (open: boolean) => void;
  setInspectorNodeId: (id: string | null) => void;
  setMobileNavOpen: (open: boolean) => void;
  setBootComplete: (done: boolean) => void;
  pushToast: (t: Omit<Toast, 'id' | 'at'>) => void;
  dismissToast: (id: string) => void;
  clearToasts: () => void;
}

function initialMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return true;
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export const useAppStore = create<AppState>()((set) => ({
  section: 'overview',
  environment: 'production',
  compactMode: false,
  motionEnabled: initialMotion(),
  paletteOpen: false,
  inspectorNodeId: null,
  mobileNavOpen: false,
  bootComplete: false,
  toasts: [],
  setSection: (section) => set({ section, mobileNavOpen: false }),
  setEnvironment: (environment) => set({ environment }),
  toggleCompact: () => set((s) => ({ compactMode: !s.compactMode })),
  toggleMotion: () => set((s) => ({ motionEnabled: !s.motionEnabled })),
  setPaletteOpen: (paletteOpen) => set({ paletteOpen }),
  setInspectorNodeId: (inspectorNodeId) => set({ inspectorNodeId }),
  setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
  setBootComplete: (bootComplete) => set({ bootComplete }),
  pushToast: (t) =>
    set((s) => ({
      toasts: [{ ...t, id: nextId('toast'), at: Date.now() }, ...s.toasts].slice(0, 6),
    })),
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  clearToasts: () => set({ toasts: [] }),
}));
