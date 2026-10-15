import * as cheerio from 'cheerio';
import type { TransactionType } from '@er/shared';
import { cleanText } from '../../utils/text';
import { isErechim, residentialType } from '../core/html';
import type { PlatformAdapter, ScrapeContext, ScrapedProperty, SourceConfig } from '../core/types';

interface ArboLocation {
  imv_cod_gaia: string;
}

interface ArboProperty {
  imv_cod_gaia: string;
  imv_titulo: string;
  imv_preco_venda: number | null;
  imv_preco_locacao: number | null;
  imv_preco_cond: number | null;
  imv_preco_iptu: number | null;
  imv_area_util: number | null;
  imv_area_total: number | null;
  imv_area_construida: number | null;
  imv_area_terreno: number | null;
  imv_qtd_dorm: number | null;
  imv_qtd_suite: number | null;
  imv_qtd_vagas: number | null;
  imv_qtd_banheiros: number | null;
  imv_obs: string | null;
  imv_cidade: string | null;
  imv_bairro: string | null;
  imv_endereco: string | null;
  imv_end_numero: number | null;
  imv_hide_address_wl: boolean;
  imv_ocultar_preco: boolean;
  imv_location: { lat: number; lng: number } | null;
  url_amiga: string | null;
  tipo_imovel: { timv_nome: string } | null;
  fotos: { imvft_url: string }[] | null;
  comodidades: { comodidade: { cmd_nome: string } | null }[] | null;
}

const TRANSACTION_PATH: Record<TransactionType, string> = { sale: 'a-venda', rent: 'para-alugar' };
const NON_RESIDENTIAL_CODE = /^(TE|CH|SA|BA|PT|COC)\d/;
const PAGE_SIZE = 10;

function positive(value: number | null | undefined): number | null {
  return typeof value === 'number' && value > 0 ? value : null;
}

function pageProps<T>(html: string): T {
  return JSON.parse(cheerio.load(html)('#__NEXT_DATA__').text()).props.pageProps as T;
}

async function listCodes(source: SourceConfig, ctx: ScrapeContext, transaction: TransactionType): Promise<string[]> {
  const url = new URL(`/imoveis/${TRANSACTION_PATH[transaction]}/erechim-rs`, source.website).href;
  const { locations } = pageProps<{ locations: ArboLocation[] }>(await ctx.http.text(url));
  const codes = [...new Set(locations.map((l) => l.imv_cod_gaia))];
  return codes.filter((code) => !NON_RESIDENTIAL_CODE.test(code)).slice(0, ctx.maxPages * PAGE_SIZE);
}

function address(item: ArboProperty): string | null {
  if (item.imv_hide_address_wl) return null;
  return cleanText([item.imv_endereco, positive(item.imv_end_numero)].filter(Boolean).join(', '));
}

function price(item: ArboProperty, transaction: TransactionType): number | null {
  if (item.imv_ocultar_preco) return null;
  return positive(transaction === 'sale' ? item.imv_preco_venda : item.imv_preco_locacao);
}

function toProperty(item: ArboProperty, url: string, transaction: TransactionType): ScrapedProperty | null {
  const type = residentialType(item.tipo_imovel?.timv_nome);
  if (!type || !isErechim(item.imv_cidade)) return null;
  return {
    externalId: item.imv_cod_gaia,
    url: item.url_amiga ?? url,
    transaction,
    type,
    title: cleanText(item.imv_titulo) ?? item.imv_cod_gaia,
    price: price(item, transaction),
    condoFee: positive(item.imv_preco_cond),
    iptu: positive(item.imv_preco_iptu),
    privateArea: positive(item.imv_area_util) ?? positive(item.imv_area_construida),
    totalArea: positive(item.imv_area_total) ?? positive(item.imv_area_terreno),
    bedrooms: positive(item.imv_qtd_dorm),
    suites: positive(item.imv_qtd_suite),
    bathrooms: positive(item.imv_qtd_banheiros),
    parkingSpots: item.imv_qtd_vagas,
    neighborhood: cleanText(item.imv_bairro),
    address: address(item),
    latitude: item.imv_location?.lat ?? null,
    longitude: item.imv_location?.lng ?? null,
    description: cleanText(item.imv_obs),
    photos: (item.fotos ?? []).map((f) => f.imvft_url),
    features: (item.comodidades ?? []).map((c) => c.comodidade?.cmd_nome).filter((n): n is string => !!n),
  };
}

async function loadProperty(source: SourceConfig, ctx: ScrapeContext, code: string, transaction: TransactionType): Promise<ScrapedProperty | null> {
  const url = new URL(`/imovel/${code}`, source.website).href;
  try {
    return toProperty(pageProps<{ imovel: ArboProperty }>(await ctx.http.text(url)).imovel, url, transaction);
  } catch (error) {
    ctx.log.warn(`falha no imóvel ${url}: ${(error as Error).message}`);
    return null;
  }
}

export const arboAdapter: PlatformAdapter = {
  platform: 'arbo',
  async *scrape(source, ctx) {
    for (const transaction of ctx.transactions) {
      for (const code of await listCodes(source, ctx, transaction)) {
        const property = await loadProperty(source, ctx, code, transaction);
        if (property) yield property;
      }
    }
  },
};
