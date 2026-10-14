import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { crawlListings } from './crawl';
import { HttpClient } from './http';
import { createLogger } from './logger';
import { parsePraediumDetail } from '../platforms/praedium';

const detail = readFileSync(new URL('../platforms/__fixtures__/pacheco.html', import.meta.url), 'utf8');
const listingUrl = 'https://pachecoimoveischapeco.com.br/imoveis/a-venda/chapeco-sc';
const valid = 'https://pachecoimoveischapeco.com.br/imovel/casa-a-venda-3-quartos-centro-chapeco-sc-id-63';
const removed = 'https://pachecoimoveischapeco.com.br/imovel/casa-a-venda-3-quartos-centro-chapeco-sc-id-99';

async function collect(status: number) {
  const log = createLogger('test');
  const http = new HttpClient({ minIntervalMs: 0, retries: 0, timeoutMs: 1000, log });
  http.text = async (url) => {
    if (url === listingUrl) return 'listagem';
    if (url === removed) throw new Error(`HTTP ${status} em ${removed}`);
    if (url === valid) return detail;
    throw new Error('Página além do catálogo');
  };
  const properties = [];
  let error: Error | null = null;
  try {
    for await (const property of crawlListings({ listUrl: () => listingUrl, detailUrls: () => [removed, valid], hasNextPage: () => false, parseDetail: parsePraediumDetail }, { http, log, transactions: ['sale'], maxPages: 50 })) properties.push(property);
  } catch (caught) { error = caught as Error; }
  return { properties, error };
}

test('anúncio removido (410) é ignorado e os demais são coletados', async () => {
  const result = await collect(410);
  assert.equal(result.error, null);
  assert.equal(result.properties.length, 1);
  assert.equal(result.properties[0].externalId, '63');
});

test('falha de servidor marca a coleta parcial depois de ler os anúncios disponíveis', async () => {
  const result = await collect(503);
  assert.equal(result.properties.length, 1);
  assert.match(result.error?.message ?? '', /1 anúncio\(s\) falharam/);
});
