import { memo } from 'react';
import { Link } from 'react-router-dom';
import { PROPERTY_TYPE_LABELS, type RankedProperty } from '@er/shared';
import { ImageWithFallback } from '../../components/ImageWithFallback';
import { MedianDelta } from '../../components/MedianDelta';
import { PriceBreakdown } from '../../components/PriceBreakdown';
import { PropertyStats } from '../../components/PropertyStats';
import { ScoreBadge } from '../../components/ScoreBadge';
import { ScoreFactors } from '../../components/ScoreFactors';
import { SourceAttribution } from '../../components/SourceAttribution';
import { cx } from '../../utils/cx';
import { formatPricePerM2 } from '../../utils/format';
import './ranking.scss';

interface PropertyCardProps {
  property: RankedProperty;
  position?: number;
  layout?: 'list' | 'grid';
}

function PropertyCardComponent({ property, position, layout = 'list' }: PropertyCardProps) {
  const location = [property.neighborhood, property.address].filter(Boolean).join(' · ') || 'Bairro não informado';
  const titleId = `property-${property.id}-title`;
  return (
    <article className={cx('property-card', `property-card--${layout}`, 'er-hover-lift')} aria-labelledby={titleId}>
      <div className="property-card__media er-media">
        <ImageWithFallback src={property.photos[0]} alt={property.title} />
        {position != null && (
          <span className="property-card__position" aria-label={`Posição ${position} no ranking`}>
            #{position}
          </span>
        )}
        {property.photos.length > 1 && (
          <span className="property-card__photos" aria-label={`${property.photos.length} fotos`}>
            <i className="bi bi-images me-1" aria-hidden="true" />
            {property.photos.length}
          </span>
        )}
      </div>
      <div className="property-card__body">
        <div className="property-card__header">
          <div className="min-w-0">
            <div className="er-eyebrow">{PROPERTY_TYPE_LABELS[property.type]}</div>
            <h3 className="property-card__title er-truncate-2" id={titleId}>
              <Link to={`/imovel/${encodeURIComponent(property.id)}`} className="stretched-link">
                {property.title}
              </Link>
            </h3>
            <p className="property-card__location er-truncate">
              <i className="bi bi-geo-alt me-1" aria-hidden="true" />
              {location}
            </p>
          </div>
          <ScoreBadge value={property.score.total} size={layout === 'grid' ? 'sm' : 'md'} />
        </div>
        <div className="property-card__pricing">
          <PriceBreakdown property={property} />
          <div className="property-card__m2">
            <span className="er-tabular">{formatPricePerM2(property.pricePerM2)}</span>
            <MedianDelta property={property} />
          </div>
        </div>
        <PropertyStats property={property} />
        <ScoreFactors factors={property.score.factors} variant="compact" className="property-card__factors" />
        <SourceAttribution className="property-card__source" sourceName={property.sourceName} url={property.url} collectedAt={property.collectedAt} />
      </div>
    </article>
  );
}

export const PropertyCard = memo(PropertyCardComponent);
