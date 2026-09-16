import type { ReactNode } from 'react';
import type { HealthState } from '../../types';

/* ---------- Panel ---------- */

export function Panel({
  title,
  subtitle,
  action,
  children,
  className = '',
  pad = true,
}: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  pad?: boolean;
}) {
  return (
    <section className={`panel ${className}`.trim()} aria-label={title}>
      {(title ?? action) && (
        <header className="panel-head">
          <div>
            {title && <h3 className="panel-title">{title}</h3>}
            {subtitle && <p className="panel-sub">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={pad ? 'panel-body' : 'panel-body flush'}>{children}</div>
    </section>
  );
}

/* ---------- Section header ---------- */

export function SectionHeader({
  eyebrow,
  title,
  description,
  right,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  right?: ReactNode;
}) {
  return (
    <div className="section-head">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="section-title">{title}</h2>
        {description && <p className="section-desc">{description}</p>}
      </div>
      {right && <div className="section-head-right">{right}</div>}
    </div>
  );
}

/* ---------- Health dot + badge ---------- */

const HEALTH_CLASS: Record<HealthState, string> = {
  healthy: 'ok',
  warning: 'warn',
  critical: 'crit',
  maintenance: 'maint',
};

export function HealthDot({ health, pulse = false }: { health: HealthState; pulse?: boolean }) {
  return (
    <span
      className={`dot dot-${HEALTH_CLASS[health]}${pulse ? ' dot-pulse' : ''}`}
      aria-label={`status ${health}`}
      role="img"
    />
  );
}

export function StatusBadge({
  tone,
  children,
}: {
  tone: 'ok' | 'warn' | 'crit' | 'info' | 'muted' | 'violet';
  children: ReactNode;
}) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

/* ---------- Meter ---------- */

export function Meter({
  value,
  max = 100,
  tone,
  label,
}: {
  value: number;
  max?: number;
  tone?: 'ok' | 'warn' | 'crit';
  label?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const auto: 'ok' | 'warn' | 'crit' = pct >= 90 ? 'crit' : pct >= 70 ? 'warn' : 'ok';
  return (
    <div className="meter" role="meter" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={label ?? 'utilization'}>
      <div className={`meter-fill meter-${tone ?? auto}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

/* ---------- Sparkline ---------- */

export function Sparkline({
  data,
  width = 120,
  height = 32,
  stroke = 'var(--accent)',
  id,
}: {
  data: number[];
  width?: number;
  height?: number;
  stroke?: string;
  id: string;
}) {
  if (data.length < 2) return <span className="spark-empty" />;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * (width - 4) + 2;
      const y = height - 3 - ((v - min) / span) * (height - 8);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  const gradId = `spark-${id}`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" className="spark">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.45" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`2,${height - 1} ${pts} ${width - 2},${height - 1}`} fill={`url(#${gradId})`} />
      <polyline points={pts} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

/* ---------- Trend chip ---------- */

export function TrendChip({ deltaPct, invert = false }: { deltaPct: number; invert?: boolean }) {
  const good = invert ? deltaPct < 0 : deltaPct >= 0;
  const arrow = deltaPct >= 0 ? '▲' : '▼';
  return (
    <span className={`trend trend-${good ? 'up' : 'down'}`}>
      {arrow} {Math.abs(deltaPct).toFixed(1)}%
    </span>
  );
}

/* ---------- Empty state ---------- */

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="empty">
      <p className="empty-title">{title}</p>
      {hint && <p className="empty-hint">{hint}</p>}
    </div>
  );
}

/* ---------- Segmented control ---------- */

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div className="segmented" role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          className={`segmented-btn${o === value ? ' is-active' : ''}`}
          onClick={() => onChange(o)}
          aria-pressed={o === value}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
