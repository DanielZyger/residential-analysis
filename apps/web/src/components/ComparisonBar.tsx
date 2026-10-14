import { BarTrack, type BarTone } from './BarTrack';

interface ComparisonBarProps {
  label: string;
  value: number | null;
  max: number;
  formatted: string;
  tone?: BarTone;
  marker?: { value: number; label: string } | null;
}

export function ComparisonBar({ label, value, max, formatted, tone = 'primary', marker }: ComparisonBarProps) {
  return (
    <div className="comparison-bar">
      <div className="comparison-bar__head">
        <span className="er-truncate">{label}</span>
        <strong className="er-tabular">{formatted}</strong>
      </div>
      <BarTrack value={value} max={max} tone={tone} marker={marker} label={`${label}: ${formatted}${marker ? `. ${marker.label}` : ''}`} />
    </div>
  );
}
