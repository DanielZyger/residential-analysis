import { cx } from '../utils/cx';
import { clampPercent } from '../utils/score';

export type BarTone = 'primary' | 'muted' | 'accent' | 'warning';

interface BarTrackProps {
  value: number | null;
  max: number;
  tone?: BarTone;
  marker?: { value: number; label: string } | null;
  label?: string;
  size?: 'sm' | 'md';
}

function toPercent(value: number | null | undefined, max: number): number | null {
  return value != null && max > 0 ? clampPercent((value / max) * 100) : null;
}

export function BarTrack({ value, max, tone = 'primary', marker, label, size = 'md' }: BarTrackProps) {
  const width = toPercent(value, max) ?? 0;
  const markerLeft = toPercent(marker?.value, max);
  return (
    <div className={cx('bar-track', `bar-track--${size}`)} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <div className={cx('bar-track__fill', `bar-track__fill--${tone}`)} style={{ width: `${width}%` }} />
      {markerLeft != null && <span className="bar-track__marker" style={{ left: `${markerLeft}%` }} title={marker?.label} />}
    </div>
  );
}
