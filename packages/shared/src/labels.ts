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
export const CITY_NAME = 'Chapecó';
export const CITY_STATE = 'SC';

export const CITY_SLUG = 'chapeco';
export const CITY_IBGE_CODE = '4204202';
