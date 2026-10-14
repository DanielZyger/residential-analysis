import { useEffect, useMemo } from 'react';
import { COUNT_FILTERS, PROPERTY_TYPE_LABELS, type PropertyFilters, type PropertyType } from '@er/shared';
import { CheckList, type CheckOption } from '../../components/CheckList';
import { CountToggleGroup } from '../../components/CountToggleGroup';
import { RangeField } from '../../components/RangeField';
import { TransactionToggle } from '../../components/TransactionToggle';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import type { FiltersPatch } from '../../hooks/useFiltersFromUrl';
import type { MetaState } from '../../hooks/useMeta';
import { cx } from '../../utils/cx';
import { formatCurrency, formatNumber } from '../../utils/format';
import { countActiveRefinements } from '../../utils/query';
import { FilterSection } from './FilterSection';
import { TextSearchFilter } from './TextSearchFilter';
import './filters.scss';

interface FiltersPanelProps {
  filters: PropertyFilters;
  meta: MetaState;
  onChange: (patch: FiltersPatch) => void;
  onReset: () => void;
  show: boolean;
  onHide: () => void;
  total?: number;
}

const TYPE_OPTIONS: CheckOption[] = (Object.keys(PROPERTY_TYPE_LABELS) as PropertyType[]).map((type) => ({
  value: type,
  label: PROPERTY_TYPE_LABELS[type],
}));

const PANEL_ID = 'filters-panel';
const TITLE_ID = 'filters-panel-title';

export function FiltersPanel({ filters, meta, onChange, onReset, show, onHide, total }: FiltersPanelProps) {
  useBodyScrollLock(show);

  useEffect(() => {
    if (!show) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onHide();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [show, onHide]);

  const neighborhoodOptions = useMemo<CheckOption[]>(
    () => meta.data?.neighborhoods.map((item) => ({ value: item.slug, label: item.name, count: item.count })) ?? [],
    [meta.data],
  );
  const sourceOptions = useMemo<CheckOption[]>(
    () => meta.data?.sources.map((item) => ({ value: item.id, label: item.name, count: item.count })) ?? [],
    [meta.data],
  );
  const range = meta.data?.ranges[filters.transaction];
  const activeCount = countActiveRefinements(filters);

  return (
    <>
      <aside
        id={PANEL_ID}
        className={cx('offcanvas-lg', 'offcanvas-start', 'filters-panel', show && 'show')}
        tabIndex={-1}
        aria-labelledby={TITLE_ID}
        role={show ? 'dialog' : undefined}
        aria-modal={show || undefined}
      >
        <div className="offcanvas-header border-bottom">
          <h2 className="offcanvas-title h5" id={TITLE_ID}>
            Filtros
          </h2>
          <button type="button" className="btn-close" onClick={onHide} aria-label="Fechar filtros" />
        </div>
        <div className="offcanvas-body filters-panel__body">
          <div className="filters-panel__heading d-none d-lg-flex">
            <h2 className="h6 mb-0">
              <i className="bi bi-sliders me-2" aria-hidden="true" />
              Filtros
            </h2>
            {activeCount > 0 && (
              <button type="button" className="btn btn-link btn-sm p-0" onClick={onReset}>
                Limpar ({activeCount})
              </button>
            )}
          </div>

          <FilterSection>
            <TransactionToggle value={filters.transaction} onChange={(transaction) => onChange({ transaction })} size="sm" fullWidth />
          </FilterSection>

          <FilterSection>
            <TextSearchFilter value={filters.q} onChange={(q) => onChange({ q })} />
          </FilterSection>

          <FilterSection>
            <CheckList label="Tipo de imóvel" options={TYPE_OPTIONS} selected={filters.types ?? []} onChange={(types) => onChange({ types: types as PropertyType[] })} />
          </FilterSection>

          {COUNT_FILTERS.map((config) => (
            <FilterSection key={config.key}>
              <CountToggleGroup config={config} value={filters[config.key]} onChange={(value) => onChange({ [config.key]: value })} />
            </FilterSection>
          ))}

          <FilterSection>
            <RangeField
              label={filters.transaction === 'rent' ? 'Aluguel mensal' : 'Preço'}
              prefix="R$"
              step={filters.transaction === 'rent' ? 100 : 10000}
              min={filters.minPrice}
              max={filters.maxPrice}
              minPlaceholder={range ? formatCurrency(range.minPrice, true).replace('R$', '').trim() : 'Mín.'}
              maxPlaceholder={range ? formatCurrency(range.maxPrice, true).replace('R$', '').trim() : 'Máx.'}
              onChange={({ min, max }) => onChange({ minPrice: min, maxPrice: max })}
            />
          </FilterSection>

          <FilterSection>
            <RangeField
              label="Área"
              suffix="m²"
              min={filters.minArea}
              max={filters.maxArea}
              minPlaceholder={range ? formatNumber(range.minArea) : 'Mín.'}
              maxPlaceholder={range ? formatNumber(range.maxArea) : 'Máx.'}
              onChange={({ min, max }) => onChange({ minArea: min, maxArea: max })}
            />
          </FilterSection>

          <FilterSection>
            <CheckList
              label="Bairros"
              options={neighborhoodOptions}
              selected={filters.neighborhoods ?? []}
              onChange={(neighborhoods) => onChange({ neighborhoods })}
              searchable
              searchPlaceholder="Buscar bairro…"
            />
          </FilterSection>

          <FilterSection>
            <CheckList label="Imobiliárias" options={sourceOptions} selected={filters.sources ?? []} onChange={(sources) => onChange({ sources })} />
          </FilterSection>

          <button type="button" className="btn btn-outline-secondary btn-sm w-100 d-none d-lg-block" onClick={onReset} disabled={activeCount === 0}>
            <i className="bi bi-x-circle me-1" aria-hidden="true" />
            Limpar filtros
          </button>
        </div>
        <div className="filters-panel__footer d-lg-none">
          <button type="button" className="btn btn-outline-secondary" onClick={onReset} disabled={activeCount === 0}>
            Limpar
          </button>
          <button type="button" className="btn btn-primary flex-grow-1" onClick={onHide}>
            {total != null ? `Ver ${formatNumber(total)} ${total === 1 ? 'imóvel' : 'imóveis'}` : 'Ver resultados'}
          </button>
        </div>
      </aside>
      {show && <div className="offcanvas-backdrop fade show d-lg-none" onClick={onHide} aria-hidden="true" />}
    </>
  );
}

export const FILTERS_PANEL_ID = PANEL_ID;
