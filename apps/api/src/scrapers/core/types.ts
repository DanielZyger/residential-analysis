import type { RawPropertyInput, TransactionType } from '@er/shared';
import type { HttpClient } from './http';
import type { Logger } from './logger';

export interface SourceConfig {
  id: string;
  name: string;
  website: string;
  platform: string;
  active: boolean;
  inactiveReason: string | null;
  options?: Record<string, string | number | boolean | string[]>;
}

export interface ScrapeContext {
  http: HttpClient;
  log: Logger;
  transactions: TransactionType[];
  maxPages: number;
}

export type ScrapedProperty = Omit<RawPropertyInput, 'sourceId'>;

export interface PlatformAdapter {
  platform: string;
  scrape(source: SourceConfig, ctx: ScrapeContext): AsyncGenerator<ScrapedProperty>;
}
