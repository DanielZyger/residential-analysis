import type { NeighborhoodStats, Property, PropertyType, TransactionType } from '@er/shared';
import { groupBy, mean, median, round } from '../../utils/stats';
import { typeGroup, type TypeGroup } from './typeGroup';

export const MIN_NEIGHBORHOOD_SAMPLES = 3;

interface Bucket {
  pricesPerM2: number[];
  prices: number[];
}

type Scope = TypeGroup | '*';

function bucketKey(transaction: TransactionType, group: Scope, neighborhood: string): string {
  return `${transaction}|${group}|${neighborhood}`;
}

export interface MedianLookup {
  median: number | null;
  count: number;
}

export class MarketIndex {
  private buckets = new Map<string, Bucket>();
  private medians = new Map<string, MedianLookup>();

  constructor(private readonly properties: Property[]) {
    for (const p of properties) {
      const group = typeGroup(p.type);
      const hood = p.neighborhoodSlug ?? '?';
      for (const key of [
        bucketKey(p.transaction, group, hood),
        bucketKey(p.transaction, '*', hood),
        bucketKey(p.transaction, group, '*'),
        bucketKey(p.transaction, '*', '*'),
      ]) {
        const bucket = this.buckets.get(key) ?? { pricesPerM2: [], prices: [] };
        if (p.pricePerM2) bucket.pricesPerM2.push(p.pricePerM2);
        if (p.price) bucket.prices.push(p.price);
        this.buckets.set(key, bucket);
      }
    }
  }

  medianPerM2(transaction: TransactionType, group: Scope, neighborhood: string | null): MedianLookup {
    const key = bucketKey(transaction, group, neighborhood ?? '*');
    let cached = this.medians.get(key);
    if (!cached) {
      const values = this.buckets.get(key)?.pricesPerM2 ?? [];
      cached = { median: median(values), count: values.length };
      this.medians.set(key, cached);
    }
    return cached;
  }

  neighborhoodReference(p: Property): MedianLookup {
    const group = typeGroup(p.type);
    if (p.neighborhoodSlug) {
      const sameGroup = this.medianPerM2(p.transaction, group, p.neighborhoodSlug);
      if (sameGroup.count >= MIN_NEIGHBORHOOD_SAMPLES) return sameGroup;
      const anyGroup = this.medianPerM2(p.transaction, '*', p.neighborhoodSlug);
      if (anyGroup.count >= MIN_NEIGHBORHOOD_SAMPLES) return anyGroup;
    }
    return { median: null, count: 0 };
  }

  cityReference(p: Property): MedianLookup {
    const sameGroup = this.medianPerM2(p.transaction, typeGroup(p.type), null);
    return sameGroup.count >= MIN_NEIGHBORHOOD_SAMPLES ? sameGroup : this.medianPerM2(p.transaction, '*', null);
  }

  cityStats(transaction: TransactionType): { medianPricePerM2: number | null; count: number } {
    const lookup = this.medianPerM2(transaction, '*', null);
    const total = this.properties.filter((p) => p.transaction === transaction).length;
    return { medianPricePerM2: lookup.median === null ? null : round(lookup.median), count: total };
  }

  neighborhoodStats(transaction: TransactionType): NeighborhoodStats[] {
    const scoped = this.properties.filter((p) => p.transaction === transaction && p.neighborhoodSlug);
    const byHood = groupBy(scoped, (p) => p.neighborhoodSlug as string);
    const stats: NeighborhoodStats[] = [];
    for (const [slug, items] of byHood) {
      const ppm2 = items.map((p) => p.pricePerM2).filter((v): v is number => v !== null);
      const prices = items.map((p) => p.price).filter((v): v is number => v !== null);
      const byType: NeighborhoodStats['byType'] = {};
      for (const [type, typed] of groupBy(items, (p) => p.type)) {
        const values = typed.map((p) => p.pricePerM2).filter((v): v is number => v !== null);
        const m = median(values);
        byType[type as PropertyType] = { count: typed.length, medianPricePerM2: m === null ? null : round(m) };
      }
      const rounded = (v: number | null) => (v === null ? null : round(v));
      stats.push({
        slug,
        name: items[0].neighborhood ?? slug,
        transaction,
        count: items.length,
        medianPricePerM2: rounded(median(ppm2)),
        avgPricePerM2: rounded(mean(ppm2)),
        minPricePerM2: ppm2.length ? round(Math.min(...ppm2)) : null,
        maxPricePerM2: ppm2.length ? round(Math.max(...ppm2)) : null,
        medianPrice: rounded(median(prices)),
        byType,
      });
    }
    return stats.sort((a, b) => b.count - a.count);
  }
}
