import { COUNT_FILTERS, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, matchesCount } from '@er/shared';
import type { Paginated, PropertyFilters, RankedProperty, SortDir, SortKey } from '@er/shared';
import { normalizeText } from '../utils/text';

type Predicate = (p: RankedProperty) => boolean;

const between = (value: number | null, min?: number, max?: number) =>
  (min === undefined || (value !== null && value >= min)) && (max === undefined || (value !== null && value <= max));

export function filterProperties(items: RankedProperty[], f: PropertyFilters): RankedProperty[] {
  const predicates: Predicate[] = [(p) => p.transaction === f.transaction];
  if (f.types?.length) {
    const types = new Set(f.types);
    predicates.push((p) => types.has(p.type));
  }
  for (const config of COUNT_FILTERS) {
    const selected = f[config.key];
    if (selected?.length) predicates.push((p) => matchesCount(config, p[config.field], selected));
  }
  if (f.minPrice !== undefined || f.maxPrice !== undefined) predicates.push((p) => between(p.price, f.minPrice, f.maxPrice));
  if (f.minArea !== undefined || f.maxArea !== undefined) predicates.push((p) => between(p.area, f.minArea, f.maxArea));
  if (f.neighborhoods?.length) {
    const hoods = new Set(f.neighborhoods);
    predicates.push((p) => !!p.neighborhoodSlug && hoods.has(p.neighborhoodSlug));
  }
  if (f.sources?.length) {
    const sources = new Set(f.sources);
    predicates.push((p) => sources.has(p.sourceId));
  }
  if (f.q) {
    const terms = normalizeText(f.q).split(' ');
    predicates.push((p) => {
      const haystack = normalizeText(`${p.title} ${p.externalId} ${p.neighborhood ?? ''} ${p.address ?? ''}`);
      return terms.every((t) => haystack.includes(t));
    });
  }
  return items.filter((p) => predicates.every((test) => test(p)));
}

const SORTERS: Record<SortKey, { pick: (p: RankedProperty) => number | string | null; dir: SortDir }> = {
  score: { pick: (p) => p.score.total, dir: 'desc' },
  price: { pick: (p) => p.price, dir: 'asc' },
  pricePerM2: { pick: (p) => p.pricePerM2, dir: 'asc' },
  area: { pick: (p) => p.area, dir: 'desc' },
  recent: { pick: (p) => p.collectedAt, dir: 'desc' },
};

export function sortProperties(items: RankedProperty[], sort: SortKey, dir?: SortDir): RankedProperty[] {
  const { pick, dir: defaultDir } = SORTERS[sort];
  const factor = (dir ?? defaultDir) === 'asc' ? 1 : -1;
  return [...items].sort((a, b) => {
    const va = pick(a);
    const vb = pick(b);
    if (va === vb) return b.score.total - a.score.total;
    if (va === null) return 1;
    if (vb === null) return -1;
    return (va < vb ? -1 : 1) * factor;
  });
}

export function paginate<T>(items: T[], page = 1, pageSize = DEFAULT_PAGE_SIZE): Paginated<T> {
  const size = Math.min(Math.max(1, pageSize), MAX_PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(items.length / size));
  const current = Math.min(Math.max(1, page), totalPages);
  return { items: items.slice((current - 1) * size, current * size), total: items.length, page: current, pageSize: size, totalPages };
}
