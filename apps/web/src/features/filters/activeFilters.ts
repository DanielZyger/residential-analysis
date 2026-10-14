import { COUNT_FILTERS, countOptionLabel, PROPERTY_TYPE_LABELS, type PropertyFilters } from '@er/shared';
import type { FiltersPatch } from '../../hooks/useFiltersFromUrl';
import { formatArea, formatCurrency } from '../../utils/format';

export interface ActiveFilterChip {
  key: string;
  label: string;
  remove: FiltersPatch;
}

interface ChipLookups {
  neighborhoodNames: Map<string, string>;
  sourceNames: Map<string, string>;
}

function rangeLabel(min: number | undefined, max: number | undefined, format: (value: number) => string): string | null {
  if (min == null && max == null) return null;
  if (min != null && max != null) return `${format(min)} – ${format(max)}`;
  return min != null ? `a partir de ${format(min)}` : `até ${format(max as number)}`;
}

function listChips(key: 'types' | 'neighborhoods' | 'sources', values: string[] | undefined, label: (value: string) => string): ActiveFilterChip[] {
  return (values ?? []).map((value) => ({
    key: `${key}:${value}`,
    label: label(value),
    remove: { [key]: values?.filter((item) => item !== value) },
  }));
}

export function buildActiveFilterChips(filters: PropertyFilters, { neighborhoodNames, sourceNames }: ChipLookups): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = [];
  if (filters.q) chips.push({ key: 'q', label: `“${filters.q}”`, remove: { q: undefined } });
  chips.push(...listChips('types', filters.types, (value) => PROPERTY_TYPE_LABELS[value as keyof typeof PROPERTY_TYPE_LABELS] ?? value));
  for (const config of COUNT_FILTERS) {
    const selected = filters[config.key] ?? [];
    for (const option of selected) {
      const rest = selected.filter((item) => item !== option);
      chips.push({ key: `${config.key}:${option}`, label: countOptionLabel(config, option, true), remove: { [config.key]: rest.length ? rest : undefined } });
    }
  }
  const price = rangeLabel(filters.minPrice, filters.maxPrice, (value) => formatCurrency(value, true));
  if (price) chips.push({ key: 'price', label: `Preço ${price}`, remove: { minPrice: undefined, maxPrice: undefined } });
  const area = rangeLabel(filters.minArea, filters.maxArea, formatArea);
  if (area) chips.push({ key: 'area', label: `Área ${area}`, remove: { minArea: undefined, maxArea: undefined } });
  chips.push(...listChips('neighborhoods', filters.neighborhoods, (value) => neighborhoodNames.get(value) ?? value));
  chips.push(...listChips('sources', filters.sources, (value) => sourceNames.get(value) ?? value));
  return chips;
}
