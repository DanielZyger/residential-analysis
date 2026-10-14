import type { RankedProperty, ScoreFactorKey } from '@er/shared';

export const FACTOR_SHORT_LABELS: Record<ScoreFactorKey, string> = {
  neighborhoodPrice: 'm² bairro',
  cityPrice: 'm² cidade',
  location: 'Localização',
  spaceValue: 'Espaço',
  amenities: 'Vagas/suítes',
  listingQuality: 'Anúncio',
};

export type ScoreTone = 'excellent' | 'good' | 'fair' | 'low';

const SCORE_BANDS: { min: number; tone: ScoreTone; label: string }[] = [
  { min: 80, tone: 'excellent', label: 'Excelente' },
  { min: 65, tone: 'good', label: 'Bom' },
  { min: 50, tone: 'fair', label: 'Regular' },
  { min: -Infinity, tone: 'low', label: 'Baixo' },
];

export function getScoreBand(value: number) {
  return SCORE_BANDS.find((band) => value >= band.min) ?? SCORE_BANDS[SCORE_BANDS.length - 1];
}

export function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, value));
}

export function toPercentWeight(weight: number): number {
  return weight <= 1 ? weight * 100 : weight;
}

export type MedianReference = 'neighborhood' | 'city';

export interface MedianComparison {
  percent: number;
  reference: MedianReference;
  median: number;
}

export function compareWithMedian(property: Pick<RankedProperty, 'pricePerM2' | 'score'>): MedianComparison | null {
  const { pricePerM2 } = property;
  const { neighborhoodMedianM2, cityMedianM2 } = property.score.reference;
  if (pricePerM2 == null) return null;
  const median = neighborhoodMedianM2 ?? cityMedianM2;
  if (!median) return null;
  return {
    percent: ((pricePerM2 - median) / median) * 100,
    reference: neighborhoodMedianM2 != null ? 'neighborhood' : 'city',
    median,
  };
}
