import type { Property } from './domain';

const ANNUAL_IPTU_RATIO = 0.2;

export interface MonthlyCosts {
  rent: number;
  condo: number | null;
  iptu: number | null;
  iptuAnnual: number | null;
  total: number;
}

export function monthlyCosts(property: Pick<Property, 'transaction' | 'price' | 'condoFee' | 'iptu'>): MonthlyCosts | null {
  const { transaction, price, condoFee, iptu } = property;
  if (transaction !== 'rent' || !price || (condoFee == null && iptu == null)) return null;
  const isAnnual = iptu != null && iptu > price * ANNUAL_IPTU_RATIO;
  const iptuMonthly = iptu == null ? null : isAnnual ? iptu / 12 : iptu;
  return {
    rent: price,
    condo: condoFee,
    iptu: iptuMonthly,
    iptuAnnual: isAnnual ? iptu : null,
    total: price + (condoFee ?? 0) + (iptuMonthly ?? 0),
  };
}
