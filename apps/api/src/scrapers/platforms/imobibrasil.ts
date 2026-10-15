import * as cheerio from 'cheerio';
import type { PropertyType, TransactionType } from '@er/shared';
import { crawlListings, type ListingCrawlerSpec } from '../core/crawl';
import { absoluteUrl, jsonLd, metaContent, type Html } from '../core/html';
import { iptuSnippet, parseIptu } from '../core/iptu';
import { normalizePropertyType } from '../core/normalize';
import type { PlatformAdapter, ScrapeContext, ScrapedProperty } from '../core/types';
import { cleanText, normalizeText, parseBrNumber, parseInteger } from '../../utils/text';

const CITY = 'erechim';
const TRANSACTION_PATH: Record<TransactionType, string> = { sale: 'venda', rent: 'locacao' };
const FALLBACK_TYPES = ['apartamento', 'casa'];

type Json = Record<string, unknown>;

function obj(value: unknown): Json {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Json) : {};
}

function str(value: unknown): string | null {
  return typeof value === 'string' || typeof value === 'number' ? cleanText(String(value)) : null;
}

function isAction(block: Json): boolean {
  return /action$/i.test(String(block['@type'] ?? ''));
}

function typeOfSlug(slug: string): PropertyType | null | undefined {
  return normalizePropertyType(slug.replace(/-/g, ' '));
}

async function residentialTypes(base: string, ctx: ScrapeContext): Promise<string[]> {
  try {
    const $ = cheerio.load(await ctx.http.text(`${base}/imovel/venda`));
    const slugs = $('select[name="tipo"]').first().find('option').map((_, el) => $(el).attr('value')?.trim()).get();
    const residential = [...new Set(slugs)].filter((slug) => slug && typeOfSlug(slug));
    return residential.length ? residential : FALLBACK_TYPES;
  } catch (error) {
    ctx.log.warn(`tipos indisponíveis em ${base}: ${(error as Error).message}`);
    return FALLBACK_TYPES;
  }
}

function detailUrls($: Html, listUrl: string): string[] {
  const fromLd = jsonLd($)
    .filter(isAction)
    .map((block) => obj(block.object))
    .filter((place) => normalizeText(str(obj(place.address).addressLocality)) === CITY)
    .map((place) => absoluteUrl(str(place.url) ?? undefined, listUrl));
  const fromLinks = $('a[href]')
    .map((_, el) => absoluteUrl($(el).attr('href'), listUrl))
    .get()
    .filter((u) => /\/imovel\/\d+\/[^/]*-erechim-rs-/.test(u));
  const urls = fromLd.length ? fromLd : fromLinks;
  return [...new Set(urls.filter((u): u is string => !!u))];
}

function labeledFields($: Html): [label: string, value: string][] {
  return $('p, td')
    .map((_, el) => cleanText($(el).text()))
    .get()
    .map((line) => line?.match(/^([^:]{2,40}):\s*(.+)$/))
    .filter((m): m is RegExpMatchArray => !!m)
    .map((m) => [normalizeText(m[1]), m[2].replace(/›$/, '').trim()] as [string, string]);
}

function field(fields: [string, string][], label: RegExp): string | null {
  return fields.find(([key]) => label.test(key))?.[1] ?? null;
}

function capture(text: string, pattern: RegExp): string | null {
  return text.match(pattern)?.[1] ?? null;
}

function mainText($: Html): string {
  const body = $('body').clone();
  body.find('script, style, noscript, select, header, footer, nav, [class*="outrosimoveis"]').remove();
  return body.text().replace(/\s+/g, ' ');
}

function neighborhood($: Html, name: string): string | null {
  const link = $('a.bp-lkbairro').first();
  const text = cleanText(link.clone().children().remove().end().text()) ?? capture(name, /bairro\s+([^,]+)/i);
  if (text) return text;
  const slug = link.attr('href')?.split('/').filter(Boolean).pop();
  return slug ? slug.replace(/-/g, ' ') : null;
}

