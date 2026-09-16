import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAppStore } from '../../stores/useAppStore';
import type { ChartDatum } from '../../lib/chart';

/** Theme-aware area chart used across telemetry surfaces. */
export default function TelemetryChart({
  id,
  data,
  color,
  unit,
  height = 180,
  showAxis = true,
}: {
  id: string;
  data: ChartDatum[];
  color: string;
  unit: string;
  height?: number;
  showAxis?: boolean;
}) {
  const motionEnabled = useAppStore((s) => s.motionEnabled);

  const range: [number, number] = useMemo(() => {
    const vals = data.map((d) => d.v);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const pad = (max - min || 1) * 0.15;
    return [Math.max(0, min - pad), max + pad];
  }, [data]);

  return (
    <div style={{ width: '100%', height }} role="img" aria-label={`${id} trend chart`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`g-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.42} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#1d2a44" strokeDasharray="3 6" vertical={false} />
          {showAxis && (
            <>
              <XAxis
                dataKey="t"
                tick={{ fill: '#67748e', fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: '#1d2a44' }}
                minTickGap={48}
              />
              <YAxis
                domain={range}
                tick={{ fill: '#67748e', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={44}
                tickFormatter={(v: number) => `${v}`}
              />
            </>
          )}
          <Tooltip
            contentStyle={{
              background: '#141d31',
              border: '1px solid #27375a',
              borderRadius: 10,
              fontSize: 12,
              color: '#eef4ff',
            }}
            labelStyle={{ color: '#a9b8d0' }}
            formatter={(value) => [`${value} ${unit}`, 'value']}
          />
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={2}
            fill={`url(#g-${id})`}
            isAnimationActive={motionEnabled}
            dot={false}
            activeDot={{ r: 3, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* toChartData lives in lib/chart.ts so this module only exports components. */