import type { RankedProperty } from '@er/shared';
import { cx } from '../utils/cx';
import { formatPercent, formatPricePerM2 } from '../utils/format';
import { compareWithMedian } from '../utils/score';

interface MedianDeltaProps {
  property: Pick<RankedProperty, 'pricePerM2' | 'score'>;
  className?: string;
}

const NEUTRAL_THRESHOLD = 1;

export function MedianDelta({ property, className }: MedianDeltaProps) {
  const comparison = compareWithMedian(property);
  if (!comparison) return null;
  const { percent, reference, median } = comparison;
  const scope = reference === 'neighborhood' ? 'do bairro' : 'da cidade';
  const magnitude = Math.abs(percent);
  const tone = magnitude < NEUTRAL_THRESHOLD ? 'neutral' : percent < 0 ? 'below' : 'above';
  const icon = tone === 'neutral' ? 'dash' : tone === 'below' ? 'arrow-down' : 'arrow-up';
  const text =
    tone === 'neutral'
      ? `Na mediana ${scope}`
      : `${formatPercent(magnitude)} ${tone === 'below' ? 'abaixo' : 'acima'} da mediana ${scope}`;
  return (
    <span className={cx('median-delta', `median-delta--${tone}`, className)} title={`Mediana ${scope}: ${formatPricePerM2(median)}`}>
      <i className={`bi bi-${icon}`} aria-hidden="true" />
      {text}
    </span>
  );
}
