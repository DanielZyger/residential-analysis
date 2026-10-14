import type { Property } from '@er/shared';
import { clamp, median, percentileRank, round } from '../../utils/stats';
import type { MedianLookup } from '../market/marketIndex';
import { PRICE_BANDS, PRICE_SENSITIVITY, UNKNOWN_PRICE_SCORE } from './weights';

export interface FactorResult {
  value: number;
  detail: string;
}

const pct = (v: number) => `${Math.abs(round(v * 100))}%`;
const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: v < 100 ? 2 : 0 });

export function priceVsReference(p: Property, ref: MedianLookup, inScope: string, ofScope: string): FactorResult {
  if (!p.pricePerM2) return { value: UNKNOWN_PRICE_SCORE, detail: 'Preço ou área não informados' };
  if (!ref.median) return { value: 50, detail: `Poucos imóveis comparáveis ${inScope} (neutro)` };
  const diff = 1 - p.pricePerM2 / ref.median;
  const direction = diff >= 0 ? 'abaixo' : 'acima';
  return {
    value: clamp(50 + diff * PRICE_SENSITIVITY),
    detail: `${brl(p.pricePerM2)}/m², ${pct(diff)} ${direction} da mediana ${ofScope} (${brl(ref.median)}/m², ${ref.count} imóveis)`,
  };
}

export interface PeerContext {
  areaPerPrice: number[];
  bedroomsPerPrice: number[];
  bandEdges: number[];
  bandMedians: { parking: number; suites: number }[];
}

function sortedRatio(peers: Property[], pick: (p: Property) => number | null): number[] {
  return peers
    .map((p) => (p.price ? pick(p) : null))
    .filter((v): v is number => v !== null && v > 0)
    .sort((a, b) => a - b);
}

function bandOf(edges: number[], price: number): number {
  let band = 0;
  while (band < edges.length && price > edges[band]) band++;
  return band;
}

export function buildPeerContext(peers: Property[]): PeerContext {
  const priced = peers.filter((p) => p.price);
  const prices = priced.map((p) => p.price as number).sort((a, b) => a - b);
  const bandEdges = Array.from({ length: PRICE_BANDS - 1 }, (_, i) => prices[Math.floor(((i + 1) * prices.length) / PRICE_BANDS)] ?? Infinity);
  const bands = Array.from({ length: PRICE_BANDS }, () => ({ parking: [] as number[], suites: [] as number[] }));
  for (const p of priced) {
    const band = bands[bandOf(bandEdges, p.price as number)];
    band.parking.push(p.parkingSpots ?? 0);
    band.suites.push(p.suites ?? 0);
  }
  return {
    areaPerPrice: sortedRatio(priced, (p) => (p.area ? p.area / (p.price as number) : null)),
    bedroomsPerPrice: sortedRatio(priced, (p) => (p.bedrooms ? p.bedrooms / (p.price as number) : null)),
    bandEdges,
    bandMedians: bands.map((b) => ({ parking: median(b.parking) ?? 0, suites: median(b.suites) ?? 0 })),
  };
}

export function spaceValue(p: Property, ctx: PeerContext): FactorResult {
  if (!p.price) return { value: UNKNOWN_PRICE_SCORE, detail: 'Preço não informado' };
  const parts: number[] = [];
  const notes: string[] = [];
  if (p.area) {
    const rank = percentileRank(ctx.areaPerPrice, p.area / p.price);
    parts.push(rank);
    notes.push(`área por R$ melhor que ${round(rank)}% dos similares`);
  }
  if (p.bedrooms) {
    const rank = percentileRank(ctx.bedroomsPerPrice, p.bedrooms / p.price);
    parts.push(rank);
    notes.push(`dormitórios por R$ melhor que ${round(rank)}%`);
  }
  if (!parts.length) return { value: UNKNOWN_PRICE_SCORE, detail: 'Área e dormitórios não informados' };
  return { value: clamp(parts.reduce((s, v) => s + v, 0) / parts.length), detail: notes.join('; ') };
}

export function amenities(p: Property, ctx: PeerContext): FactorResult {
  if (!p.price) return { value: 50, detail: 'Preço não informado' };
  const ref = ctx.bandMedians[bandOf(ctx.bandEdges, p.price)];
  const parking = p.parkingSpots ?? 0;
  const suites = p.suites ?? 0;
  const value = clamp(50 + 20 * (parking - ref.parking) + 15 * (suites - ref.suites));
  return {
    value,
    detail: `${parking} vaga(s) e ${suites} suíte(s); típico na mesma faixa de preço: ${ref.parking} vaga(s), ${ref.suites} suíte(s)`,
  };
}

export function listingQuality(p: Property): FactorResult {
  const checks: [boolean, number, string][] = [
    [p.area !== null, 30, 'área'],
    [p.neighborhoodSlug !== null, 20, 'bairro'],
    [p.photos.length > 0, 10 + Math.min(p.photos.length, 10) * 1.5, 'fotos'],
    [(p.description?.length ?? 0) > 120, 15, 'descrição'],
    [p.bedrooms !== null, 10, 'dormitórios'],
  ];
  const value = checks.reduce((sum, [ok, pts]) => sum + (ok ? pts : 0), 0);
  const missing = checks.filter(([ok]) => !ok).map(([, , label]) => label);
  return {
    value: clamp(value),
    detail: missing.length ? `Faltando: ${missing.join(', ')}` : `Anúncio completo, ${p.photos.length} foto(s)`,
  };
}
