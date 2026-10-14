import * as cheerio from 'cheerio';
import type { TransactionType } from '@er/shared';
import type { Html } from './html';
import type { ScrapeContext, ScrapedProperty } from './types';

export interface ListingCrawlerSpec {
  listUrl(transaction: TransactionType, page: number): string;
  detailUrls($: Html, baseUrl: string): string[];
  accept?(url: string): boolean;
  parseDetail($: Html, url: string, transaction: TransactionType): ScrapedProperty | null;
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
        ctx.log.warn(`falha na listagem ${listUrl}: ${(error as Error).message}`);
        break;
      }
      const fresh = found.filter((u) => !seen.has(u));
      if (!fresh.length) break;
      fresh.forEach((u) => seen.add(u));
      for (const url of fresh.filter((u) => spec.accept?.(u) ?? true)) {
        try {
          const parsed = spec.parseDetail(cheerio.load(await ctx.http.text(url)), url, transaction);
          if (parsed) yield parsed;
        } catch (error) {
          ctx.log.warn(`falha no imóvel ${url}: ${(error as Error).message}`);
        }
      }
    }
  }
}

