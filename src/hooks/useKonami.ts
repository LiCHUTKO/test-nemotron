import { useEffect } from 'react';

/**
 * Konami code listener (↑↑↓↓←→←→BA). Fires once per full entry.
 * Cleaned up on unmount; sequence buffer resets after 3s idle.
 */
export function useKonamiCode(onTrigger: () => void) {
  useEffect(() => {
    const SEQ = [
      'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
      'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
      'b', 'a',
    ];
    let pos = 0;
    let resetTimer = 0;

    const poke = () => {
      window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        pos = 0;
      }, 3000);
    };

    const onKey = (e: KeyboardEvent) => {
      // Ignore typing inside inputs so operators don't trigger it accidentally.
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      poke();
      if (key === SEQ[pos]) {
        pos += 1;
        if (pos === SEQ.length) {
          pos = 0;
          onTrigger();
        }
      } else {
        pos = key === SEQ[0] ? 1 : 0;
      }
    };

    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.clearTimeout(resetTimer);
    };
  }, [onTrigger]);
}
