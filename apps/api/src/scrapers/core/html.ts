import { CITY_SLUG } from '@er/shared';
import * as cheerio from 'cheerio';
import type { PropertyType } from '@er/shared';
import { cleanText, normalizeText, parseBrNumber, parseInteger } from '../../utils/text';
import { normalizePropertyType } from './normalize';
import type { ScrapedProperty } from './types';

export type Html = cheerio.CheerioAPI;

export function absoluteUrl(href: string | undefined, base: string): string | null {
  if (!href) return null;
  try {
    return new URL(href, base).href;
  } catch {
    return null;
  }
}

export function textOf($: Html, selector: string): string | null {
  const value = $(selector).first().text().replace(/\s+/g, ' ').trim();
  return value || null;
}

export function jsonLd($: Html): Record<string, unknown>[] {
  const blocks: Record<string, unknown>[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const parsed = JSON.parse($(el).text());
      blocks.push(...(Array.isArray(parsed) ? parsed : [parsed]));
    } catch {
      return;
    }
  });
  return blocks;
}

export function metaContent($: Html, name: string): string | null {
  return $(`meta[property="${name}"], meta[name="${name}"]`).attr('content')?.trim() || null;
}

export type Facts = Map<string, string>;

type FactFields = Pick<
  ScrapedProperty,
  'price' | 'condoFee' | 'iptu' | 'privateArea' | 'totalArea' | 'bedrooms' | 'suites' | 'bathrooms' | 'parkingSpots'
>;

export function setFact(facts: Facts, label: string | null | undefined, value: string | null | undefined): void {
  const key = normalizeText(label).replace(/[:\s]+$/, '');
  const text = cleanText(value);
  if (key && text) facts.set(key, text);
}

function fact(facts: Facts, ...patterns: RegExp[]): string | null {
  const entries = [...facts].reverse();
  for (const pattern of patterns) {
    const found = entries.find(([label]) => pattern.test(label));
    if (found) return found[1];
  }
  return null;
}

function money(value: string | null): number | null {
  const match = value?.match(/R\$\s*([\d.,]+)/);
  return match ? parseBrNumber(match[1]) : null;
}

export function factFields(facts: Facts): FactFields {
  const count = (...patterns: RegExp[]) => parseInteger(fact(facts, ...patterns));
  const area = (...patterns: RegExp[]) => parseBrNumber(fact(facts, ...patterns));
  return {
    price: money(fact(facts, /^(venda|aluguel|valor do aluguel|valor do imovel|preco)$/)),
    condoFee: money(fact(facts, /^condominio/)),
    iptu: money(fact(facts, /^iptu/)),
    privateArea: area(/^area privativa/, /^area (construida|util)/),
    totalArea: area(/^area total/, /^area (do )?terreno( total)?$/),
    bedrooms: count(/^(dormitorio|quarto)/),
    suites: count(/^suite/),
    bathrooms: count(/^banheiro/),
    parkingSpots: count(/^(vaga|garagem)/),
  };
}

export function residentialType(...hints: (string | null | undefined)[]): PropertyType | null {
  return normalizePropertyType(...hints.map((hint) => hint?.replace(/-/g, ' '))) ?? null;
}

export function isTargetCity(value: string | null | undefined): boolean {
  return new RegExp(`^${CITY_SLUG}(?:\\s*[-/]\\s*sc)?$`).test(normalizeText(value));
}

export function documentBase($: Html, url: string): string {
  return absoluteUrl($('base').attr('href'), url) ?? url;
}

export function texts($: Html, selector: string): string[] {
  return $(selector)
    .map((_, el) => cleanText($(el).text()))
    .get()
    .filter((t): t is string => !!t);
}

export function uniqueUrls($: Html, selector: string, attribute: string, base: string): string[] {
  const urls = $(selector)
    .map((_, el) => absoluteUrl($(el).attr(attribute), base))
    .get()
    .filter((u): u is string => !!u);
  return [...new Set(urls)];
}
