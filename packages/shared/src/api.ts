import type { NeighborhoodStats, PropertyType, RankedProperty, Source, TransactionType } from './domain';

export type SortKey = 'score' | 'price' | 'pricePerM2' | 'area' | 'recent';
export type SortDir = 'asc' | 'desc';

export interface PropertyFilters {
  transaction: TransactionType;
  types?: PropertyType[];
  bedrooms?: number[];
  suites?: number[];
  parking?: number[];
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  neighborhoods?: string[];
  sources?: string[];
  q?: string;
  sort?: SortKey;
  dir?: SortDir;
  page?: number;
  pageSize?: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type PropertyListResponse = Paginated<RankedProperty>;

export interface PropertyDetailResponse {
  property: RankedProperty;
  similar: RankedProperty[];
}

export interface NeighborhoodListResponse {
  transaction: TransactionType;
  city: { medianPricePerM2: number | null; count: number };
  items: NeighborhoodStats[];
}

export interface SourceListResponse {
  items: Source[];
  collectedAt: string | null;
  totalProperties: number;
}

export interface MetaResponse {
  collectedAt: string | null;
  totalProperties: number;
  neighborhoods: { slug: string; name: string; count: number }[];
  sources: { id: string; name: string; count: number }[];
  ranges: Record<TransactionType, { minPrice: number; maxPrice: number; minArea: number; maxArea: number }>;
}
