import type { Property, Source, TransactionType } from '@er/shared';
import { loadDataset, saveDataset } from '../repositories/datasetRepository';
import { HttpClient } from './core/http';
import { createLogger } from './core/logger';
import { normalizePropertyType, toProperty } from './core/normalize';
import { PLATFORM_ADAPTERS } from './platforms';
import { SOURCES } from './sources';
import type { SourceConfig } from './core/types';

const args = new Map(
  process.argv.slice(2).map((arg) => {
    const [k, v] = arg.replace(/^--/, '').split('=');
    return [k, v ?? 'true'] as const;
  }),
);

const only = args.get('source')?.split(',');
const maxPages = Number(args.get('max-pages') ?? 50);
const concurrency = Number(args.get('concurrency') ?? 4);
const transactions = (args.get('transaction')?.split(',') ?? ['sale', 'rent']) as TransactionType[];
const log = createLogger('scrape');

function describe(source: SourceConfig): Source {
  const { id, name, website, platform, active, inactiveReason } = source;
  return { id, name, website, platform, active, inactiveReason, lastRunAt: null, lastRunCount: 0, lastRunError: null };
}

function pickRunInfo(source?: Source): Partial<Source> {
  return source ? { lastRunAt: source.lastRunAt, lastRunCount: source.lastRunCount, lastRunError: source.lastRunError } : {};
}

async function scrapeSource(source: SourceConfig, collectedAt: string): Promise<{ source: Source; properties: Property[] }> {
  const slog = log.child(source.id);
  const adapter = PLATFORM_ADAPTERS.get(source.platform);
  const base: Source = { ...describe(source), lastRunAt: collectedAt };
  if (!adapter) return { source: { ...base, lastRunError: `Sem adapter para a plataforma "${source.platform}"` }, properties: [] };
  const http = new HttpClient({ minIntervalMs: Number(source.options?.minIntervalMs ?? 1200), retries: 2, timeoutMs: 20_000, log: slog });
  const properties: Property[] = [];
  try {
    for await (const item of adapter.scrape(source, { http, log: slog, transactions, maxPages })) {
      const type = normalizePropertyType(item.type === 'other' ? item.title : null) ?? item.type;
      if (type === null) continue;
      properties.push(toProperty({ ...item, type, sourceId: source.id }, source.name, collectedAt));
      if (properties.length % 25 === 0) slog.info(`${properties.length} imóveis`);
    }
    slog.info(`concluído: ${properties.length} imóveis`);
    return { source: { ...base, lastRunCount: properties.length }, properties };
  } catch (error) {
    slog.error((error as Error).message);
    return { source: { ...base, lastRunCount: properties.length, lastRunError: (error as Error).message }, properties };
  }
}

async function runPool<T, R>(items: T[], size: number, task: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(size, items.length) }, async () => {
      while (next < items.length) {
        const index = next++;
        results[index] = await task(items[index]);
      }
    }),
  );
  return results;
}

async function main(): Promise<void> {
  const collectedAt = new Date().toISOString();
  const selected = SOURCES.filter((s) => (only ? only.includes(s.id) : s.active));
  log.info(`coletando ${selected.length} fonte(s)`);
  const results = await runPool(selected, concurrency, (s) => scrapeSource(s, collectedAt));
  const previous = await loadDataset();
  const previousBySource = new Set(previous.properties.map((p) => p.sourceId));
  for (const r of results) {
    if (!r.source.lastRunError && r.properties.length === 0 && previousBySource.has(r.source.id)) {
      r.source.lastRunError = 'Nenhum imóvel encontrado (o site pode ter mudado de plataforma)';
    }
  }
  const accepted = results.filter((r) => !r.source.lastRunError || !previousBySource.has(r.source.id));
  for (const r of results.filter((r) => !accepted.includes(r))) log.warn(`${r.source.id}: coleta com erro, mantidos os dados da coleta anterior`);
  const refreshed = new Set(accepted.map((r) => r.source.id));
  const kept = previous.properties.filter((p) => !refreshed.has(p.sourceId));
  const properties = [...accepted.flatMap((r) => r.properties), ...kept];
  const sourcesById = new Map(previous.sources.map((s) => [s.id, s]));
  for (const { source } of results) sourcesById.set(source.id, source);
  const sources = SOURCES.map((s) => ({ ...describe(s), ...pickRunInfo(sourcesById.get(s.id)) }));
  await saveDataset({ collectedAt, sources, properties });
  log.info(`dataset salvo: ${properties.length} anúncios de ${sources.length} fontes`);
}

main().catch((error) => {
  log.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exit(1);
});
