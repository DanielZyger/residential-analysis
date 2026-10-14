import type { Property, RankedProperty, ScoreFactor, ScoreFactorKey } from '@er/shared';
import { groupBy, round } from '../../utils/stats';
import type { MarketIndex } from '../market/marketIndex';
import { typeGroup } from '../market/typeGroup';
import { amenities, buildPeerContext, listingQuality, priceVsReference, spaceValue, type FactorResult } from './factors';
import { locationFactor } from './location';
import { SCORE_WEIGHTS } from './weights';
import type { GeoData } from '../../repositories/geoRepository';

function toFactor(key: ScoreFactorKey, result: FactorResult): ScoreFactor {
  const { weight, label } = SCORE_WEIGHTS[key];
  return { key, label, weight, value: round(result.value, 1), detail: result.detail };
}

export function rankProperties(properties: Property[], market: MarketIndex, geo: GeoData | null): RankedProperty[] {
  const peerGroups = groupBy(properties, (p) => `${p.transaction}|${typeGroup(p.type)}`);
  const ranked: RankedProperty[] = [];
  for (const peers of peerGroups.values()) {
    const ctx = buildPeerContext(peers);
    for (const p of peers) {
      const hoodRef = market.neighborhoodReference(p);
      const cityRef = market.cityReference(p);
      const factors = [
        toFactor('neighborhoodPrice', priceVsReference(p, hoodRef, 'no bairro', 'do bairro')),
        toFactor('cityPrice', priceVsReference(p, cityRef, 'na cidade', 'da cidade')),
        toFactor('location', locationFactor(p, market, geo)),
        toFactor('spaceValue', spaceValue(p, ctx)),
        toFactor('amenities', amenities(p, ctx)),
        toFactor('listingQuality', listingQuality(p)),
      ];
      ranked.push({
        ...p,
        score: {
          total: round(factors.reduce((sum, f) => sum + f.value * f.weight, 0), 1),
          rank: 0,
          peers: 0,
          factors,
          reference: {
            neighborhoodMedianM2: hoodRef.median === null ? null : round(hoodRef.median),
            cityMedianM2: cityRef.median === null ? null : round(cityRef.median),
            neighborhoodSamples: hoodRef.count,
          },
        },
      });
    }
  }
  for (const group of groupBy(ranked, (p) => p.transaction).values()) {
    group.sort((a, b) => b.score.total - a.score.total);
    group.forEach((p, i) => {
      p.score.rank = i + 1;
      p.score.peers = group.length;
    });
  }
  return ranked;
}
