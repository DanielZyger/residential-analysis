import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as cheerio from 'cheerio';
import { parseAlavancaDetail } from './alavanca';
import { parseCode49Detail } from './code49';
import { normalizeNeighborhood } from '../core/normalize';
import { isTargetCity } from '../core/html';

const fixture = (name: string) => readFileSync(new URL(`./__fixtures__/${name}.html`, import.meta.url), 'utf8');
const casaUrl = 'https://casaimoveis.net/imovel/33736/apartamento-a-venda-no-bairro-bela-vista-de-chapec';
const ccoUrl = 'https://www.ccoimoveis.com.br/436/imoveis/venda-apartamento-3-quartos-universitario-chapeco-sc';

test('extrai preço, áreas e quartos dos anúncios reais de Chapecó', () => {
  const casa = parseAlavancaDetail(cheerio.load(fixture('casa')), casaUrl, 'sale');
  assert.ok(casa);
  assert.equal(casa.price, 770000);
  assert.equal(casa.privateArea, 109.33);
  assert.equal(casa.totalArea, 145.95);
  assert.equal(casa.bedrooms, 3);
  assert.equal(casa.neighborhood, 'Bela Vista');
  assert.ok(casa.photos.length);
  const cco = parseCode49Detail(cheerio.load(fixture('cco')), ccoUrl, 'sale');
  assert.ok(cco);
  assert.equal(cco.price, 1050000);
  assert.equal(cco.privateArea, 101.7);
  assert.equal(cco.totalArea, 182.28);
  assert.equal(cco.parkingSpots, 2);
  assert.equal(cco.neighborhood, 'UNIVERSITÁRIO');
  assert.ok(cco.photos.length);
});

test('rejeita outras cidades, comerciais e transações incompatíveis', () => {
  const casa = fixture('casa');
  const cco = fixture('cco');
  assert.equal(parseAlavancaDetail(cheerio.load(casa.replaceAll('em Chapecó', 'em Guatambú')), casaUrl, 'sale'), null);
  assert.equal(parseCode49Detail(cheerio.load(cco.replaceAll('Chapecó - SC', 'Guatambú - SC')), ccoUrl, 'sale'), null);
  assert.equal(parseCode49Detail(cheerio.load(cco.replace('> Residencial <', '> Comercial <')), ccoUrl, 'sale'), null);
  assert.equal(parseAlavancaDetail(cheerio.load(casa), casaUrl, 'rent'), null);
  assert.equal(parseCode49Detail(cheerio.load(cco), ccoUrl, 'rent'), null);
  assert.ok(isTargetCity('Chapecó / SC'));
  assert.equal(isTargetCity('Águas de Chapecó'), false);
  assert.equal(isTargetCity('Erechim'), false);
});

test('normaliza bairros e aliases locais, preservando nomes distintos', () => {
  assert.deepEqual(normalizeNeighborhood('Bairro EFAPI - Chapecó / SC'), { name: 'Efapi', slug: 'efapi' });
  assert.equal(normalizeNeighborhood('Pres. Médici')?.name, 'Presidente Médici');
  assert.equal(normalizeNeighborhood('Maria Goreti')?.name, 'Maria Goretti');
  assert.equal(normalizeNeighborhood('Jardins do Vale')?.name, 'Jardins do Vale');
  assert.equal(normalizeNeighborhood('SC-480'), null);
});


test('separa os valores de venda e locação no mesmo anúncio', () => {
  const $ = cheerio.load(fixture('cco'));
  $('#transacao > div:last-child').text('Venda / Locação');
  $('body').append('<div class="c49-property-price"><div class="c49-property-price-title">Locação</div><div class="c49-property-price-value">R$ 3.500,00</div></div>');
  assert.equal(parseCode49Detail($, ccoUrl, 'sale')?.price, 1050000);
  assert.equal(parseCode49Detail($, ccoUrl, 'rent')?.price, 3500);
});
