import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { PropertyFilters } from '@er/shared';
import { DEFAULT_FILTERS, filtersToParams, parseFilters } from '../utils/query';

export type FiltersPatch = Partial<PropertyFilters>;

export interface FiltersController {
  filters: PropertyFilters;
  update: (patch: FiltersPatch) => void;
  setPage: (page: number) => void;
  reset: () => void;
}

export function useFiltersFromUrl(): FiltersController {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);

  const update = useCallback(
    (patch: FiltersPatch) => {
      setSearchParams((previous) => filtersToParams({ ...parseFilters(previous), ...patch, page: 1 }, true), {
        replace: true,
      });
    },
    [setSearchParams],
  );

  const setPage = useCallback(
    (page: number) => {
      setSearchParams((previous) => filtersToParams({ ...parseFilters(previous), page }, true));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [setSearchParams],
  );

  const reset = useCallback(() => {
    setSearchParams(
      (previous) => {
        const current = parseFilters(previous);
        return filtersToParams(
          { ...DEFAULT_FILTERS, transaction: current.transaction, sort: current.sort, dir: current.dir },
          true,
        );
      },
      { replace: true },
    );
  }, [setSearchParams]);

  return { filters, update, setPage, reset };
}
