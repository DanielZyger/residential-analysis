import { CITY_SLUG } from '@er/shared';
import type { PropertyType, TransactionType } from '@er/shared';
import { crawlListings, type ListingCrawlerSpec } from '../core/crawl';
import { metaContent, textOf, uniqueUrls, type Html } from '../core/html';
import { normalizePropertyType } from '../core/normalize';
import type { PlatformAdapter, ScrapedProperty } from '../core/types';
import { cleanText, normalizeText, parseBrNumber, parseInteger } from '../../utils/text';

const CITY = CITY_SLUG;
const TRANSACTION_PATH: Record<TransactionType, string> = { sale: 'comprar-imoveis', rent: 'alugar-imoveis' };
const CATEGORIES: [slug: string, fallback: PropertyType][] = [
  [ `apartamentos-${CITY}`, 'apartment'],
  [ `casas-${CITY}`, 'house'],
];
const RESIDENTIAL_WORD = /\b(casa|apartamento|apto|sobrado|cobertura|kitnet|kitinete|studio|loft)\b/;

interface Listing {
  city: string;
  type: PropertyType | null | undefined;
}

function classify(url: string): Listing | null {
  const segment = new URL(url).pathname.split('/')[2] ?? '';
  const at = segment.lastIndexOf('-em-');
  if (at < 0) return null;
  const kind = segment
    .slice(0, at)
    .replace(/^(venda|locacao(-anual|-temporada|-diaria)?)-/, '')
    .replace(/-\d+-dorm.*$/, '')
    .split('-')
    .map((word) => word.replace(/s$/, ''))
    .join(' ');
  return { city: segment.slice(at + 4), type: normalizePropertyType(kind) };
}

function resolveType(url: string, fallback: PropertyType): PropertyType | null {
  const listing = classify(url);
  if (!listing || listing.city !== CITY || listing.type === null) return null;
  return listing.type ?? fallback;
}

function isNonResidentialTitle(title: string): boolean {
  return normalizePropertyType(title) === null && !RESIDENTIAL_WORD.test(normalizeText(title));
}

function parseAddress(value: string | null): { address: string | null; neighborhood: string | null; city: string | null } {
  const match = value?.match(/^(.*?)\s+-\s+([^/]+?)\s*\/\s*[A-Z]{2}\s*$/);
  if (!match) return { address: null, neighborhood: null, city: null };
  const parts = match[1].split(',').map((part) => part.trim()).filter(Boolean);
  const neighborhood = parts.pop() ?? null;
  return { address: cleanText(parts.join(', ')), neighborhood, city: match[2] };
}

function money(text: string | null, label: RegExp): number | null {
  const match = text?.match(new RegExp(`${label.source}\\s*:?\\s*R\\$\\s*([\\d.,]+)`, 'i'));
  return match ? parseBrNumber(match[1]) : null;
}

function count(text: string | null, pattern: RegExp): number | null {
  const match = text?.match(pattern);
  return match ? parseInteger(match[1]) : null;
}

function specs($: Html): [label: string, value: string][] {
  return $('.property-description ul.listing-features')
    .first()
    .children('li')
    .map((_, el) => `${normalizeText($(el).clone().children('span').remove().end().text())}\t${cleanText($(el).children('span').text()) ?? ''}`)
    .get()
    .map((line) => line.split('\t') as [string, string]);
}

function spec(entries: [string, string][], label: RegExp, exclude?: RegExp): string | null {
  return entries.find(([key]) => label.test(key) && !exclude?.test(key))?.[1] ?? null;
}

function description($: Html): string | null {
  const container = $('#el-descricao-textos').first().clone();
  container.find('script, style').remove();
  container.find('h3, p, br, .card-body').after(' ');
  return cleanText(container.text());
}

function parseDetail($: Html, url: string, transaction: TransactionType, fallback: PropertyType): ScrapedProperty | null {
  const type = resolveType(url, fallback);
  if (!type) return null;
  const location = parseAddress(textOf($, '.sp-address-property'));
  if (location.city && normalizeText(location.city) !== CITY) return null;
  const heading = $('.property-title h2').first().clone();
  const code = cleanText(heading.find('.imovel-codigo').text())?.replace(/^C.d\.?\s*/i, '');
  heading.find('.imovel-codigo').remove();
  const title = cleanText(heading.text()) ?? 'Imóvel residencial';
  if (isNonResidentialTitle(title)) return null;
  const rooms = textOf($, '.property-title .listing-address > span');
  const pricing = textOf($, '.property-pricing');
  const entries = specs($);
  const photos = uniqueUrls($, '[data-exthumbimage][data-src]', 'data-src', url);
  const ogImage = metaContent($, 'og:image');
  return {
    externalId: code || url.split('/').filter(Boolean).pop() || url,
    url,
    transaction,
    type,
    title,
    price: parseBrNumber(textOf($, '.property-pricing .value-real-number')),
    condoFee: money(pricing, /condom.nio/),
    iptu: money(pricing, /iptu/),
    privateArea: parseBrNumber(spec(entries, /privativa|constru|util/)),
    totalArea: parseBrNumber(spec(entries, /area|terreno/, /privativa|constru|util/)),
    bedrooms: count(rooms, /(\d+)\s*dorm/i),
    suites: count(rooms, /(\d+)\s*su.te/i),
    bathrooms: parseInteger(spec(entries, /banheiro/)),
    parkingSpots: parseInteger(spec(entries, /vaga/)),
    neighborhood: location.neighborhood,
    address: location.address,
    latitude: null,
    longitude: null,
    description: description($),
    photos: photos.length ? photos : ogImage ? [ogImage] : [],
    features: $('.property-features li').map((_, el) => cleanText($(el).text())).get().filter((f): f is string => !!f),
  };
}

function categorySpec(base: string, category: string, fallback: PropertyType): ListingCrawlerSpec {
  return {
    listUrl: (transaction, page) => `${base}/${TRANSACTION_PATH[transaction]}/${category}/${page > 1 ? `&pg=${page}` : ''}`,
    detailUrls: ($, listUrl) => uniqueUrls($, '.listing-item a.listing-img-container', 'href', listUrl),
    accept: (url) => resolveType(url, fallback) !== null,
    parseDetail: ($, url, transaction) => parseDetail($, url, transaction, fallback),
  };
}

export const sigahostClassicAdapter: PlatformAdapter = {
  platform: 'sigahost-classic',
  async *scrape(source, ctx) {
    const base = source.website.replace(/\/+$/, '');
    for (const [category, fallback] of CATEGORIES) {
      yield* crawlListings(categorySpec(base, category, fallback), ctx);
    }
  },
};