function description($: Html): string | null {
  const anchor = $('#desc_descricao').first();
  const container = (anchor.is('h1, h2, h3, h4') ? anchor.nextAll('.item-imovel').first() : anchor).clone();
  container.find('h1, h2, h3, style, script, .imovel_cx_caracteristicas').remove();
  return cleanText(container.text());
}

function photos($: Html, url: string, fallback: string | null): string[] {
  const urls = $('[data-rsbigimg], img.item-lista')
    .map((_, el) => absoluteUrl($(el).attr('data-rsbigimg') ?? $(el).attr('src'), url))
    .get()
    .filter((u): u is string => !!u && /\/imagens\/imoveis\//.test(u));
  const unique = [...new Set(urls)];
  return unique.length ? unique : fallback ? [fallback] : [];
}

function parseDetail($: Html, url: string, transaction: TransactionType, type: PropertyType): ScrapedProperty | null {
  if (!/-erechim-rs-/.test(new URL(url).pathname)) return null;
  const blocks = jsonLd($);
  const product = obj(blocks.find((b) => b['@type'] === 'Product'));
  const action = obj(blocks.find(isAction));
  const place = obj(action.object);
  const name = str(product.name) ?? str(place.name) ?? '';
  const fields = labeledFields($);
  const text = mainText($);
  const number = (pattern: RegExp) => parseBrNumber(capture(name, pattern));
  const integer = (pattern: RegExp) => parseInteger(capture(name, pattern));
  return {
    externalId: field(fields, /^c.digo$/) ?? str(product.sku) ?? url.match(/\/imovel\/(\d+)/)?.[1] ?? url,
    url,
    transaction,
    type,
    title: cleanText($('title').first().text().replace(/,\s*\d.*$/, '')) ?? cleanText(name) ?? 'Imóvel residencial',
    price: parseBrNumber(str(obj(product.offers).price) ?? str(action.price)),
    condoFee: parseBrNumber(capture(text, /condom.nio\s*:?\s*R\$\s*([\d.,]+)/i)),
    ...parseIptu(field(fields, /^iptu/) ?? iptuSnippet(text)),
    privateArea: number(/.rea (?:.til|privativa|constru.da)\s*([\d.,]+)/i) ?? parseBrNumber(field(fields, /^.rea (.til|privativa|constru.da)/)),
    totalArea: number(/(?:.rea total|terreno)\s*([\d.,]+)/i) ?? parseBrNumber(field(fields, /^.rea (total|terreno)/)),
    bedrooms: integer(/(\d+)\s*dormit/i) ?? parseInteger(field(fields, /^dormit/)),
    suites: integer(/(\d+)\s*su.tes?/i) ?? parseInteger(field(fields, /^su.tes?$/)),
    bathrooms: integer(/(\d+)\s*banheiro/i) ?? parseInteger(field(fields, /^banheiro/)),
    parkingSpots: integer(/(\d+)\s*vagas?/i) ?? parseInteger(field(fields, /^vagas?/)),
    neighborhood: neighborhood($, name),
    address: str(obj(place.address).streetAddress) ?? field(fields, /^endere.o$/),
    latitude: null,
    longitude: null,
    description: description($),
    photos: photos($, url, str(place.image) ?? metaContent($, 'og:image')),
    features: $('.imovel_cx_caracteristicas .cxItem').map((_, el) => cleanText($(el).text())).get().filter((f): f is string => !!f),
  };
}

function typeSpec(base: string, slug: string, type: PropertyType): ListingCrawlerSpec {
  return {
    listUrl: (transaction, page) => `${base}/imovel/${TRANSACTION_PATH[transaction]}/${slug}/${CITY}${page > 1 ? `/?pag=${page}` : ''}`,
    detailUrls,
    parseDetail: ($, url, transaction) => parseDetail($, url, transaction, type),
  };
}

export const imobibrasilAdapter: PlatformAdapter = {
  platform: 'imobibrasil',
  async *scrape(source, ctx) {
    const base = source.website.replace(/\/+$/, '');
    for (const slug of await residentialTypes(base, ctx)) {
      const type = typeOfSlug(slug);
      if (type) yield* crawlListings(typeSpec(base, slug, type), ctx);
    }
  },
};
