import type { IptuPeriod, TransactionType } from '@er/shared';
import { normalizeText, parseBrNumber } from '../../utils/text';

const INSTALLMENTS = /(\d{1,2})\s*x\s*(?:de\s*)?R\$\s*([\d.,]+)/i;
const VALUE = /R\$\s*([\d.,]+)/i;
const SNIPPET = /iptu\s*:?\s*((?:\d{1,2}\s*x\s*(?:de\s*)?)?R\$\s*[\d.,]+(?:\s*\/?\s*(?:anual|ao ano|por ano|ano|mensal|por m[eê]s|m[eê]s))?)/i;
const MONTHLY_RATIO_THRESHOLD = 0.001;
const RENT_TO_VALUE_MULTIPLIER = 200;
const MIN_ANNUAL_WITHOUT_PRICE = 300;

export interface IptuInfo {
  iptu: number | null;
  iptuPeriod: IptuPeriod | null;
}

function periodOf(text: string): IptuPeriod | null {
  const normalized = normalizeText(text);
  if (/\b(anual|ano|a\.a)\b/.test(normalized)) return 'annual';
  if (/\b(mensal|mes|mensais)\b/.test(normalized)) return 'monthly';
  return null;
}

export function parseIptu(text: string | null | undefined): IptuInfo {
  if (!text) return { iptu: null, iptuPeriod: null };
  const installments = text.match(INSTALLMENTS);
  if (installments) {
    const value = parseBrNumber(installments[2]);
    return { iptu: value === null ? null : value * Number.parseInt(installments[1], 10), iptuPeriod: 'annual' };
  }
  return { iptu: parseBrNumber(text.match(VALUE)?.[1] ?? text), iptuPeriod: periodOf(text) };
}

export function iptuSnippet(text: string | null | undefined): string | null {
  return text?.match(SNIPPET)?.[1] ?? null;
}

export function annualIptu(value: number | null, period: IptuPeriod | null | undefined, transaction: TransactionType, price: number | null): number | null {
  if (value === null) return null;
  if (period === 'annual') return value;
  if (period === 'monthly') return value * 12;
  if (!price) return value >= MIN_ANNUAL_WITHOUT_PRICE ? value : value * 12;
  const estimatedValue = transaction === 'sale' ? price : price * RENT_TO_VALUE_MULTIPLIER;
  return value / estimatedValue < MONTHLY_RATIO_THRESHOLD ? value * 12 : value;
}
