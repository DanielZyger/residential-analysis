import { COUNT_FILTERS, PROPERTY_TYPE_LABELS } from '@er/shared';
import type { PropertyFilters, PropertyType, SortDir, SortKey, TransactionType } from '@er/shared';

type Query = Record<string, string | undefined>;

const SORT_KEYS: SortKey[] = ['score', 'price', 'pricePerM2', 'area', 'recent'];
const PROPERTY_TYPES = Object.keys(PROPERTY_TYPE_LABELS) as PropertyType[];

const num = (value?: string) => {
  if (value === undefined || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};
const list = (value?: string) => value?.split(',').map((v) => v.trim()).filter(Boolean);
const counts = (value?: string) => {
  const parsed = list(value)?.map(Number).filter((n) => Number.isInteger(n) && n >= 0);
  return parsed?.length ? [...new Set(parsed)] : undefined;
};
const oneOf = <T extends string>(value: string | undefined, allowed: readonly T[]) =>
  allowed.includes(value as T) ? (value as T) : undefined;

export function parseTransaction(value?: string): TransactionType {
  return value === 'rent' ? 'rent' : 'sale';
}

export function parseFilters(q: Query): PropertyFilters {
  return {
    transaction: parseTransaction(q.transaction),
    types: list(q.types)?.filter((t): t is PropertyType => PROPERTY_TYPES.includes(t as PropertyType)),
    ...Object.fromEntries(COUNT_FILTERS.map(({ key }) => [key, counts(q[key])])),
    minPrice: num(q.minPrice),
    maxPrice: num(q.maxPrice),
    minArea: num(q.minArea),
    maxArea: num(q.maxArea),
    neighborhoods: list(q.neighborhoods),
    sources: list(q.sources),
    q: q.q?.trim() || undefined,
    sort: oneOf(q.sort, SORT_KEYS),
    dir: oneOf<SortDir>(q.dir, ['asc', 'desc']),
    page: num(q.page),
    pageSize: num(q.pageSize),
  };
}
