import * as cheerio from 'cheerio';
import type { TransactionType } from '@er/shared';
import type { Html } from './html';
import type { ScrapeContext, ScrapedProperty } from './types';

export interface ListingCrawlerSpec {
  listUrl(transaction: TransactionType, page: number): string;
  detailUrls($: Html, baseUrl: string): string[];
  accept?(url: string): boolean;
  hasNextPage?($: Html, baseUrl: string, page: number): boolean;
  parseDetail($: Html, url: string, transaction: TransactionType): ScrapedProperty | null;
}

export async function* crawlListings(spec: ListingCrawlerSpec, ctx: ScrapeContext): AsyncGenerator<ScrapedProperty> {
  let failures = 0;
  for (const transaction of ctx.transactions) {
    const seen = new Set<string>();
    for (let page = 1; page <= ctx.maxPages; page++) {
      const listUrl = spec.listUrl(transaction, page);
      let found: string[];
      let listing: Html;
      try {
        listing = cheerio.load(await ctx.http.text(listUrl));
        found = spec.detailUrls(listing, listUrl);
      } catch (error) {
        ctx.log.warn(`falha na listagem ${listUrl}: ${(error as Error).message}`);
        throw error;
      }
      const fresh = found.filter((u) => !seen.has(u));
      if (!fresh.length) break;
      fresh.forEach((u) => seen.add(u));
      for (const url of fresh.filter((u) => spec.accept?.(u) ?? true)) {
        try {
          const parsed = spec.parseDetail(cheerio.load(await ctx.http.text(url)), url, transaction);
          if (parsed) yield parsed;
        } catch (error) {
          if (!/HTTP (404|410)\b/.test((error as Error).message)) failures++;
          ctx.log.warn(`falha no imóvel ${url}: ${(error as Error).message}`);
        }
      }
      if (spec.hasNextPage?.(listing, listUrl, page) === false) break;
    }
  }
  if (failures) throw new Error(`${failures} anúncio(s) falharam na leitura; dados anteriores preservados`);
}

