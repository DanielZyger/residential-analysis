import type { PropertyFilters } from '@er/shared';
import type { FiltersPatch } from '../../hooks/useFiltersFromUrl';
import type { MetaState } from '../../hooks/useMeta';
import { buildActiveFilterChips } from './activeFilters';
import './filters.scss';

interface ActiveFilterChipsProps {
  filters: PropertyFilters;
  meta: MetaState;
  onChange: (patch: FiltersPatch) => void;
  onReset: () => void;
}

export function ActiveFilterChips({ filters, meta, onChange, onReset }: ActiveFilterChipsProps) {
  const chips = buildActiveFilterChips(filters, meta);
  if (chips.length === 0) return null;
  return (
    <div className="filter-chips" aria-label="Filtros ativos">
      <ul className="filter-chips__list">
        {chips.map((chip) => (
          <li key={chip.key}>
            <button type="button" className="filter-chip" onClick={() => onChange(chip.remove)} aria-label={`Remover filtro ${chip.label}`}>
              <span>{chip.label}</span>
              <i className="bi bi-x" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
      {chips.length > 1 && (
        <button type="button" className="btn btn-link btn-sm px-1" onClick={onReset}>
          Limpar tudo
        </button>
      )}
    </div>
  );
}
