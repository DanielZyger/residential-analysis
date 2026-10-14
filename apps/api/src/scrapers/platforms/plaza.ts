import type { TransactionType } from '@er/shared';
import { crawlListings } from '../core/crawl';
import { textOf, uniqueUrls, type Html } from '../core/html';
import { object, string, structuredBlocks } from '../core/structured';
import { normalizePropertyType } from '../core/normalize';
import { normalizeText, parseBrNumber, parseInteger } from '../../utils/text';
import type { PlatformAdapter, ScrapedProperty } from '../core/types';

export function parsePlazaDetail($: Html, url: string, transaction: TransactionType): ScrapedProperty | null {
  const product = structuredBlocks($).find((b) => [b['@type']].flat().includes('Product'));
  if (!product) return null;
  const address = object(product.address);
  if (normalizeText(string(address.addressLocality)) !== 'chapeco' || normalizeText(string(address.addressRegion)) !== 'sc') return null;
  const title = textOf($, 'h1');
  const type = normalizePropertyType(string(product.category), title);
  if (!type) return null;
  const business = string(object(product.offers).businessFunction);
  if (transaction === 'sale' ? !business?.endsWith('#Sell') : !business?.endsWith('#LeaseOut')) return null;
  const main = ($('main').length ? $('main') : $('body')).clone();
  main.find('script,style,header,footer').remove();
  const text = main.text().replace(/\s+/g, ' ');
  const count = (pattern: RegExp) => parseInteger(text.match(pattern)?.[1]);
  const money = (pattern: RegExp) => parseBrNumber(text.match(pattern)?.[1]);
  const description = $('h2').filter((_, el) => /Mais detalhes do imóvel/i.test($(el).text())).parent().clone();
  description.find('h2').remove();
  const geo = object(product.geo);
  const photos = uniqueUrls($, '[data-src*="cdn.imoview.com.br"]', 'data-src', url);
  return {
    externalId: string(product.sku) ?? url.match(/\/imovel\/(\d+)/)?.[1] ?? url, url, transaction, type,
    title: title ?? string(product.name) ?? 'Imóvel residencial', price: parseBrNumber(string(object(product.offers).price)),
    condoFee: money(/Condom.nio\s*R\$\s*([\d.,]+)/i), iptu: money(/IPTU\s*R\$\s*([\d.,]+)/i),
    privateArea: /area privativa/.test(normalizeText(text)) ? parseBrNumber(string(object(product.floorSize).value)) : null,
    totalArea: null, bedrooms: parseInteger(string(product.numberOfRooms)), suites: count(/(\d+)\s*suítes?/i),
    bathrooms: parseInteger(string(product.numberOfBathroomsTotal)), parkingSpots: count(/(\d+)\s*vagas?/i),
    neighborhood: textOf($, '.local-codigo')?.split(',')[0] ?? null, address: null,
    latitude: parseBrNumber(string(geo.latitude)) === null ? null : Number(geo.latitude),
    longitude: parseBrNumber(string(geo.longitude)) === null ? null : Number(geo.longitude),
    description: description.text().trim() || string(product.description), photos: [...new Set(photos.length ? photos : [string(product.image)].filter((p): p is string => !!p))],
    features: [],
  };
}

export const plazaAdapter: PlatformAdapter = {
  platform: 'plaza-wordpress',
  async *scrape(source, ctx) {
    yield* crawlListings({
      listUrl: (transaction, page) => `${source.website}/${transaction === 'sale' ? 'comprar' : 'alugar'}-imoveis-chapeco-sc${page > 1 ? `/pag-${page}` : ''}`,
      detailUrls: ($, base) => uniqueUrls($, 'a[href*="/imovel/"]', 'href', base).filter((u) => new URL(u).origin === new URL(base).origin && /\/imovel\/\d+\/[^/]*chapeco\/?$/.test(u)),
      accept: (url) => normalizePropertyType(new URL(url).pathname.split('/')[3]?.replace(/-/g, ' ')) !== null,
      hasNextPage: ($, base, page) => $('a[href]').toArray().some((el) => {
        const next = new URL($(el).attr('href') ?? '', base);
        return next.origin === new URL(base).origin && next.pathname.replace(/\/+$/, '').endsWith(`/pag-${page + 1}`);
      }),
      parseDetail: parsePlazaDetail,
    }, ctx);
  },
};
