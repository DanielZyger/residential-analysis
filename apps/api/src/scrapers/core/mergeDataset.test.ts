import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as cheerio from 'cheerio';
import type { Source, TransactionType } from '@er/shared';
import { parsePraediumDetail } from '../platforms/praedium';
import { toProperty } from './normalize';
import { mergeProperties } from './mergeDataset';

const html = readFileSync(new URL('../platforms/__fixtures__/pacheco.html', import.meta.url), 'utf8');
const raw = parsePraediumDetail(cheerio.load(html), 'https://pachecoimoveischapeco.com.br/imovel/casa-a-venda-3-quartos-centro-chapeco-sc-id-63', 'sale')!;
const property = (externalId: string, transaction: TransactionType = 'sale', price = 1000000) => toProperty({ ...raw, externalId, transaction, price, sourceId: 'pacheco' }, 'Pacheco', '2026-10-14T00:00:00.000Z');
const source = (error: string | null): Source => ({ id: 'pacheco', name: 'Pacheco', website: 'https://pachecoimoveischapeco.com.br', platform: 'praedium', active: true, inactiveReason: null, lastRunAt: null, lastRunCount: 1, lastRunError: error });

test('coleta apenas de aluguel preserva os anúncios de venda', () => {
  const sale = property('sale');
  const oldRent = property('old-rent', 'rent', 2000);
  const newRent = property('new-rent', 'rent', 2500);
  const merged = mergeProperties([sale, oldRent], [{ source: source(null), properties: [newRent] }], new Set(['pacheco']), ['rent']);
  assert.deepEqual(merged.map((p) => p.id).sort(), [sale.id, newRent.id].sort());
});

test('falha parcial preserva os antigos e atualiza os imóveis que responderam', () => {
  const previous = property('63');
  const untouched = property('64');
  const updated = property('63', 'sale', 1170000);
  const foreign = { ...property('old-city'), id: 'old-city', sourceId: 'erechimimoveis' };
  const merged = mergeProperties([previous, untouched, foreign], [{ source: source('HTTP 503'), properties: [updated] }], new Set(['pacheco']), ['sale', 'rent']);
  assert.equal(merged.length, 2);
  assert.equal(merged.find((p) => p.id === previous.id)?.price, 1170000);
  assert.ok(merged.some((p) => p.id === untouched.id));
});
