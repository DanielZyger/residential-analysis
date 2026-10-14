import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as cheerio from 'cheerio';
import { parsePraediumDetail } from './praedium';
import { parsePlazaDetail } from './plaza';
import { parseCimCards } from './cim';
import { parseExataCards } from './exata';
import { parseChapecoProperty } from './imobiliaria-chapeco';
import { nextFlightObjects, type JsonObject } from '../core/structured';

const fixture = (name: string) => readFileSync(new URL(`./__fixtures__/${name}`, import.meta.url), 'utf8');
const pachecoUrl = 'https://pachecoimoveischapeco.com.br/imovel/casa-a-venda-3-quartos-centro-chapeco-sc-id-63';
const plazaUrl = 'https://plazachapeco.com.br/imovel/19476/casa-venda-3-quartos-maria-goretti-chapeco/';

test('Praedium aceita JSON-LD com quebras literais e preserva área útil e suítes', () => {
  const property = parsePraediumDetail(cheerio.load(fixture('pacheco.html')), pachecoUrl, 'sale');
  assert.ok(property);
  assert.equal(property.price, 1170000);
  assert.equal(property.privateArea, 145);
  assert.equal(property.suites, 1);
  assert.equal(property.bedrooms, 3);
  assert.equal(property.parkingSpots, 3);
  assert.equal(property.neighborhood, 'Centro');
  assert.ok(property.photos.length);
  assert.equal(parsePraediumDetail(cheerio.load(fixture('pacheco.html').replaceAll('Chapecó', 'Guatambú')), pachecoUrl, 'sale'), null);
  assert.equal(parsePraediumDetail(cheerio.load(fixture('pacheco.html')), pachecoUrl, 'rent'), null);
});

test('Plaza extrai imóvel residencial, preço, área privativa e coordenadas', () => {
  const html = fixture('plaza.html');
  const property = parsePlazaDetail(cheerio.load(html), plazaUrl, 'sale');
  assert.ok(property);
  assert.equal(property.price, 1700000);
  assert.equal(property.privateArea, 360);
  assert.equal(property.suites, 2);
  assert.equal(property.parkingSpots, 2);
  assert.equal(property.latitude, -27.0937853);
  assert.equal(parsePlazaDetail(cheerio.load(html), plazaUrl, 'rent'), null);
  assert.equal(parsePlazaDetail(cheerio.load(html.replaceAll('"category":"Casa"', '"category":"Terreno"')), plazaUrl, 'sale'), null);
  assert.equal(parsePlazaDetail(cheerio.load(html.replaceAll('"addressLocality":"Chapecó"', '"addressLocality":"Guatambú"')), plazaUrl, 'sale'), null);
});

test('CIM lê todos os cards, rejeita comerciais e outras cidades', () => {
  const properties = parseCimCards(cheerio.load(fixture('foco.html')), 'https://focoimoveischapeco.com.br', 'sale');
  assert.equal(properties.length, 16);
  assert.equal(properties[0].price, 379000);
  assert.equal(properties[0].privateArea, 55);
  assert.equal(properties[0].parkingSpots, 1);
  assert.ok(properties.every((p) => p.type !== 'other'));
  assert.equal(parseCimCards(cheerio.load(fixture('foco.html')), 'https://focoimoveischapeco.com.br', 'rent').length, 0);
});

test('Exata separa área construída de terreno e filtra município em cada card', () => {
  const properties = parseExataCards(cheerio.load(fixture('exata.html')), 'https://www.imobiliariaexata.com', 'sale');
  assert.equal(properties.length, 18);
  assert.equal(properties[0].privateArea, 43.58);
  assert.equal(properties[0].totalArea, 74.09);
  assert.equal(properties[0].price, 380000);
  assert.equal(parseExataCards(cheerio.load(fixture('exata.html').replaceAll('CHAPECÓ', 'GUATAMBÚ').replaceAll('Chapecó', 'Guatambú')), 'https://www.imobiliariaexata.com', 'sale').length, 0);
});

