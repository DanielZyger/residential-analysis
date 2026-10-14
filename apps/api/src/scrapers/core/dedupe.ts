import type { Property } from '@er/shared';
import { groupBy } from '../../utils/stats';
import { normalizeText } from '../../utils/text';

const AREA_TOLERANCE = 0.03;
const STREET_PREFIX = /^(rua|r|avenida|av|travessa|tv|rodovia|alameda|al|estrada)\b\.?\s*/;

function street(address: string | null): string | null {
  if (!address) return null;
  const name = normalizeText(address.split(/,|\bn[º°o]?\b|-/)[0])
    .replace(/[.]/g, ' ')
    .replace(STREET_PREFIX, '')
    .replace(/\d+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return name.length >= 4 ? name : null;
}

function compatible<T>(a: T | null, b: T | null): boolean {
  return a === null || b === null || a === b;
}

function similarArea(a: number | null, b: number | null): boolean {
  return a !== null && b !== null && Math.abs(a - b) / Math.max(a, b) <= AREA_TOLERANCE;
}

function sameProperty(a: Property, b: Property): boolean {
  if (a.sourceId === b.sourceId || a.type !== b.type || !compatible(a.bedrooms, b.bedrooms)) return false;
  const streetA = street(a.address);
  if (streetA && streetA === street(b.address)) return true;
  return similarArea(a.area, b.area) && compatible(a.neighborhoodSlug, b.neighborhoodSlug);
}

function quality(p: Property): number {
  const filled = [p.area, p.bedrooms, p.parkingSpots, p.suites, p.neighborhoodSlug, p.address, p.description, p.condoFee].filter((v) => v !== null).length;
  return filled * 10 + Math.min(p.photos.length, 30);
}

function clusters(items: Property[]): Property[][] {
  const parent = items.map((_, i) => i);
  const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      if (sameProperty(items[i], items[j])) parent[find(j)] = find(i);
    }
  }
  return [...groupBy(items, (_, i) => String(find(i))).values()];
}

function merge(group: Property[]): Property {
  const [best, ...others] = [...group].sort((a, b) => quality(b) - quality(a));
  const listings = [...others.map(({ sourceId, sourceName, url }) => ({ sourceId, sourceName, url })), ...group.flatMap((p) => p.alsoListedAt)];
  const unique = new Map(listings.filter((l) => l.url !== best.url).map((l) => [l.url, l]));
  const located = group.find((p) => p.latitude !== null && p.longitude !== null);
  return { ...best, latitude: best.latitude ?? located?.latitude ?? null, longitude: best.longitude ?? located?.longitude ?? null, alsoListedAt: [...unique.values()] };
}

export function dedupe(properties: Property[]): Property[] {
  const byId = new Map(properties.map((p) => [p.id, p]));
  const priced = groupBy([...byId.values()], (p) => (p.price ? `${p.transaction}|${Math.round(p.price)}` : `id|${p.id}`));
  return [...priced.values()].flatMap((bucket) => (bucket.length === 1 ? bucket : clusters(bucket).map(merge)));
}
