import type { PropertyType, TransactionType } from './domain';

export const TRANSACTION_LABELS: Record<TransactionType, string> = {
  sale: 'Venda',
  rent: 'Aluguel',
};

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  house: 'Casa',
  apartment: 'Apartamento',
  townhouse: 'Sobrado',
  studio: 'Kitnet / Studio',
  penthouse: 'Cobertura',
  land_house: 'Casa em condomínio',
  other: 'Outro',
};

export const DEFAULT_PAGE_SIZE = 24;
export const MAX_PAGE_SIZE = 96;
export const CITY_NAME = 'Erechim';
export const CITY_STATE = 'RS';
