import { beforeEach, describe, expect, it } from 'vitest';
import { useAppStore } from './useAppStore';

beforeEach(() => {
  useAppStore.setState({
    section: 'overview',
    compactMode: false,
    motionEnabled: true,
    toasts: [],
    inspectorNodeId: null,
  });
});

describe('app store', () => {
  it('navigates between sections', () => {
    useAppStore.getState().setSection('incidents');
    expect(useAppStore.getState().section).toBe('incidents');
  });

  it('toggles interface modes', () => {
    useAppStore.getState().toggleCompact();
    expect(useAppStore.getState().compactMode).toBe(true);
    useAppStore.getState().toggleMotion();
    expect(useAppStore.getState().motionEnabled).toBe(false);
  });

  it('manages the inspector selection', () => {
    useAppStore.getState().setInspectorNodeId('auth');
    expect(useAppStore.getState().inspectorNodeId).toBe('auth');
    useAppStore.getState().setInspectorNodeId(null);
    expect(useAppStore.getState().inspectorNodeId).toBeNull();
  });

  it('caps the toast stack and dismisses by id', () => {
    const { pushToast, dismissToast } = useAppStore.getState();
    for (let i = 0; i < 10; i++) {
      useAppStore.getState().pushToast({ title: `t${i}`, severity: 'info' });
    }
    const toasts = useAppStore.getState().toasts;
    expect(toasts).toHaveLength(6);
    expect(toasts[0].title).toBe('t9');
    dismissToast(toasts[0].id);
    expect(useAppStore.getState().toasts).toHaveLength(5);
    expect(pushToast).toBeTypeOf('function');
  });
});
