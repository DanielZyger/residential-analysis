import type { Property, Source, TransactionType } from '@er/shared';

export interface ScrapeResult {
  source: Source;
  properties: Property[];
}

export function mergeProperties(previous: Property[], results: ScrapeResult[], activeIds: Set<string>, transactions: TransactionType[]): Property[] {
  const bySource = new Map(results.map((result) => [result.source.id, result]));
  const properties = new Map<string, Property>();
  for (const property of previous) {
    if (!activeIds.has(property.sourceId)) continue;
    const result = bySource.get(property.sourceId);
    // Falhas parciais não apagam anúncios coletados antes; uma coleta só de aluguel preserva vendas.
    if (result && !result.source.lastRunError && transactions.includes(property.transaction)) continue;
    properties.set(property.id, property);
  }
  for (const result of results) for (const property of result.properties) properties.set(property.id, property);
  return [...properties.values()];
}
