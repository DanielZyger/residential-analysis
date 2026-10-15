export type TransactionType = 'sale' | 'rent';

export type IptuPeriod = 'annual' | 'monthly';

export type PropertyType = 'house' | 'apartment' | 'townhouse' | 'studio' | 'penthouse' | 'land_house' | 'other';

export interface RawPropertyInput {
  sourceId: string;
  externalId: string;
  url: string;
  transaction: TransactionType;
  type: PropertyType;
  title: string;
  price: number | null;
  condoFee: number | null;
  iptu: number | null;
  iptuPeriod?: IptuPeriod | null;
  privateArea: number | null;
  totalArea: number | null;
  bedrooms: number | null;
  suites: number | null;
  bathrooms: number | null;
  parkingSpots: number | null;
  neighborhood: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  photos: string[];
  features: string[];
}

export interface Property extends RawPropertyInput {
  id: string;
  sourceName: string;
  neighborhoodSlug: string | null;
  area: number | null;
  pricePerM2: number | null;
  collectedAt: string;
  alsoListedAt: { sourceId: string; sourceName: string; url: string }[];
}

export interface ScoreFactor {
  key: ScoreFactorKey;
  label: string;
  weight: number;
  value: number;
  detail: string;
}

export type ScoreFactorKey = 'neighborhoodPrice' | 'cityPrice' | 'location' | 'spaceValue' | 'amenities' | 'listingQuality';

export interface ScoreBreakdown {
  total: number;
  rank: number;
  peers: number;
  factors: ScoreFactor[];
  reference: {
    neighborhoodMedianM2: number | null;
    cityMedianM2: number | null;
    neighborhoodSamples: number;
  };
}

export interface RankedProperty extends Property {
  score: ScoreBreakdown;
}

export interface NeighborhoodStats {
  slug: string;
  name: string;
  transaction: TransactionType;
  count: number;
  medianPricePerM2: number | null;
  avgPricePerM2: number | null;
  minPricePerM2: number | null;
  maxPricePerM2: number | null;
  medianPrice: number | null;
  byType: Partial<Record<PropertyType, { count: number; medianPricePerM2: number | null }>>;
}

export type SourcePlatform = string;

export interface Source {
  id: string;
  name: string;
  website: string;
  platform: SourcePlatform;
  active: boolean;
  inactiveReason: string | null;
  lastRunAt: string | null;
  lastRunCount: number;
  lastRunError: string | null;
}
