import type { Property } from '@er/shared';
import type { GeoData } from '../../repositories/geoRepository';
import { distanceKm, type LatLng } from '../../utils/geo';
import { clamp, round } from '../../utils/stats';
import type { MarketIndex } from '../market/marketIndex';
import { MIN_NEIGHBORHOOD_SAMPLES } from '../market/marketIndex';
import type { FactorResult } from './factors';
import { LOCATION } from './weights';

interface Position {
  point: LatLng;
  approximate: boolean;
}

const km = (value: number) => `${value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} km`;

function position(p: Property, geo: GeoData): Position | null {
  if (p.latitude !== null && p.longitude !== null) {
    const point = { lat: p.latitude, lng: p.longitude };
    if (distanceKm(point, geo.center) <= LOCATION.maxDistanceKm) return { point, approximate: false };
  }
  const hood = p.neighborhoodSlug ? geo.neighborhoods[p.neighborhoodSlug] : undefined;
  return hood ? { point: hood, approximate: true } : null;
}

function centerScore(p: Property, geo: GeoData | null): { value: number; detail: string } | null {
  const pos = geo && position(p, geo);
  if (!geo || !pos) return null;
  const distance = distanceKm(pos.point, geo.center);
  return {
    value: clamp(100 - Math.max(0, distance - LOCATION.fullScoreKm) * LOCATION.pointsLostPerKm),
    detail: pos.approximate
      ? distance < LOCATION.fullScoreKm
        ? 'No centro da cidade (posição do bairro)'
        : `~${km(distance)} do centro (posição do bairro)`
      : `${km(distance)} do centro`,
  };
}

function valuationScore(p: Property, market: MarketIndex): { value: number; detail: string } | null {
  if (!p.neighborhoodSlug) return null;
  const hood = market.medianPerM2(p.transaction, '*', p.neighborhoodSlug);
  const city = market.medianPerM2(p.transaction, '*', null);
  if (!hood.median || !city.median || hood.count < MIN_NEIGHBORHOOD_SAMPLES) return null;
  const diff = hood.median / city.median - 1;
  return {
    value: clamp(50 + diff * LOCATION.valuationSensitivity),
    detail: `m² do bairro ${Math.abs(round(diff * 100))}% ${diff >= 0 ? 'acima' : 'abaixo'} da cidade`,
  };
}

export function locationFactor(p: Property, market: MarketIndex, geo: GeoData | null): FactorResult {
  const center = centerScore(p, geo);
  const valuation = valuationScore(p, market);
  if (!center && !valuation) return { value: 50, detail: 'Localização não identificada (neutro)' };
  const value = center && valuation ? center.value * LOCATION.centerWeight + valuation.value * (1 - LOCATION.centerWeight) : (center ?? valuation)!.value;
  return { value, detail: [center?.detail, valuation?.detail].filter(Boolean).join(' · ') };
}
