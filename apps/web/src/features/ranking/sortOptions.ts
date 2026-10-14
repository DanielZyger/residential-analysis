import type { SortDir, SortKey } from '@er/shared';
import type { SelectOption } from '../../components/SelectField';

export type SortValue = `${SortKey}:${SortDir}`;

export const SORT_OPTIONS: SelectOption<SortValue>[] = [
  { value: 'score:desc', label: 'Melhor nota' },
  { value: 'pricePerM2:asc', label: 'Menor preço/m²' },
  { value: 'price:asc', label: 'Menor preço' },
  { value: 'price:desc', label: 'Maior preço' },
  { value: 'area:desc', label: 'Maior área' },
  { value: 'recent:desc', label: 'Mais recentes' },
];

export function toSortValue(sort: SortKey = 'score', dir: SortDir = 'desc'): SortValue {
  return `${sort}:${dir}`;
}

export function fromSortValue(value: SortValue): { sort: SortKey; dir: SortDir } {
  const [sort, dir] = value.split(':') as [SortKey, SortDir];
  return { sort, dir };
}