test('Next.js extrai dados sem executar scripts e rejeita outras cidades', () => {
  const record = JSON.parse(fixture('chapeco-property.json')) as JsonObject;
  const serialized = JSON.stringify([1, `1:${JSON.stringify({ property: record })}\n`]);
  const $ = cheerio.load(`<script>self.__next_f.push(${serialized})</script><script>throw new Error('não executar')</script>`);
  assert.equal(nextFlightObjects($).length, 1);
  const property = parseChapecoProperty(nextFlightObjects($)[0], 'https://www.imobiliariachapeco.com.br');
  assert.ok(property);
  assert.equal(property.price, 4000000);
  assert.equal(property.privateArea, 200);
  assert.equal(property.bedrooms, 3);
  assert.equal(property.condoFee, null);
  assert.equal(parseChapecoProperty({ ...record, location: { city: 'Águas de Chapecó', state: 'SC' } }, 'https://www.imobiliariachapeco.com.br'), null);
  assert.equal(parseChapecoProperty({ ...record, propertyType: 'Sala Comercial' }, 'https://www.imobiliariachapeco.com.br'), null);
});

test('Flight preserva o imóvel após descrição longa com Unicode e novas linhas', () => {
  const stream = fixture('chapeco-flight.txt');
  const $ = cheerio.load(`<script>self.__next_f.push(${JSON.stringify([1, stream])})</script>`);
  const record = nextFlightObjects($).find((p) => p.id === '1179');
  assert.ok(record);
  assert.equal(parseChapecoProperty(record, 'https://www.imobiliariachapeco.com.br')?.price, 2600000);
  assert.ok(typeof record.description === 'string' && record.description.includes('Excelente apartamento'));
});

test('coletor Next.js segue o sitemap, identifica ID e não coleta imóveis relacionados', async () => {
  const { imobiliariaChapecoAdapter } = await import('./imobiliaria-chapeco');
  const { HttpClient } = await import('../core/http');
  const { createLogger } = await import('../core/logger');
  const record = JSON.parse(fixture('chapeco-property.json')) as JsonObject;
  const related = { ...record, id: '999', slug: '999-apartamento', status: 'Locacao', priceValue: 2500 };
  const log = createLogger('test');
  const http = new HttpClient({ minIntervalMs: 0, retries: 0, timeoutMs: 1000, log });
  const requests: string[] = [];
  const base = 'https://www.imobiliariachapeco.com.br';
  const oldUrl = `${base}/imoveis/3217-slug-antigo`;
  http.text = async (url) => {
    requests.push(url);
    if (url.endsWith('/sitemap.xml')) return `<urlset><url><loc>${oldUrl}</loc></url></urlset>`;
    if (url === oldUrl) return `<script>self.__next_f.push(${JSON.stringify([1, `1:${JSON.stringify({ property: record, related: [related] })}\n`])})</script>`;
    throw new Error(`URL inesperada: ${url}`);
  };
  const properties = [];
  for await (const property of imobiliariaChapecoAdapter.scrape({ id: 'chapeco', name: 'Chapecó', website: base, platform: 'chapeco-nextjs', active: true, inactiveReason: null }, { http, log, transactions: ['sale', 'rent'], maxPages: 50 })) properties.push(property);
  assert.equal(properties.length, 1);
  assert.equal(properties[0].externalId, '3217');
  assert.equal(properties[0].url, `${base}/imoveis/${record.slug}`);
  assert.deepEqual(requests, [`${base}/sitemap.xml`, oldUrl]);
});

test('Plaza encerra a paginação sem solicitar uma página além do catálogo', async () => {
  const { plazaAdapter } = await import('./plaza');
  const { HttpClient } = await import('../core/http');
  const { createLogger } = await import('../core/logger');
  const log = createLogger('test');
  const http = new HttpClient({ minIntervalMs: 0, retries: 0, timeoutMs: 1000, log });
  const base = 'https://plazachapeco.com.br';
  const requests: string[] = [];
  http.text = async (url) => {
    requests.push(url);
    if (url === `${base}/comprar-imoveis-chapeco-sc`) return `<a href="${plazaUrl}">Casa</a>`;
    if (url === plazaUrl) return fixture('plaza.html');
    throw new Error(`URL inesperada: ${url}`);
  };
  const properties = [];
  for await (const property of plazaAdapter.scrape({ id: 'plaza', name: 'Plaza', website: base, platform: 'plaza-wordpress', active: true, inactiveReason: null }, { http, log, transactions: ['sale'], maxPages: 50 })) properties.push(property);
  assert.equal(properties.length, 1);
  assert.deepEqual(requests, [`${base}/comprar-imoveis-chapeco-sc`, plazaUrl]);
});
