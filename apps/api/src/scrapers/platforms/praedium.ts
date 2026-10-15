import type { TransactionType } from '@er/shared';
import { cleanText, parseInteger } from '../../utils/text';
import { crawlListings, type ListingCrawlerSpec } from '../core/crawl';
import { documentBase, factFields, isErechim, metaContent, residentialType, setFact, textOf, texts, uniqueUrls, type Facts, type Html } from '../core/html';
import { builtAreaFromText } from '../core/textAreas';
import type { PlatformAdapter, ScrapedProperty } from '../core/types';

interface ProductLd {
  name?: string;
  description?: string;
  numberOfBedrooms?: number;
  numberOfBathroomsTotal?: number;
  offers?: { price?: number };
}

const TRANSACTION_PATH: Record<TransactionType, string> = { sale: 'a-venda', rent: 'para-alugar' };
const COMPOSITION = /^([\d.,]+)\s*(?:m²)?\s*(.+)$/i;

function slugOf(url: string): string {
  return new URL(url).pathname.split('/').filter(Boolean).pop() ?? '';
}

function slugType(url: string): string | null {
  return slugOf(url).match(/^(.+?)-(?:a-venda|para-alugar)-/)?.[1] ?? null;
}

function isWanted(url: string): boolean {
  return !!residentialType(slugType(url)) && slugOf(url).includes('-erechim-rs');
}

function detailUrls($: Html, listUrl: string): string[] {
  return uniqueUrls($, 'a[href*="/imovel/"]', 'href', documentBase($, listUrl));
}

function isProduct(block: Record<string, unknown>): boolean {
  return [block['@type']].flat().includes('Product');
}

function productLd($: Html): ProductLd {
  for (const el of $('script[type="application/ld+json"]').toArray()) {
    try {
      const parsed = JSON.parse($(el).text().replace(/[\u0000-\u001f]+/g, ' ')) as Record<string, unknown>;
      if (isProduct(parsed)) return parsed as ProductLd;
    } catch {
      continue;
    }
  }
  return {};
}

function ownText(node: ReturnType<Html>): string | null {
  return cleanText(node.first().clone().children().remove().end().text());
}

function detailFacts($: Html): Facts {
  const facts: Facts = new Map();
  $('.rolling_card .transaction_text').each((_, el) => setFact(facts, ownText($(el)), ownText($(el).find('.transaction_parcel'))));
  texts($, '.composition_name').forEach((text) => {
    const match = text.match(COMPOSITION);
    if (match) setFact(facts, match[2].replace(/constru[ií]da/i, 'privativa'), match[1]);
  });
  return facts;
}

function parseDetail($: Html, url: string, transaction: TransactionType): ScrapedProperty | null {
  const type = residentialType(slugType(url));
  const place = textOf($, '#main_heading .address_line');
  if (!type || !isErechim(place ?? slugOf(url))) return null;
  const ld = productLd($);
  const fields = factFields(detailFacts($));
  const description = textOf($, '.pro_det') ?? cleanText(ld.description);
  return {
    externalId: slugOf(url).match(/-id-(\d+)$/)?.[1] ?? slugOf(url),
    url,
    transaction,
    type,
    title: ownText($('#main_heading')) ?? cleanText(ld.name) ?? metaContent($, 'og:title') ?? slugOf(url),
    ...fields,
    price: ld.offers?.price ?? fields.price,
    privateArea: fields.privateArea ?? builtAreaFromText(description),
    bedrooms: fields.bedrooms ?? parseInteger(ld.numberOfBedrooms),
    bathrooms: fields.bathrooms ?? parseInteger(ld.numberOfBathroomsTotal),
    neighborhood: cleanText(place?.split(',')[0]),
    address: null,
    latitude: null,
    longitude: null,
    description,
    photos: uniqueUrls($, '.property-gallery-row source[type="image/jpeg"]', 'data-md-src', url),
    features: texts($, '.characteristic-tag'),
  };
}

function spec(website: string): ListingCrawlerSpec {
  return {
    listUrl: (transaction, page) => new URL(`/imoveis/${TRANSACTION_PATH[transaction]}/erechim-rs?pagina=${page}`, website).href,
    detailUrls,
    accept: isWanted,
    parseDetail,
  };
}

export const praediumAdapter: PlatformAdapter = {
  platform: 'praedium',
  async *scrape(source, ctx) {
    yield* crawlListings(spec(source.website), ctx);
  },
};
