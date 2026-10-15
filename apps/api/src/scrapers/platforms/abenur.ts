import type { TransactionType } from '@er/shared';
import { crawlListings, type ListingCrawlerSpec } from '../core/crawl';
import { documentBase, factFields, insideErechim, metaContent, residentialType, setFact, textOf, texts, uniqueUrls, type Facts, type Html } from '../core/html';
import type { PlatformAdapter, ScrapedProperty } from '../core/types';
import { cleanText } from '../../utils/text';

const LISTING_TYPES = ['casa', 'apartamento'];
const ICON_LABELS: [string, string][] = [
  ['M2 17v-4', 'dormitorios'],
  ['M4 12V6', 'banheiros'],
  ['M19 17h2', 'vagas'],
];

interface Coordinates {
  latitude: number | null;
  longitude: number | null;
}

function coordinates($: Html): Coordinates {
  const match = $('.imovel__mapa iframe').attr('src')?.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/);
  return match ? { latitude: Number(match[1]), longitude: Number(match[2]) } : { latitude: null, longitude: null };
}

function setSpec(facts: Facts, icon: string, text: string): void {
  const iconLabel = ICON_LABELS.find(([prefix]) => icon.startsWith(prefix))?.[1];
  if (iconLabel) return setFact(facts, iconLabel, text);
  const area = text.match(/^(.*?)\s+([\d.,]+\s*m²)/);
  if (area) setFact(facts, area[1], area[2]);
}

function detailFacts($: Html): Facts {
  const facts: Facts = new Map();
  $('.imovel__specs li.spec').each((_, el) => setSpec(facts, $(el).find('path').attr('d') ?? '', $(el).text().trim()));
  setFact(facts, 'preco', textOf($, '.imovel__price'));
  return facts;
}

function neighborhood($: Html, title: string): string | null {
  const location = textOf($, '.imovel__loc')?.split('·')[0];
  return cleanText(location) ?? cleanText(title.match(/\b(?:bairro|loteamento)\s+(.+?)(?:\s+-|$)/i)?.[1]) ?? (/\bcentro\b/i.test(title) ? 'Centro' : null);
}

function photos($: Html, url: string): string[] {
  const found = uniqueUrls($, '.gallery__thumb[data-media]', 'data-media', documentBase($, url));
  const cover = metaContent($, 'og:image');
  return found.length || !cover ? found : [cover];
}

function parseDetail($: Html, url: string, transaction: TransactionType): ScrapedProperty | null {
  const title = textOf($, 'h1.imovel__title') ?? '';
  const type = residentialType(title, textOf($, '.imovel__media .card__badge'));
  const position = coordinates($);
  if (!type || !insideErechim(position.latitude, position.longitude)) return null;
  return {
    externalId: textOf($, '.imovel__media .card__code') ?? url.split('-').pop() ?? url,
    url,
    transaction,
    type,
    title,
    ...factFields(detailFacts($)),
    neighborhood: neighborhood($, title),
    address: null,
    ...position,
    description: cleanText(texts($, '.imovel__desc p').join(' ')),
    photos: photos($, url),
    features: [],
  };
}

function spec(website: string, listingType: string): ListingCrawlerSpec {
  return {
    listUrl: (_, page) => new URL(`/imoveis/inicio/tipo/${listingType}${page > 1 ? `/pagina/${page}` : ''}`, website).href,
    detailUrls: ($, listUrl) => uniqueUrls($, 'article.card a.card__link', 'href', documentBase($, listUrl)),
    parseDetail,
  };
}

export const abenurAdapter: PlatformAdapter = {
  platform: 'abenur',
  async *scrape(source, ctx) {
    const saleOnly = { ...ctx, transactions: ctx.transactions.filter((t) => t === 'sale') };
    for (const listingType of LISTING_TYPES) yield* crawlListings(spec(source.website, listingType), saleOnly);
  },
};
