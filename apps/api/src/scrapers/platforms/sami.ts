import type { PropertyType, TransactionType } from '@er/shared';
import { crawlListings, type ListingCrawlerSpec } from '../core/crawl';
import {
  absoluteUrl,
  documentBase,
  factFields,
  isErechim,
  metaContent,
  residentialType,
  setFact,
  textOf,
  texts,
  uniqueUrls,
  type Facts,
  type Html,
} from '../core/html';
import type { PlatformAdapter, ScrapedProperty } from '../core/types';
import { cleanText } from '../../utils/text';

interface Card {
  type: PropertyType | null;
  title: string | null;
  neighborhood: string | null;
  inErechim: boolean;
  facts: Facts;
}

type Element = Parameters<Html>[0];

function typePart(title: string | null): string | null {
  return title?.split(/\s+(?:para|no bairro|em)\s+|,|\s+\d+D\b/i)[0] ?? null;
}

function neighborhoodOf(location: string, badge: string): string | null {
  const candidate = location.includes(',') ? location.split(',')[0] : badge.split('|')[0];
  const cleaned = cleanText(candidate);
  return cleaned && !/selecione|loca|venda/i.test(cleaned) ? cleaned : null;
}

function cardFacts($: Html, card: ReturnType<Html>): Facts {
  const facts: Facts = new Map();
  card.find('.ltn__plot-brief li').each((_, li) => {
    const value = $(li).find('span').text();
    setFact(facts, $(li).text().replace(value, ''), value);
  });
  setFact(facts, 'preco', card.find('.product-price').text());
  return facts;
}

function parseCard($: Html, el: Element): Card {
  const card = $(el);
  const title = cleanText(card.find('.product-title a').text());
  const location = cleanText(card.find('.product-img-location').text()) ?? '';
  return {
    type: residentialType(typePart(title)),
    title,
    neighborhood: neighborhoodOf(location, card.find('.product-badge li').first().text()),
    inErechim: isErechim(location),
    facts: cardFacts($, card),
  };
}

function detailFacts($: Html, base: Facts): Facts {
  const facts: Facts = new Map(base);
  $('h6').each((_, el) => setFact(facts, $(el).text(), $(el).next('small').text()));
  setFact(facts, 'valor do imovel', $('h4').filter((_, el) => /valor do im/i.test($(el).text())).first().text());
  return facts;
}

function description($: Html): string | null {
  const heading = $('h4').filter((_, el) => /descri/i.test($(el).text())).first();
  return cleanText(heading.nextUntil('h4').text()) ?? metaContent($, 'og:description');
}

function photos($: Html, url: string): string[] {
  const found = uniqueUrls($, '[data-responsive]', 'data-responsive', documentBase($, url));
  const cover = metaContent($, 'og:image');
  return found.length || !cover ? found : [cover];
}

function parseDetail(card: Card | undefined, $: Html, url: string, transaction: TransactionType): ScrapedProperty | null {
  const type = card?.type ?? residentialType(typePart(textOf($, 'h1')));
  if (!type || card?.inErechim === false) return null;
  return {
    externalId: new URL(url).searchParams.get('id_imovel') ?? url,
    url,
    transaction,
    type,
    title: textOf($, 'h1') ?? card?.title ?? 'Imóvel residencial',
    ...factFields(detailFacts($, card?.facts ?? new Map())),
    neighborhood: card?.neighborhood ?? null,
    address: cleanText($('h1').first().next('label').text()),
    latitude: null,
    longitude: null,
    description: description($),
    photos: photos($, url),
    features: texts($, 'label.checkbox-item'),
  };
}

function spec(website: string): ListingCrawlerSpec {
  const cards = new Map<string, Card>();
  return {
    listUrl: (transaction, page) =>
      new URL(`/imoveis-para-${transaction === 'sale' ? 'venda' : 'locacao'}.php?&pagina=${page}`, website).href,
    detailUrls($, listUrl) {
      const base = documentBase($, listUrl);
      const all: string[] = [];
      $('.ltn__product-item').each((_, el) => {
        const url = absoluteUrl($(el).find('.product-title a').attr('href'), base);
        if (url && !cards.has(url)) cards.set(url, parseCard($, el));
        if (url) all.push(url);
      });
      return all;
    },
    accept: (url) => !!cards.get(url)?.type && !!cards.get(url)?.inErechim,
    parseDetail: ($, url, transaction) => parseDetail(cards.get(url), $, url, transaction),
  };
}

export const samiAdapter: PlatformAdapter = {
  platform: 'sami',
  async *scrape(source, ctx) {
    yield* crawlListings(spec(source.website), ctx);
  },
};
