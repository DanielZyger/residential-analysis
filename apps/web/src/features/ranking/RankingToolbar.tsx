import type { PropertyFilters } from '@er/shared';
import { SelectField } from '../../components/SelectField';
import { formatNumber } from '../../utils/format';
import { FILTERS_PANEL_ID } from '../filters/FiltersPanel';
import { fromSortValue, SORT_OPTIONS, toSortValue } from './sortOptions';

interface RankingToolbarProps {
  filters: PropertyFilters;
  total: number | undefined;
  rangeStart: number;
  rangeEnd: number;
  activeFilters: number;
  onSortChange: (sort: Pick<PropertyFilters, 'sort' | 'dir'>) => void;
  onOpenFilters: () => void;
}

export function RankingToolbar({ filters, total, rangeStart, rangeEnd, activeFilters, onSortChange, onOpenFilters }: RankingToolbarProps) {
  return (
    <div className="ranking-toolbar">
      <div className="ranking-toolbar__count" aria-live="polite">
        {total == null ? (
          <span className="placeholder-glow">
            <span className="placeholder col-12 rounded" style={{ width: '10rem' }} />
          </span>
        ) : (
          <>
            <strong className="er-tabular">{formatNumber(total)}</strong> {total === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}
            {total > 0 && (
              <span className="text-body-secondary d-none d-sm-inline er-tabular">
                {' '}
                · exibindo {formatNumber(rangeStart)}–{formatNumber(rangeEnd)}
              </span>
            )}
          </>
        )}
      </div>
      <div className="ranking-toolbar__actions">
        <button
          type="button"
          className="btn btn-outline-primary btn-sm d-lg-none"
          onClick={onOpenFilters}
          aria-controls={FILTERS_PANEL_ID}
        >
          <i className="bi bi-sliders me-1" aria-hidden="true" />
          Filtros
          {activeFilters > 0 && <span className="badge text-bg-primary ms-1">{activeFilters}</span>}
        </button>
        <SelectField label="Ordenar por" value={toSortValue(filters.sort, filters.dir)} options={SORT_OPTIONS} onChange={(value) => onSortChange(fromSortValue(value))} size="sm" />
      </div>
    </div>
  );
}
