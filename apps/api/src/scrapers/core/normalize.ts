import type { Property, PropertyType, RawPropertyInput, TransactionType } from '@er/shared';
import { NEIGHBORHOOD_ALIASES, NOT_A_NEIGHBORHOOD } from '../../data/neighborhoods';
import { cleanText, hash, normalizeText, slugify, titleCase } from '../../utils/text';
import { round } from '../../utils/stats';
import { typeGroup } from '../../services/market/typeGroup';
import { annualIptu } from './iptu';

const TYPE_PATTERNS: [RegExp, PropertyType | null][] = [
  [/\b(terrenos?|lotes?|salas? comercia(l|is)|salas?|lojas?|comercial|pavilh(ao|oes)|galp(ao|oes)|depositos?|predio comercial|chacaras?|sitios?|fazendas?|area rural|ponto comercial|box de garagem|vaga de garagem)\b/, null],
  [/\bcasas? em condominio\b/, 'land_house'],
  [/\bcoberturas?\b/, 'penthouse'],
  [/\b(kitnet|kitinete|kit|studio|estudio|loft|jk)s?\b/, 'studio'],
  [/\bsobrados?\b/, 'townhouse'],
  [/\b(apartamentos?|aptos?|ap|flat|duplex|triplex)\b/, 'apartment'],
  [/\b(casas?|residencias?|geminad[oa]s?|chales?)\b/, 'house'],
];

function earliestMatch(text: string): PropertyType | null | undefined {
  let best: { index: number; type: PropertyType | null } | undefined;
  for (const [pattern, type] of TYPE_PATTERNS) {
    const match = pattern.exec(text);
    if (match && (!best || match.index < best.index)) best = { index: match.index, type };
  }
  return best?.type;
}

export function normalizePropertyType(...hints: (string | null | undefined)[]): PropertyType | null | undefined {
  for (const hint of hints) {
    const type = earliestMatch(normalizeText(hint));
    if (type !== undefined) return type;
  }
  return undefined;
}

export function normalizeTransaction(value: string | null | undefined): TransactionType | null {
  const text = normalizeText(value);
  if (/(alug|locac|loca)/.test(text)) return 'rent';
  if (/(vend|compra)/.test(text)) return 'sale';
  return null;
}

const RURAL_PATTERN = /(^|-)(interior|linha|povoado|distrito|area-rural)(-|$)/;
const STREET_PATTERN = /^(rua|r|av|avenida|travessa|tv|rodovia|ers|rs|br|n)-/;
const PREFIX_PATTERN = /^(loteamento|lot\.?|residencial|condominio|bairro)\s+/i;
const OFFICIAL_BY_LENGTH = Object.keys(NEIGHBORHOOD_ALIASES).sort((a, b) => b.length - a.length);

function firstSegment(value: string): string {
  return value.split(/\s+-\s+|[,(]/)[0].replace(PREFIX_PATTERN, '');
}

function canonicalName(slug: string): string | undefined {
  if (NEIGHBORHOOD_ALIASES[slug]) return NEIGHBORHOOD_ALIASES[slug];
  const prefix = OFFICIAL_BY_LENGTH.find((key) => slug.startsWith(`${key}-`));
  return prefix ? NEIGHBORHOOD_ALIASES[prefix] : undefined;
}

export function normalizeNeighborhood(value: string | null | undefined): { name: string; slug: string } | null {
  const cleaned = cleanText(firstSegment(value?.replace(/\b(bairro|erechim|rs)\b/gi, '') ?? '').replace(/[-/,.]+\s*$/, ''));
  if (!cleaned) return null;
  const slug = slugify(cleaned);
  if (!slug || NOT_A_NEIGHBORHOOD.has(slug) || RURAL_PATTERN.test(slug) || STREET_PATTERN.test(`${slug}-`)) return null;
  const canonical = canonicalName(slug) ?? titleCase(cleaned);
  return { name: canonical, slug: slugify(canonical) };
}

function readableTitle(value: string): string {
  const title = cleanText(value) ?? 'Imóvel residencial';
  return title === title.toUpperCase() ? titleCase(title) : title;
}

function normalizedIptu(raw: Pick<RawPropertyInput, 'iptu' | 'iptuPeriod' | 'transaction' | 'price'>): Pick<Property, 'iptu' | 'iptuPeriod'> {
  const annual = annualIptu(raw.iptu, raw.iptuPeriod, raw.transaction, raw.price);
  return { iptu: annual === null ? null : inRange(round(annual, 2), ANNUAL_IPTU_LIMITS), iptuPeriod: 'annual' };
}

export function renormalize(property: Property): Property {
  const neighborhood = normalizeNeighborhood(property.neighborhood);
  return {
    ...property,
    ...(property.iptuPeriod === 'annual' ? {} : normalizedIptu(property)),
    neighborhood: neighborhood?.name ?? null,
    neighborhoodSlug: neighborhood?.slug ?? null,
  };
}

const LIMITS: Record<TransactionType, { price: [number, number]; pricePerM2: [number, number] }> = {
  sale: { price: [30_000, 20_000_000], pricePerM2: [800, 25_000] },
  rent: { price: [250, 50_000], pricePerM2: [5, 150] },
};
const AREA_LIMITS: [number, number] = [12, 3_000];
const FEE_LIMITS: [number, number] = [20, 20_000];
const ANNUAL_IPTU_LIMITS: [number, number] = [50, 100_000];

function plausibleArea(transaction: TransactionType, price: number | null, area: number | null): number | null {
  if (!price || !area) return area;
  return inRange(price / area, LIMITS[transaction].pricePerM2) === null ? null : area;
}

function inRange(value: number | null, [min, max]: [number, number]): number | null {
  return value !== null && value >= min && value <= max ? value : null;
}

export function toProperty(raw: RawPropertyInput, sourceName: string, collectedAt: string): Property {
  const neighborhood = normalizeNeighborhood(raw.neighborhood);
  const price = inRange(raw.price, LIMITS[raw.transaction].price);
  const privateArea = inRange(raw.privateArea, AREA_LIMITS);
  const totalArea = inRange(raw.totalArea, AREA_LIMITS);
  const area = plausibleArea(raw.transaction, price, privateArea ?? (typeGroup(raw.type) === 'apartment' ? totalArea : null));
  return {
    ...raw,
    title: readableTitle(raw.title),
    description: cleanText(raw.description),
    address: cleanText(raw.address),
    neighborhood: neighborhood?.name ?? null,
    neighborhoodSlug: neighborhood?.slug ?? null,
    price,
    condoFee: inRange(raw.condoFee, FEE_LIMITS),
    ...normalizedIptu({ ...raw, price }),
    privateArea,
    totalArea,
    area,
    pricePerM2: price && area ? round(price / area, 2) : null,
    photos: [...new Set(raw.photos.filter((p) => /^https?:\/\//.test(p)))],
    features: [...new Set(raw.features.map((f) => cleanText(f)).filter((f): f is string => !!f))],
    sourceName,
    id: hash(`${raw.sourceId}:${raw.externalId}:${raw.transaction}`),
    collectedAt,
    alsoListedAt: [],
  };
}
