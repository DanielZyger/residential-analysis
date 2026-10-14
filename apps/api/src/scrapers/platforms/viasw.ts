import type { TransactionType } from '@er/shared';
import { crawlListings, type ListingCrawlerSpec } from '../core/crawl';
import { documentBase, factFields, isErechim, metaContent, residentialType, setFact, textOf, texts, uniqueUrls, type Facts, type Html } from '../core/html';
import type { PlatformAdapter, ScrapedProperty } from '../core/types';

const PATH_SEGMENT = { type: 2, neighborhood: 3, city: 4, id: 6 } as const;

function segment(url: string, key: keyof typeof PATH_SEGMENT): string {
  return decodeURIComponent(new URL(url).pathname.split('/').filter(Boolean)[PATH_SEGMENT[key]] ?? '');
}

function isWanted(url: string): boolean {
  return !!residentialType(segment(url, 'type')) && isErechim(segment(url, 'city'));
}

function detailUrls($: Html, listUrl: string): string[] {
  return uniqueUrls($, 'a.link-imovel', 'href', documentBase($, listUrl));
}

function place($: Html): { neighborhood: string; city: string } | null {
  const match = metaContent($, 'og:title')?.match(/,\s*([^,]+?)\s+-\s+([^-]+?)\s+-\s+[A-Z]{2}\s*$/);
  return match ? { neighborhood: match[1], city: match[2] } : null;
}

function detailFacts($: Html): Facts {
  const facts: Facts = new Map();
  $('.custom-feature-box').each((_, el) => setFact(facts, $(el).find('small').text(), $(el).find('h5').text()));
  $('.valor-esq').each((_, el) => setFact(facts, $(el).text(), $(el).siblings('.valor-dir').text()));
  return facts;
}

function parseDetail($: Html, url: string, transaction: TransactionType): ScrapedProperty | null {
  const type = residentialType(segment(url, 'type'));
  const location = place($);
  if (!type || !isErechim(location?.city ?? segment(url, 'city'))) return null;
  return {
    externalId: segment(url, 'id'),
    url,
    transaction,
    type,
    title: textOf($, '.custom-title span') ?? metaContent($, 'og:title') ?? segment(url, 'type'),
    ...factFields(detailFacts($)),
    neighborhood: location?.neighborhood ?? segment(url, 'neighborhood').replace(/-/g, ' '),
    address: null,
    latitude: null,
    longitude: null,
    description: textOf($, '.custom-description-text'),
    photos: uniqueUrls($, '#imovel a.imgFancy', 'href', documentBase($, url)),
    features: texts($, '.imovel-caracteristicas > div'),
  };
}

function spec(website: string): ListingCrawlerSpec {
  return {
    listUrl: (transaction, page) => new URL(`/Imoveis/${transaction === 'sale' ? 'Venda' : 'Locacao'}/${page}`, website).href,
    detailUrls,
    accept: isWanted,
    parseDetail,
  };
}

export const viaswAdapter: PlatformAdapter = {
  platform: 'viasw',
  async *scrape(source, ctx) {
    yield* crawlListings(spec(source.website), ctx);
  },
};
