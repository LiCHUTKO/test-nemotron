import { useState } from 'react';
import TelemetryChart from '../../components/visualization/TelemetryChart';
import { toChartData } from '../../lib/chart';
import { Panel, SectionHeader, Segmented, TrendChip } from '../../components/ui/primitives';
import { useLiveSeries } from '../../hooks/useLiveSeries';
import { METRICS, RANGE_POINTS, deltaPctOf, type TelemetryRange, TELEMETRY_RANGES } from '../../lib/simulation';
import { useAppStore } from '../../stores/useAppStore';

function MetricPanel({ metricKey, range }: { metricKey: string; range: TelemetryRange }) {
  const def = METRICS.find((m) => m.key === metricKey);
  const motionEnabled = useAppStore((s) => s.motionEnabled);
  const series = useLiveSeries(def!.seed, range, def!.cfg, 2500, true);
  const current = series[series.length - 1];
  const delta = deltaPctOf(series);

  return (
    <Panel
      title={def!.label}
      subtitle={`Window ${range} · ${RANGE_POINTS[range]} samples`}
      action={<TrendChip deltaPct={delta} invert={def!.invertTrend} />}
    >
      <p className="metric-now mono">
        {current.toLocaleString('en-US')} <span>{def!.unit}</span>
      </p>
      <TelemetryChart
        id={`tele-${def!.key}`}
        data={toChartData(series, range)}
        color={def!.color}
        unit={def!.unit}
        height={170}
      />
      <span className="sr-only">{`Live updates ${motionEnabled ? 'enabled' : 'paused'}`}</span>
    </Panel>
  );
}

export default function Telemetry() {
  const [range, setRange] = useState<TelemetryRange>('1H');

  return (
    <div className="telemetry">
      <SectionHeader
        eyebrow="AETHER // GLOBAL TELEMETRY"
        title="Signals & Saturation"
        description="Seven golden signals streaming from every plane. Ranges regenerate deterministically; live ticks arrive every 2.5s."
        right={<Segmented options={TELEMETRY_RANGES} value={range} onChange={setRange} label="Time range" />}
      />
      <div className="grid-2">
        {METRICS.map((m) => (
          <MetricPanel key={m.key} metricKey={m.key} range={range} />
        ))}
      </div>
    </div>
  );
}
