import * as cheerio from 'cheerio';
import type { TransactionType } from '@er/shared';
import { absoluteUrl, type Html } from '../core/html';
import { normalizePropertyType } from '../core/normalize';
import { cleanText, normalizeText, parseBrNumber, parseInteger } from '../../utils/text';
import type { PlatformAdapter, ScrapedProperty } from '../core/types';

export function parseExataCards($: Html, base: string, transaction: TransactionType): ScrapedProperty[] {
  const properties: ScrapedProperty[] = [];
  $('a.site-card').each((_, el) => {
    const card = $(el);
    const location = cleanText(card.find('.site-card-loc').text());
    const match = location?.match(/^(.+),\s*([^/]+)\/([A-Z]{2})$/i);
    if (!match || normalizeText(match[2]) !== 'chapeco' || match[3].toUpperCase() !== 'SC') return;
    const operation = normalizeText(card.find('.site-card-fin').text());
    if (transaction === 'sale' ? operation !== 'venda' : !/^(aluguel|locacao)$/.test(operation)) return;
    const title = cleanText(card.find('.site-card-title').text());
    const type = normalizePropertyType(title);
    const url = absoluteUrl(card.attr('href'), base);
    if (!type || !url || new URL(url).origin !== new URL(base).origin) return;
    const specs = cleanText(card.find('.site-card-spec').text()) ?? '';
    const count = (pattern: RegExp) => parseInteger(specs.match(pattern)?.[1]);
    const area = (pattern: RegExp) => parseBrNumber(specs.match(pattern)?.[1]);
    const explicitPrivate = area(/(?:privativa|construída|útil)\s*([\d.,]+)\s*m²/i);
    const unlabeledArea = area(/(?:^|·)\s*([\d.,]+)\s*m²/i);
    properties.push({
      externalId: cleanText(card.find('.site-card-cod').text())?.replace(/^Cód\.\s*/i, '') ?? new URL(url).pathname.slice(1),
      url, transaction, type, title: title ?? 'Imóvel residencial', price: parseBrNumber(card.find('.site-card-price').text()),
      condoFee: null, iptu: null, privateArea: explicitPrivate,
      // Uma metragem sem rótulo fica como área total; não presumir área privativa de casas.
      totalArea: area(/terreno\s*([\d.,]+)\s*m²/i) ?? (type === 'apartment' || type === 'penthouse' || type === 'studio' ? unlabeledArea : null),
      bedrooms: count(/(\d+)\s*q\b/), suites: count(/(\d+)\s*suítes?/i),
      bathrooms: count(/(\d+)\s*ban\b/), parkingSpots: count(/(\d+)\s*vagas?/i),
      neighborhood: match[1], address: null, latitude: null, longitude: null, description: null,
      photos: card.find('img[src]').map((_, img) => absoluteUrl($(img).attr('src'), base)).get().filter((p): p is string => !!p), features: [],
    });
  });
  return properties;
}

export const exataAdapter: PlatformAdapter = {
  platform: 'exata-catalog',
  async *scrape(source, ctx) {
    for (const transaction of ctx.transactions) {
      // O catálogo público consultado da Exata é exclusivamente de venda.
      if (transaction !== 'sale') continue;
      const seen = new Set<string>();
      for (let page = 1; page <= ctx.maxPages; page++) {
        const url = `${source.website}/imoveis${page > 1 ? `?p=${page}` : ''}`;
        const $ = cheerio.load(await ctx.http.text(url));
        if (!$('a.site-card').length) {
          if (page === 1) throw new Error('Nenhum card Exata encontrado; conferir formato da listagem');
          break;
        }
        const fresh = parseExataCards($, source.website, transaction).filter((p) => !seen.has(p.url));
        for (const property of fresh) { seen.add(property.url); yield property; }
        const next = $('a[href]').map((_, el) => $(el).attr('href')).get().some((href) => new URL(href, url).searchParams.get('p') === String(page + 1));
        if (!next) break;
      }
    }
  },
};
