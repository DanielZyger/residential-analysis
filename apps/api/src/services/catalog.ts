import type {
  MetaResponse,
  NeighborhoodListResponse,
  PropertyDetailResponse,
  PropertyFilters,
  PropertyListResponse,
  RankedProperty,
  SourceListResponse,
  TransactionType,
} from '@er/shared';
import type { Dataset } from '../repositories/datasetRepository';
import type { GeoData } from '../repositories/geoRepository';
import { dedupe } from '../scrapers/core/dedupe';
import { withNormalizedNeighborhood } from '../scrapers/core/normalize';
import { MarketIndex } from './market/marketIndex';
import { typeGroup } from './market/typeGroup';
import { rankProperties } from './scoring/scoringEngine';
import { filterProperties, paginate, sortProperties } from './propertyQuery';

const TRANSACTIONS: TransactionType[] = ['sale', 'rent'];

export class Catalog {
  private readonly ranked: RankedProperty[];
  private readonly byId: Map<string, RankedProperty>;
  private readonly market: MarketIndex;
  private readonly neighborhoodCache = new Map<TransactionType, NeighborhoodListResponse>();
  private metaCache: MetaResponse | null = null;

  constructor(private readonly dataset: Dataset, geo: GeoData | null) {
    const properties = dedupe(dataset.properties.map(withNormalizedNeighborhood));
    this.market = new MarketIndex(properties);
    this.ranked = rankProperties(properties, this.market, geo).sort((a, b) => b.score.total - a.score.total);
    this.byId = new Map(this.ranked.map((p) => [p.id, p]));
  }

  list(filters: PropertyFilters): PropertyListResponse {
    const filtered = filterProperties(this.ranked, filters);
    return paginate(sortProperties(filtered, filters.sort ?? 'score', filters.dir), filters.page, filters.pageSize);
  }

  detail(id: string): PropertyDetailResponse | null {
    const property = this.byId.get(id);
    if (!property) return null;
    const group = typeGroup(property.type);
    const similar = this.ranked
      .filter(
        (p) =>
          p.id !== id &&
          p.transaction === property.transaction &&
          typeGroup(p.type) === group &&
          (p.neighborhoodSlug === property.neighborhoodSlug ||
            (!!p.price && !!property.price && Math.abs(p.price - property.price) / property.price <= 0.15)),
      )
      .slice(0, 6);
    return { property, similar };
  }

  neighborhoods(transaction: TransactionType): NeighborhoodListResponse {
    let cached = this.neighborhoodCache.get(transaction);
    if (!cached) {
      cached = { transaction, city: this.market.cityStats(transaction), items: this.market.neighborhoodStats(transaction) };
      this.neighborhoodCache.set(transaction, cached);
    }
    return cached;
  }

  sources(): SourceListResponse {
    return { items: this.dataset.sources, collectedAt: this.dataset.collectedAt, totalProperties: this.ranked.length };
  }

  meta(): MetaResponse {
    if (this.metaCache) return this.metaCache;
    const sourceNames = new Map(this.dataset.sources.map((s) => [s.id, s.name]));
    const ranges = Object.fromEntries(TRANSACTIONS.map((t) => [t, rangesOf(this.ranked.filter((p) => p.transaction === t))])) as MetaResponse['ranges'];
    this.metaCache = {
      collectedAt: this.dataset.collectedAt,
      totalProperties: this.ranked.length,
      neighborhoods: tally(this.ranked, (p) => p.neighborhoodSlug, (p) => p.neighborhood ?? '').map(({ key, name, count }) => ({ slug: key, name, count })),
      sources: tally(this.ranked, (p) => p.sourceId, (p) => sourceNames.get(p.sourceId) ?? p.sourceId).map(({ key, name, count }) => ({ id: key, name, count })),
      ranges,
    };
    return this.metaCache;
  }
}

function tally(items: RankedProperty[], key: (p: RankedProperty) => string | null, name: (p: RankedProperty) => string) {
  const map = new Map<string, { key: string; name: string; count: number }>();
  for (const p of items) {
    const k = key(p);
    if (!k) continue;
    const entry = map.get(k) ?? { key: k, name: name(p), count: 0 };
    entry.count++;
    map.set(k, entry);
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

function rangesOf(items: RankedProperty[]): MetaResponse['ranges'][TransactionType] {
  const prices = items.map((p) => p.price).filter((v): v is number => v !== null);
  const areas = items.map((p) => p.area).filter((v): v is number => v !== null);
  const bounds = (values: number[]) => (values.length ? [Math.min(...values), Math.max(...values)] : [0, 0]);
  const [minPrice, maxPrice] = bounds(prices);
  const [minArea, maxArea] = bounds(areas);
  return { minPrice, maxPrice, minArea, maxArea };
}
