import * as cheerio from 'cheerio';
import type { TransactionType } from '@er/shared';
import { isFatalForSource } from './http';
import type { Html } from './html';
import type { ScrapeContext, ScrapedProperty } from './types';

export interface ListingCrawlerSpec {
  listUrl(transaction: TransactionType, page: number): string;
  detailUrls($: Html, baseUrl: string): string[];
  accept?(url: string): boolean;
  parseDetail($: Html, url: string, transaction: TransactionType): ScrapedProperty | null;
}

export async function* crawlDetails(
  urls: string[],
  parse: ($: Html, url: string) => ScrapedProperty | null,
  ctx: ScrapeContext,
): AsyncGenerator<ScrapedProperty> {
  for (const url of urls) {
    try {
      const parsed = parse(cheerio.load(await ctx.http.text(url)), url);
      if (parsed) yield parsed;
    } catch (error) {
      if (isFatalForSource(error)) throw error;
      ctx.log.warn(`falha no imóvel ${url}: ${(error as Error).message}`);
    }
  }
}

export async function* crawlListings(spec: ListingCrawlerSpec, ctx: ScrapeContext): AsyncGenerator<ScrapedProperty> {
  const seen = new Set<string>();
  for (const transaction of ctx.transactions) {
    for (let page = 1; page <= ctx.maxPages; page++) {
      const listUrl = spec.listUrl(transaction, page);
      let found: string[];
      try {
        found = spec.detailUrls(cheerio.load(await ctx.http.text(listUrl)), listUrl);
      } catch (error) {
        if (page === 1 || isFatalForSource(error)) throw error;
        ctx.log.warn(`fim da paginação em ${listUrl}: ${(error as Error).message}`);
        break;
      }
      const fresh = found.filter((u) => !seen.has(u));
      if (!fresh.length) break;
      fresh.forEach((u) => seen.add(u));
      yield* crawlDetails(fresh.filter((u) => spec.accept?.(u) ?? true), ($, url) => spec.parseDetail($, url, transaction), ctx);
    }
  }
}

