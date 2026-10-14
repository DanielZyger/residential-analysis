export const EMPTY_VALUE = '—';

const LOCALE = 'pt-BR';

const currencyFormatter = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const compactCurrencyFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: 'BRL',
  notation: 'compact',
  maximumFractionDigits: 1,
});
const integerFormatter = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 });
const percentFormatter = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 });
const dateFormatter = new Intl.DateTimeFormat(LOCALE, { dateStyle: 'short' });
const dateTimeFormatter = new Intl.DateTimeFormat(LOCALE, { dateStyle: 'short', timeStyle: 'short' });

type Maybe<T> = T | null | undefined;

function isNumber(value: Maybe<number>): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export function formatCurrency(value: Maybe<number>, compact = false): string {
  if (!isNumber(value)) return EMPTY_VALUE;
  return (compact ? compactCurrencyFormatter : currencyFormatter).format(value);
}

export function formatPricePerM2(value: Maybe<number>): string {
  return isNumber(value) ? `${currencyFormatter.format(value)}/m²` : EMPTY_VALUE;
}

export function formatArea(value: Maybe<number>): string {
  return isNumber(value) ? `${integerFormatter.format(value)} m²` : EMPTY_VALUE;
}

export function formatNumber(value: Maybe<number>): string {
  return isNumber(value) ? integerFormatter.format(value) : EMPTY_VALUE;
}

export function formatPercent(value: Maybe<number>): string {
  return isNumber(value) ? `${percentFormatter.format(value)}%` : EMPTY_VALUE;
}

function toDate(value: Maybe<string>): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value: Maybe<string>): string {
  const date = toDate(value);
  return date ? dateFormatter.format(date) : EMPTY_VALUE;
}

export function formatDateTime(value: Maybe<string>): string {
  const date = toDate(value);
  return date ? dateTimeFormatter.format(date) : EMPTY_VALUE;
}

export function pluralize(count: number, singular: string, plural: string): string {
  return `${formatNumber(count)} ${count === 1 ? singular : plural}`;
}

export function parseNumberInput(value: string): number | undefined {
  const normalized = value.replace(/\./g, '').replace(',', '.').trim();
  if (!normalized) return undefined;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}
