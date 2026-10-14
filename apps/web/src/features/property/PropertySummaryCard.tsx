import { PROPERTY_TYPE_LABELS, TRANSACTION_LABELS, type RankedProperty } from '@er/shared';
import { MedianDelta } from '../../components/MedianDelta';
import { PriceBreakdown } from '../../components/PriceBreakdown';
import { PropertyStats } from '../../components/PropertyStats';
import { SourceAttribution } from '../../components/SourceAttribution';
import { formatPricePerM2 } from '../../utils/format';

interface PropertySummaryCardProps {
  property: RankedProperty;
}

export function PropertySummaryCard({ property }: PropertySummaryCardProps) {
  return (
    <section className="er-surface property-summary" aria-label="Resumo do imóvel">
      <div className="er-eyebrow mb-1">
        {PROPERTY_TYPE_LABELS[property.type]} · {TRANSACTION_LABELS[property.transaction]}
      </div>
      <PriceBreakdown property={property} size="lg" />
      {property.pricePerM2 != null && (
        <div className="property-summary__m2">
          <span className="er-tabular fw-semibold">{formatPricePerM2(property.pricePerM2)}</span>
          <MedianDelta property={property} />
        </div>
      )}
      <PropertyStats property={property} showBathrooms />
      <a href={property.url} target="_blank" rel="noopener noreferrer nofollow" className="btn btn-primary w-100">
        <i className="bi bi-box-arrow-up-right me-2" aria-hidden="true" />
        Ver anúncio original em {property.sourceName}
      </a>
      <SourceAttribution sourceName={property.sourceName} url={property.url} collectedAt={property.collectedAt} />
    </section>
  );
}
