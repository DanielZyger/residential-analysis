import type { TransactionType } from '@er/shared';
import { crawlListings } from '../core/crawl';
import { textOf, uniqueUrls, type Html } from '../core/html';
import { object, string, structuredBlocks } from '../core/structured';
import { normalizePropertyType } from '../core/normalize';
import { normalizeText, parseBrNumber, parseInteger } from '../../utils/text';
import type { PlatformAdapter, ScrapedProperty } from '../core/types';

export function parsePraediumDetail($: Html, url: string, transaction: TransactionType): ScrapedProperty | null {
  const product = structuredBlocks($).find((b) => [b['@type']].flat().includes('Product'));
  if (!product) return null;
  const address = object(product.address);
  if (normalizeText(string(address.addressLocality)) !== 'chapeco' || !['sc', 'santa catarina'].includes(normalizeText(string(address.addressRegion)))) return null;
  const pathname = new URL(url).pathname;
  if (transaction === 'sale' ? !pathname.includes('-a-venda-') : !pathname.includes('-para-alugar-')) return null;
  const title = textOf($, 'h1');
  const type = normalizePropertyType(title, string(product.name));
  if (!type) return null;
  const compositions = $('.composition_name').map((_, el) => $(el).text().replace(/\s+/g, ' ').trim()).get();
  const field = (pattern: RegExp) => compositions.find((value) => pattern.test(normalizeText(value)));
  const area = (pattern: RegExp) => parseBrNumber(field(pattern)?.match(/[\d.,]+/)?.[0]);
  const count = (pattern: RegExp) => parseInteger(field(pattern)?.match(/\d+/)?.[0]);
  const photos = uniqueUrls($, '[data-md-src]', 'data-md-src', url);
  const neighborhood = string(address.streetAddress)?.split(',')[0] ?? null;
  return {
    externalId: pathname.match(/-id-(\d+)/)?.[1] ?? pathname, url, transaction, type,
    title: title ?? string(product.name) ?? 'Imóvel residencial',
    price: parseBrNumber(string(object(product.offers).price)), condoFee: null, iptu: null,
    privateArea: area(/area (util|privativa|construida)/), totalArea: area(/area total/),
    bedrooms: parseInteger(string(product.numberOfBedrooms)) ?? count(/quartos?/),
    suites: count(/suites?/), bathrooms: parseInteger(string(product.numberOfBathroomsTotal)) ?? count(/banheiros?/),
    parkingSpots: count(/vagas?/), neighborhood, address: null, latitude: null, longitude: null,
    description: string(product.description), photos: [...new Set(photos.length ? photos : [string(product.image)].filter((p): p is string => !!p))],
    features: $('.composition_card').map((_, el) => $(el).text().replace(/\s+/g, ' ').trim()).get().filter((f) => !/\d/.test(f)),
  };
}

export const praediumAdapter: PlatformAdapter = {
  platform: 'praedium',
  async *scrape(source, ctx) {
    yield* crawlListings({
      listUrl: (transaction, page) => `${source.website}/imoveis/${transaction === 'sale' ? 'a-venda' : 'para-alugar'}/chapeco-sc${page > 1 ? `?pagina=${page}` : ''}`,
      detailUrls: ($, base) => uniqueUrls($, 'a[href*="/imovel/"]', 'href', base).filter((u) => new URL(u).origin === new URL(base).origin && /-chapeco-sc(?:-\d+m2)?-id-\d+/.test(u)),
      parseDetail: parsePraediumDetail,
    }, ctx);
  },
};
