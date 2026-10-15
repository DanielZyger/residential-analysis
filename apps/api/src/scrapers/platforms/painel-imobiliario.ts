import * as cheerio from 'cheerio';
import { crawlDetails } from '../core/crawl';
import { factFields, isErechim, metaContent, residentialType, setFact, textOf, uniqueUrls, type Facts, type Html } from '../core/html';
import { normalizeTransaction } from '../core/normalize';
import type { PlatformAdapter, ScrapeContext, ScrapedProperty } from '../core/types';
import { cleanText, normalizeText } from '../../utils/text';

type Element = Parameters<Html>[0];

const RESIDENTIAL_CATEGORIES = new Set(['apartamentos', 'casas', 'casas-em-condominios', 'duplex', 'kitinetes--jk', 'coberturas', 'sobrados']);
const CORE_FACT = /^(codigo|finalidade|tipo|dormitorio|suite|banheiro|area|vaga|box|qtd\. box|medida)/;

function urlPart(url: string, index: number): string {
  return new URL(url).pathname.split('/').filter(Boolean)[index] ?? '';
}

function isWanted(url: string): boolean {
  return urlPart(url, 0) === 'imovel' && isErechim(urlPart(url, 1)) && RESIDENTIAL_CATEGORIES.has(urlPart(url, 2));
}

function sitemapUrls(xml: string): string[] {
  const $ = cheerio.load(xml, { xml: true });
  return $('loc')
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(isWanted);
}

function factEntries($: Html): [string, string][] {
  return $('.site-property-details .box-price._display-desktop .code1 font, #site-characteristics li font, .site-property-details .box-info p.info font')
    .map((_, el) => [[$(el).text(), followingText($, el)]])
    .get() as [string, string][];
}

function stripMarker(value: string): string {
  return value.replace(/^[\s›\u009b]+/, '').trim();
}

function followingText($: Html, el: Element): string {
  const next = $(el).get(0)?.nextSibling;
  return next && 'data' in next ? stripMarker(String(next.data)) : '';
}

function detailFacts($: Html, entries: [string, string][]): Facts {
  const facts: Facts = new Map();
  entries.forEach(([label, value]) => setFact(facts, label, value));
  setFact(facts, 'preco', textOf($, '.site-property-details .box-price._display-desktop .price'));
  return facts;
}

function features(entries: [string, string][]): string[] {
  const extras = entries.filter(([label, value]) => {
    const key = normalizeText(label);
    return !CORE_FACT.test(key) && !/^(localizacao|descricao|ler mais)/.test(key) && !/^(nao|0)$/i.test(value);
  });
  return [...new Set(extras.map(([label, value]) => `${cleanText(label)}: ${value}`))];
}

function description($: Html): string | null {
  const info = cleanText($('.site-property-details .box-info p.info').first().text()) ?? '';
  return cleanText(stripMarker(info.split(/Descrição/)[1] ?? ''));
}

function parseDetail($: Html, url: string, transactions: ScrapeContext['transactions']): ScrapedProperty | null {
  const entries = factEntries($);
  const facts = detailFacts($, entries);
  const transaction = normalizeTransaction(facts.get('finalidade'));
  const type = residentialType(facts.get('tipo'), urlPart(url, 2));
  const [neighborhood, city] = (facts.get('localizacao') ?? '').split(/\s+-\s+/);
  if (!transaction || !transactions.includes(transaction) || !type || !isErechim(city ?? urlPart(url, 1))) return null;
  return {
    externalId: facts.get('codigo do imovel') ?? urlPart(url, 3),
    url,
    transaction,
    type,
    title: cleanText(metaContent($, 'og:title')?.split('|')[0]) ?? facts.get('tipo') ?? url,
    ...factFields(facts),
    neighborhood: cleanText(neighborhood),
    address: null,
    latitude: null,
    longitude: null,
    description: description($),
    photos: uniqueUrls($, 'a[data-fancybox="galleryNEW"]', 'href', url),
    features: features(entries),
  };
}

export const painelImobiliarioAdapter: PlatformAdapter = {
  platform: 'painel-imobiliario',
  async *scrape(source, ctx) {
    const urls = sitemapUrls(await ctx.http.text(new URL('/sitemap.xml', source.website).href));
    yield* crawlDetails(urls, ($, url) => parseDetail($, url, ctx.transactions), ctx);
  },
};
