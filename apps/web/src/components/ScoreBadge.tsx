import { cx } from '../utils/cx';
import { getScoreBand } from '../utils/score';

interface ScoreBadgeProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ScoreBadge({ value, size = 'md', className }: ScoreBadgeProps) {
  const rounded = Math.round(value);
  const band = getScoreBand(rounded);
  return (
    <span
      className={cx('score-badge', `score-badge--${size}`, 'er-score', `er-score--${band.tone}`, className)}
      role="img"
      aria-label={`Nota ${rounded} de 100 (${band.label})`}
      title={`Nota ${rounded}/100 · ${band.label}`}
    >
      <span className="score-badge__value" aria-hidden="true">
        {rounded}
      </span>
      {size !== 'sm' && (
        <span className="score-badge__max" aria-hidden="true">
          /100
        </span>
      )}
    </span>
  );
}
