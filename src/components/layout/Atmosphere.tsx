import { useEffect, useRef } from 'react';
import { useAppStore } from '../../stores/useAppStore';

/**
 * Ambient technical background: gradient illumination, blueprint grid,
 * scanline sweep and a lightweight drifting particle field.
 * Fully disabled (static) when motion is off or reduced-motion is requested.
 */
export default function Atmosphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const motionEnabled = useAppStore((s) => s.motionEnabled);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    const DPR = Math.min(2, window.devicePixelRatio || 1);

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * DPR);
      canvas.height = Math.floor(h * DPR);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    interface P {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      a: number;
    }
    const rand = (lo: number, hi: number) => lo + Math.random() * (hi - lo);
    const seed = (): P => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: rand(-0.12, 0.12),
      vy: rand(-0.09, 0.09),
      r: rand(0.6, 1.8),
      a: rand(0.12, 0.5),
    });
    const count = Math.min(90, Math.floor((w * h) / 22000));
    let parts: P[] = Array.from({ length: count }, seed);

    const drawStatic = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(86, 200, 255, ${p.a * 0.6})`;
        ctx.fill();
      }
    };

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -4) p.x = w + 4;
        if (p.x > w + 4) p.x = -4;
        if (p.y < -4) p.y = h + 4;
        if (p.y > h + 4) p.y = -4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(86, 200, 255, ${p.a})`;
        ctx.fill();
      }
      raf = window.requestAnimationFrame(tick);
    };

    if (motionEnabled) {
      tick();
    } else {
      parts = Array.from({ length: count }, seed);
      drawStatic();
    }

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [motionEnabled]);

  return (
    <div className="atmosphere" aria-hidden="true">
      <div className="atm-glow atm-glow-a" />
      <div className="atm-glow atm-glow-b" />
      <div className="atm-grid" />
      <div className={`atm-scan${motionEnabled ? '' : ' is-paused'}`} />
      <canvas ref={canvasRef} className="atm-canvas" />
      <div className="atm-noise" />
    </div>
  );
}
