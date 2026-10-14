import {
  COUNT_FILTERS,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  PROPERTY_TYPE_LABELS,
  type PropertyFilters,
  type PropertyType,
  type SortDir,
  type SortKey,
  type TransactionType,
} from '@er/shared';

export const DEFAULT_FILTERS = {
  transaction: 'sale',
  sort: 'score',
  dir: 'desc',
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
} as const satisfies PropertyFilters;

const TRANSACTIONS: readonly TransactionType[] = ['sale', 'rent'];
const SORT_KEYS: readonly SortKey[] = ['score', 'price', 'pricePerM2', 'area', 'recent'];
const SORT_DIRS: readonly SortDir[] = ['asc', 'desc'];
const PROPERTY_TYPES = Object.keys(PROPERTY_TYPE_LABELS) as PropertyType[];

export const FILTER_KEYS = [
  'transaction',
  'types',
  'bedrooms',
  'suites',
  'parking',
  'minPrice',
  'maxPrice',
  'minArea',
  'maxArea',
  'neighborhoods',
  'sources',
  'q',
  'sort',
  'dir',
  'page',
  'pageSize',
] as const satisfies readonly (keyof PropertyFilters)[];

export const REFINEMENT_KEYS = [
  'types',
  'bedrooms',
  'suites',
  'parking',
  'minPrice',
  'maxPrice',
  'minArea',
  'maxArea',
  'neighborhoods',
  'sources',
  'q',
] as const satisfies readonly (keyof PropertyFilters)[];

export type RefinementKey = (typeof REFINEMENT_KEYS)[number];

function pickEnum<T extends string>(value: string | null, allowed: readonly T[]): T | undefined {
  return value != null && (allowed as readonly string[]).includes(value) ? (value as T) : undefined;
}

function pickNumber(value: string | null, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}): number | undefined {
  if (value == null || value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= min && parsed <= max ? parsed : undefined;
}

function pickList(value: string | null): string[] | undefined {
  const items = value
    ?.split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  return items && items.length > 0 ? Array.from(new Set(items)) : undefined;
}

function pickCounts(value: string | null, allowed: readonly number[]): number[] | undefined {
  const counts = pickList(value)
    ?.map(Number)
    .filter((count) => allowed.includes(count))
    .sort((a, b) => a - b);
  return counts && counts.length > 0 ? counts : undefined;
}

export function parseTransaction(value: string | null): TransactionType {
  return pickEnum(value, TRANSACTIONS) ?? DEFAULT_FILTERS.transaction;
}

export function parseFilters(params: URLSearchParams): PropertyFilters {
  const types = pickList(params.get('types'))?.filter((type): type is PropertyType =>
    (PROPERTY_TYPES as string[]).includes(type),
  );
  const q = params.get('q')?.trim();
  return {
    transaction: parseTransaction(params.get('transaction')),
    types: types && types.length > 0 ? types : undefined,
    ...Object.fromEntries(COUNT_FILTERS.map(({ key, options }) => [key, pickCounts(params.get(key), options)])),
    minPrice: pickNumber(params.get('minPrice')),
    maxPrice: pickNumber(params.get('maxPrice')),
    minArea: pickNumber(params.get('minArea')),
    maxArea: pickNumber(params.get('maxArea')),
    neighborhoods: pickList(params.get('neighborhoods')),
    sources: pickList(params.get('sources')),
    q: q || undefined,
    sort: pickEnum(params.get('sort'), SORT_KEYS) ?? DEFAULT_FILTERS.sort,
    dir: pickEnum(params.get('dir'), SORT_DIRS) ?? DEFAULT_FILTERS.dir,
    page: pickNumber(params.get('page'), { min: 1 }) ?? DEFAULT_FILTERS.page,
    pageSize: pickNumber(params.get('pageSize'), { min: 1, max: MAX_PAGE_SIZE }) ?? DEFAULT_FILTERS.pageSize,
  };
}

function serialize(value: PropertyFilters[keyof PropertyFilters]): string | undefined {
  if (value == null) return undefined;
  if (Array.isArray(value)) return value.length > 0 ? value.join(',') : undefined;
  const text = String(value).trim();
  return text === '' ? undefined : text;
}

export function filtersToParams(filters: Partial<PropertyFilters>, omitDefaults = false): URLSearchParams {
  const params = new URLSearchParams();
  for (const key of FILTER_KEYS) {
    const value = serialize(filters[key]);
    if (value === undefined) continue;
    if (omitDefaults && key in DEFAULT_FILTERS && value === String(DEFAULT_FILTERS[key as keyof typeof DEFAULT_FILTERS])) continue;
    params.set(key, value);
  }
  return params;
}

export function isRefinementActive(filters: PropertyFilters, key: RefinementKey): boolean {
  const value = filters[key];
  return Array.isArray(value) ? value.length > 0 : value != null && value !== '';
}

export function countActiveRefinements(filters: PropertyFilters): number {
  return REFINEMENT_KEYS.filter((key) => isRefinementActive(filters, key)).length;
}

export function rankingHref(filters: Partial<PropertyFilters>): string {
  const query = filtersToParams(filters, true).toString();
  return query ? `/?${query}` : '/';
}
