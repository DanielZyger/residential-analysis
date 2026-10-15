import type { Property } from './domain';

export interface MonthlyCosts {
  rent: number;
  condo: number | null;
  iptu: number | null;
  iptuAnnual: number | null;
  total: number;
}

export function monthlyIptu(iptuAnnual: number | null): number | null {
  return iptuAnnual === null ? null : iptuAnnual / 12;
}

export function monthlyCosts(property: Pick<Property, 'transaction' | 'price' | 'condoFee' | 'iptu'>): MonthlyCosts | null {
  const { transaction, price, condoFee, iptu } = property;
  if (transaction !== 'rent' || !price || (condoFee == null && iptu == null)) return null;
  const iptuMonthly = monthlyIptu(iptu);
  return { rent: price, condo: condoFee, iptu: iptuMonthly, iptuAnnual: iptu, total: price + (condoFee ?? 0) + (iptuMonthly ?? 0) };
}
