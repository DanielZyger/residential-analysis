import { PROPERTY_TYPE_LABELS, TRANSACTION_LABELS, type RankedProperty } from '@er/shared';
import { ScoreBadge } from '../../components/ScoreBadge';
import { cx } from '../../utils/cx';
import { ScoreFactors } from '../../components/ScoreFactors';
import { formatNumber } from '../../utils/format';
import { getScoreBand } from '../../utils/score';

interface ScoreBreakdownCardProps {
  property: RankedProperty;
}

export function ScoreBreakdownCard({ property }: ScoreBreakdownCardProps) {
  const { score } = property;
  const band = getScoreBand(score.total);
  return (
    <section className="er-surface score-breakdown" aria-labelledby="score-title">
      <div className="score-breakdown__summary">
        <ScoreBadge value={score.total} size="lg" />
        <div>
          <h2 className="h5 mb-1" id="score-title">
            Nota de custo-benefício
          </h2>
          <p className="mb-0 small text-body-secondary">
            <strong className={cx('er-score', `er-score--${band.tone}`, 'score-breakdown__band')}>{band.label}</strong> ·{' '}
            {formatNumber(score.rank)}º de {formatNumber(score.peers)} em {PROPERTY_TYPE_LABELS[property.type].toLowerCase()} para{' '}
            {TRANSACTION_LABELS[property.transaction].toLowerCase()}
          </p>
        </div>
      </div>
      <p className="small text-body-secondary">
        Veja abaixo onde o imóvel ganhou ou perdeu pontos. Se um critério não importa para você, avalie o imóvel pelos demais.
      </p>
      <ScoreFactors factors={score.factors} />
    </section>
  );
}
