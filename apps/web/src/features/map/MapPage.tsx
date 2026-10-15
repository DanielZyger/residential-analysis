import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { CITY_NAME } from '@er/shared';
import { getMap } from '../../api/client';
import { ErrorState } from '../../components/ErrorState';
import { PageHeader } from '../../components/PageHeader';
import { TransactionToggle } from '../../components/TransactionToggle';
import { useApi } from '../../hooks/useApi';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useFiltersFromUrl } from '../../hooks/useFiltersFromUrl';
import { useMeta } from '../../hooks/useMeta';
import { cx } from '../../utils/cx';
import { formatNumber } from '../../utils/format';
import { countActiveRefinements, filtersToParams, rankingHref } from '../../utils/query';
import { ActiveFilterChips } from '../filters/ActiveFilterChips';
import { FiltersPanel } from '../filters/FiltersPanel';
import { LeafletMap, type MapLayer } from './LeafletMap';
import { MapLegend } from './MapLegend';
import { quantileClasses } from './mapColors';
import './map.scss';

const LAYERS: { value: MapLayer; label: string; icon: string }[] = [
  { value: 'properties', label: 'Imóveis', icon: 'house' },
  { value: 'neighborhoods', label: 'm² por bairro', icon: 'bullseye' },
];

export default function MapPage() {
  const { filters, update, reset } = useFiltersFromUrl();
  const meta = useMeta();
  const navigate = useNavigate();
  const [layer, setLayer] = useState<MapLayer>('properties');
  const [showFilters, setShowFilters] = useState(false);
  const hideFilters = useCallback(() => setShowFilters(false), []);
  const queryKey = filtersToParams({ ...filters, page: undefined, sort: undefined, dir: undefined }).toString();
  const map = useApi((signal) => getMap(filters, signal), [queryKey], { keepPreviousData: true });
  useDocumentTitle('Mapa');

  const data = map.data;
  const classes = useMemo(
    () => quantileClasses((data?.neighborhoods ?? []).map((h) => h.medianPricePerM2).filter((v): v is number => v !== null)),
    [data?.neighborhoods],
  );
  const openProperty = useCallback((id: string) => navigate(`/imovel/${encodeURIComponent(id)}`), [navigate]);
  const openNeighborhood = useCallback(
    (slug: string) => navigate(rankingHref({ transaction: filters.transaction, neighborhoods: [slug] })),
    [navigate, filters.transaction],
  );

  return (
    <div className="map-page">
      <PageHeader
        eyebrow={`${CITY_NAME} · mapa`}
        title="Imóveis no mapa"
        subtitle="Veja onde estão os imóveis e como o preço do m² varia entre os bairros."
        actions={<TransactionToggle value={filters.transaction} onChange={(transaction) => update({ transaction })} size="lg" />}
      />
      <div className="row g-4">
        <div className="col-lg-3">
          <FiltersPanel filters={filters} meta={meta} onChange={update} onReset={reset} show={showFilters} onHide={hideFilters} total={data?.totalMatching} />
        </div>
        <section className="col-lg-9" aria-label="Mapa">
          <div className="map-toolbar">
            <div className="btn-group btn-group-sm" role="group" aria-label="Camada do mapa">
              {LAYERS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={cx('btn btn-outline-primary', layer === item.value && 'active')}
                  aria-pressed={layer === item.value}
                  onClick={() => setLayer(item.value)}
                >
                  <i className={`bi bi-${item.icon} me-1`} aria-hidden="true" />
                  {item.label}
                </button>
              ))}
            </div>
            <button type="button" className="btn btn-outline-primary btn-sm d-lg-none" onClick={() => setShowFilters(true)}>
              <i className="bi bi-sliders me-1" aria-hidden="true" />
              Filtros{countActiveRefinements(filters) > 0 && ` (${countActiveRefinements(filters)})`}
            </button>
            {data && layer === 'properties' && (
              <span className="map-toolbar__count small text-body-secondary">
                <strong>{formatNumber(data.points.length)}</strong> de {formatNumber(data.totalMatching)} imóveis com localização exata
              </span>
            )}
          </div>
          <ActiveFilterChips filters={filters} meta={meta} onChange={update} onReset={reset} />
          {map.error ? (
            <ErrorState error={map.error} onRetry={map.reload} />
          ) : (
            <div className={cx('map-frame', map.loading && 'er-is-refreshing')}>
              <LeafletMap
                center={data?.center ?? null}
                layer={layer}
                points={data?.points ?? []}
                neighborhoods={data?.neighborhoods ?? []}
                classes={classes}
                onOpenProperty={openProperty}
                onOpenNeighborhood={openNeighborhood}
              />
              <MapLegend layer={layer} classes={classes} />
            </div>
          )}
          {layer === 'properties' && (
            <p className="small text-body-secondary mt-2 mb-0">
              Só aparecem imóveis cuja imobiliária informa a localização exata. Os demais continuam no ranking e entram no m² por bairro.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
