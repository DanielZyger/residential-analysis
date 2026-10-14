import * as cheerio from 'cheerio';
import type { TransactionType } from '@er/shared';
import { jsonLd, textOf, uniqueUrls, type Html } from '../core/html';
import { normalizePropertyType } from '../core/normalize';
import { normalizeText, parseBrNumber, parseInteger } from '../../utils/text';
import type { PlatformAdapter, ScrapedProperty } from '../core/types';

export function parseCode49Detail($: Html, url: string, transaction: TransactionType): ScrapedProperty | null {
  const field = (id: string) => textOf($, `.c49mod-property-infos-basic #${id} > div:last-child`);
  if (normalizeText(field('cidade')) !== 'chapeco - sc') return null;
  const type = normalizePropertyType(field('tipodeimovel'));
  if (!type || normalizeText(field('finalidade')) !== 'residencial') return null;
  const operation = normalizeText(field('transacao'));
  if (transaction === 'sale' ? !operation.includes('venda') : !/loca|alug/.test(operation)) return null;
  const graph = jsonLd($).flatMap((b) => Array.isArray(b['@graph']) ? b['@graph'] as Record<string, unknown>[] : [b]);
  const listing = graph.find((b) => b['@type'] === 'RealEstateListing');
  const offers = listing?.offers as { price?: number } | undefined;
  const numbers = textOf($, '.c49mod-property-infos-basic .c49-property-features') ?? '';
  const count = (pattern: RegExp) => parseInteger(numbers.match(pattern)?.[1]);
  const prices = new Map<string, number | null>();
  $('.c49-property-price').each((_, el) => {
    const label = normalizeText($(el).find('.c49-property-price-title').text());
    const value = parseBrNumber($(el).find('.c49-property-price-value').text());
    prices.set(label, value);
  });
  const money = (pattern: RegExp) => [...prices].find(([label]) => pattern.test(label))?.[1] ?? null;
  const area = (id: string) => parseBrNumber(field(id)?.match(/[\d.,]+/)?.[0]);
  const price = money(transaction === 'sale' ? /venda/ : /loca|alug/);
  return {
    externalId: new URL(url).pathname.split('/')[1], url, transaction, type,
    title: textOf($, '.property-title') ?? 'Imóvel residencial',
    price: price ?? (!operation.includes('venda') || !/loca|alug/.test(operation) ? offers?.price ?? null : null),
    condoFee: money(/condominio/), iptu: money(/iptu/),
    privateArea: area('areaprivativa'), totalArea: area('areatotal'),
    bedrooms: count(/(\d+)\s*quarto/i), suites: count(/(\d+)\s*suíte/i),
    bathrooms: count(/(\d+)\s*banh/i), parkingSpots: count(/(\d+)\s*vaga/i),
    neighborhood: field('bairro'), address: null, latitude: null, longitude: null,
    description: textOf($, '.property-description'),
    photos: uniqueUrls($, '[data-foto]', 'data-foto', url), features: [],
  };
}

export const code49Adapter: PlatformAdapter = {
  platform: 'code49',
  async *scrape(source, ctx) {
    const $ = cheerio.load(await ctx.http.text(`${source.website}/sitemap.xml`), { xmlMode: true });
    const urls = [...new Set($('url > loc').map((_, el) => $(el).text().trim()).get())]
      .filter((u) => new URL(u).origin === new URL(source.website).origin && /\/\d+\/imoveis\/.*-chapeco-sc$/.test(u));
    for (const transaction of ctx.transactions) {
      const operation = transaction === 'sale' ? /\/imoveis\/venda-/ : /\/imoveis\/(?:venda-)?locacao-/;
      const selected = urls.filter((u) => operation.test(u)).slice(0, ctx.maxPages * 24);
      for (const url of selected) {
        const property = parseCode49Detail(cheerio.load(await ctx.http.text(url)), url, transaction);
        if (property) yield property;
      }
    }
  },
};
