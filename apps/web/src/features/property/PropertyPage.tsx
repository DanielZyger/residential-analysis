import { Link, useParams } from 'react-router-dom';
import { getProperty } from '../../api/client';
import { DataNotice } from '../../components/DataNotice';
import { ErrorState } from '../../components/ErrorState';
import { useApi } from '../../hooks/useApi';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { rankingHref } from '../../utils/query';
import { PropertyList } from '../ranking/PropertyList';
import { AlsoListedAt } from './AlsoListedAt';
import { MarketComparisonCard } from './MarketComparisonCard';
import { PhotoGallery } from './PhotoGallery';
import { PropertyFacts } from './PropertyFacts';
import { PropertyPageSkeleton } from './PropertyPageSkeleton';
import { PropertySummaryCard } from './PropertySummaryCard';
import { ScoreBreakdownCard } from './ScoreBreakdownCard';
import './property.scss';

export default function PropertyPage() {
  const { id = '' } = useParams();
  const detail = useApi((signal) => getProperty(id, signal), [id]);
  const property = detail.data?.property;
  useDocumentTitle(property?.title ?? 'Imóvel');

  if (detail.error) {
    return (
      <ErrorState
        error={detail.error}
        title="Não foi possível carregar este imóvel"
        onRetry={detail.reload}
      />
    );
  }
  if (!property) return <PropertyPageSkeleton />;

  const similar = detail.data?.similar ?? [];

  return (
    <article className="property-page">
      <nav aria-label="Trilha de navegação">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item">
            <Link to={rankingHref({ transaction: property.transaction })}>Ranking</Link>
          </li>
          {property.neighborhoodSlug && property.neighborhood && (
            <li className="breadcrumb-item">
              <Link to={rankingHref({ transaction: property.transaction, neighborhoods: [property.neighborhoodSlug] })}>{property.neighborhood}</Link>
            </li>
          )}
          <li className="breadcrumb-item active er-truncate" aria-current="page">
            {property.title}
          </li>
        </ol>
      </nav>

      <h1 className="property-page__title">{property.title}</h1>
      <p className="property-page__location">
        <i className="bi bi-geo-alt me-1" aria-hidden="true" />
        {[property.address, property.neighborhood, 'Chapecó-SC'].filter(Boolean).join(' · ')}
      </p>

      <div className="property-page__layout">
        <div className="property-page__gallery">
          <PhotoGallery photos={property.photos} title={property.title} />
        </div>
        <div className="property-page__main">
          {property.description && (
            <section className="er-surface" aria-labelledby="description-title">
              <h2 className="h5 mb-3" id="description-title">
                Descrição
              </h2>
              <p className="property-page__description">{property.description}</p>
              <p className="small text-body-secondary mb-0">Texto reproduzido do anúncio original de {property.sourceName}.</p>
            </section>
          )}
          <PropertyFacts property={property} />
        </div>
        <aside className="property-page__aside">
          <PropertySummaryCard property={property} />
          <ScoreBreakdownCard property={property} />
          <MarketComparisonCard property={property} />
          <AlsoListedAt listings={property.alsoListedAt} />
          <DataNotice collectedAt={property.collectedAt} />
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="property-page__similar" aria-labelledby="similar-title">
          <h2 className="h4 mb-3" id="similar-title">
            Imóveis similares
          </h2>
          <PropertyList items={similar} layout="grid" />
        </section>
      )}
    </article>
  );
}
