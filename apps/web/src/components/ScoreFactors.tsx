import type { ScoreFactor } from '@er/shared';
import { cx } from '../utils/cx';
import { formatPercent } from '../utils/format';
import { clampPercent, FACTOR_SHORT_LABELS, getScoreBand, toPercentWeight } from '../utils/score';

interface ScoreFactorsProps {
  factors: ScoreFactor[];
  variant?: 'compact' | 'detailed';
  className?: string;
}

function FactorBar({ factor, label }: { factor: ScoreFactor; label: string }) {
  const value = Math.round(clampPercent(factor.value));
  return (
    <div
      className="progress score-factors__bar"
      role="progressbar"
      aria-label={`${label}: ${value} de 100`}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="progress-bar" style={{ width: `${value}%` }} />
    </div>
  );
}

export function ScoreFactors({ factors, variant = 'detailed', className }: ScoreFactorsProps) {
  const compact = variant === 'compact';
  return (
    <ul className={cx('score-factors', `score-factors--${variant}`, className)} aria-label="Critérios da nota">
      {factors.map((factor) => {
        const value = Math.round(clampPercent(factor.value));
        const label = compact ? FACTOR_SHORT_LABELS[factor.key] : factor.label;
        return (
          <li key={factor.key} className={cx('score-factors__item', 'er-score', `er-score--${getScoreBand(value).tone}`)} title={compact ? `${factor.label}: ${factor.detail}` : undefined}>
            <div className="score-factors__head">
              <span className="score-factors__label">{label}</span>
              <span className="score-factors__value er-tabular">
                {!compact && <span className="text-body-secondary">peso {formatPercent(toPercentWeight(factor.weight))} · </span>}
                <strong>{value}</strong>
                {!compact && <span className="text-body-secondary">/100</span>}
              </span>
            </div>
            <FactorBar factor={factor} label={factor.label} />
            {!compact && factor.detail && <p className="score-factors__detail">{factor.detail}</p>}
          </li>
        );
      })}
    </ul>
  );
}
