import type { ScoreFactorKey } from '@er/shared';

export const SCORE_WEIGHTS: Record<ScoreFactorKey, { weight: number; label: string }> = {
  neighborhoodPrice: { weight: 0.35, label: 'Preço do m² vs. bairro' },
  cityPrice: { weight: 0.1, label: 'Preço do m² vs. cidade' },
  location: { weight: 0.2, label: 'Localização' },
  spaceValue: { weight: 0.15, label: 'Espaço pelo preço' },
  amenities: { weight: 0.1, label: 'Garagem e suítes' },
  listingQuality: { weight: 0.1, label: 'Qualidade do anúncio' },
};

export const UNKNOWN_PRICE_SCORE = 30;
export const PRICE_SENSITIVITY = 100;
export const PRICE_BANDS = 5;
export const LOCATION = {
  centerWeight: 0.6,
  fullScoreKm: 0.5,
  pointsLostPerKm: 20,
  valuationSensitivity: 125,
  maxDistanceKm: 20,
};
