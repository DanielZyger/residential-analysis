import * as cheerio from 'cheerio';
import type { TransactionType } from '@er/shared';
import { absoluteUrl, type Html } from '../core/html';
import { normalizePropertyType } from '../core/normalize';
import { cleanText, normalizeText, parseBrNumber, parseInteger } from '../../utils/text';
import type { PlatformAdapter, ScrapedProperty } from '../core/types';

export function parseCimCards($: Html, base: string, transaction: TransactionType): ScrapedProperty[] {
  const properties: ScrapedProperty[] = [];
  $('a.property-link').each((_, el) => {
    const card = $(el);
    const location = cleanText(card.find('.property-location').text());
    if (!location || !/ - chapeco - sc$/.test(normalizeText(location))) return;
    if (card.attr(`data-property-for-${transaction === 'sale' ? 'sale' : 'rent'}`) !== 'yes') return;
    const type = normalizePropertyType(card.attr('data-property-type'), card.find('.property-type').text());
    const url = absoluteUrl(card.attr('href'), base);
    if (!type || !url || new URL(url).origin !== new URL(base).origin) return;
    const facts = new Map<string, string>();
    card.find('.feature').each((_, feature) => { facts.set(normalizeText($(feature).find('.feature-name').text()), $(feature).find('.feature-value').text()); });
    const fact = (pattern: RegExp) => [...facts].find(([label]) => pattern.test(label))?.[1];
    properties.push({
      externalId: card.attr('data-property-id') ?? url, url, transaction, type,
      title: cleanText(card.find('.property-name').text()) ?? 'Imóvel residencial',
      price: parseBrNumber(card.attr(`data-property-${transaction === 'sale' ? 'sales' : 'rent'}-price`)), condoFee: null, iptu: null,
      privateArea: parseBrNumber(fact(/area (privativa|construida|util)/)), totalArea: parseBrNumber(fact(/area total/)),
      bedrooms: parseInteger(card.attr('data-property-bedrooms')), suites: parseInteger(fact(/suite/)),
      bathrooms: parseInteger(fact(/banheiro/)), parkingSpots: parseInteger(fact(/vaga|garagem/)),
      neighborhood: location.replace(/\s+-\s+Chapecó\s+-\s+SC$/i, ''), address: null, latitude: null, longitude: null,
      description: cleanText(card.find('.property.resume').text()),
      photos: [...new Set(card.find('img[src]').map((_, img) => absoluteUrl($(img).attr('src'), base)).get().filter((p): p is string => !!p))], features: [],
    });
  });
  return properties;
}

export const cimAdapter: PlatformAdapter = {
  platform: 'cim-1wd',
  async *scrape(source, ctx) {
    const $ = cheerio.load(await ctx.http.text(`${source.website}/imoveis`));
    if (!$('a.property-link').length) throw new Error('Nenhum card CIM encontrado; conferir formato da listagem');
    for (const transaction of ctx.transactions) yield* parseCimCards($, source.website, transaction);
  },
};
