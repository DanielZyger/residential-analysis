import type { RankedProperty } from '@er/shared';
import { ComparisonBar } from '../../components/ComparisonBar';
import { MedianDelta } from '../../components/MedianDelta';
import { formatNumber, formatPricePerM2 } from '../../utils/format';

interface MarketComparisonCardProps {
  property: RankedProperty;
}

export function MarketComparisonCard({ property }: MarketComparisonCardProps) {
  const { neighborhoodMedianM2, cityMedianM2, neighborhoodSamples } = property.score.reference;
  const rows = [
    { label: 'Este imóvel', value: property.pricePerM2, tone: 'primary' as const },
    { label: `Mediana ${property.neighborhood ? `de ${property.neighborhood}` : 'do bairro'}`, value: neighborhoodMedianM2, tone: 'accent' as const },
    { label: 'Mediana da cidade', value: cityMedianM2, tone: 'muted' as const },
  ];
  const max = Math.max(...rows.map((row) => row.value ?? 0)) * 1.1;
  return (
    <section className="er-surface" aria-labelledby="market-title">
      <h2 className="h5 mb-1" id="market-title">
        Preço do m² comparado
      </h2>
      <div className="mb-3">
        <MedianDelta property={property} />
      </div>
      {max > 0 ? (
        rows.map((row) => <ComparisonBar key={row.label} label={row.label} value={row.value} max={max} formatted={formatPricePerM2(row.value)} tone={row.tone} />)
      ) : (
        <p className="text-body-secondary mb-0">Sem dados suficientes para comparação.</p>
      )}
      <p className="small text-body-secondary mt-3 mb-0">
        {neighborhoodSamples > 0
          ? `Mediana do bairro calculada com ${formatNumber(neighborhoodSamples)} ${neighborhoodSamples === 1 ? 'anúncio' : 'anúncios'} do mesmo tipo e negócio.`
          : 'Bairro sem amostras suficientes; a comparação usa a mediana da cidade.'}
      </p>
    </section>
  );
}
