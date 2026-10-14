import * as cheerio from 'cheerio';
import type { PropertyType, TransactionType } from '@er/shared';
import { cleanText, normalizeText, parseBrNumber, parseInteger } from '../../utils/text';
import { normalizePropertyType } from '../core/normalize';
import type { PlatformAdapter, ScrapeContext, ScrapedProperty, SourceConfig } from '../core/types';

interface SigaPlan {
  Id: number;
  Categoria: string;
  Tipo: string;
  Dormitorios: number | null;
  Valor: string;
}

interface SigaPhoto {
  Foto_Grande: string;
}

interface SigaListing {
  ID: number;
  Codigo: string;
  Nome: string;
  URL: string;
  Endereco: string;
  Latitude: string;
  Longitude: string;
  Bairro: string;
  Cidade: string;
  Garagem: string;
  Suites: string;
  Banheiros: string;
  Tipo: SigaPlan[];
  AreaTotal: string;
  AreaPrivativa: string;
  Mobilia: string;
  Piscina: boolean;
  Sacada: boolean;
  Churrasqueira: boolean;
  Elevador: number;
  AreaLazer: boolean;
  Fotos: SigaPhoto[] | Record<string, SigaPhoto[]>;
}

interface SigaDetail extends SigaListing {
  ValorCondominio?: string;
  ValorIPTU?: string;
  Caracteristicas?: Record<string, string[]>;
  Descricao?: { Texto: string }[];
}

interface SigaPage<T> {
  data: T[];
  meta: { last_page: number };
}

const RESIDENTIAL_TYPE_IDS = '1,10,60';
const OPERATIONS: Record<TransactionType, string> = { sale: 'vendas', rent: 'aluguel' };
const CITY = 'erechim';

function apiUrl(source: SourceConfig, path: string, params: Record<string, string | number>): string {
  const query = new URLSearchParams({ ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])), idimob: '1', rede: '0' });
  return `${source.website}/api/${path}?${query}`;
}

function coordinate(value: string | undefined): number | null {
  const parsed = Number.parseFloat(value ?? '');
  return Number.isFinite(parsed) && parsed !== 0 ? parsed : null;
}

function htmlToText(html: string | undefined): string | null {
  return html ? cleanText(cheerio.load(html).text()) : null;
}

function amenityFlags(item: SigaListing): string[] {
  const flags: [boolean, string][] = [
    [item.Piscina, 'Piscina'],
    [item.Sacada, 'Sacada'],
    [item.Churrasqueira, 'Churrasqueira'],
    [item.Elevador > 0, 'Elevador'],
    [item.AreaLazer, 'Área de lazer'],
    [normalizeText(item.Mobilia).startsWith('mobiliad') || normalizeText(item.Mobilia).startsWith('semi'), item.Mobilia],
  ];
  return flags.filter(([on]) => on).map(([, label]) => label);
}

function toProperty(item: SigaDetail, plan: SigaPlan, type: PropertyType, transaction: TransactionType, multiPlan: boolean): ScrapedProperty {
  const positive = (value: string | undefined) => {
    const parsed = parseBrNumber(value);
    return parsed && parsed > 0 ? parsed : null;
  };
  const characteristics = Object.values(item.Caracteristicas ?? {}).flat();
  return {
    externalId: multiPlan ? `${item.ID}-${plan.Id}` : String(item.ID),
    url: item.URL,
    transaction,
    type,
    title: multiPlan ? `${item.Nome.trim()} — ${plan.Tipo}` : cleanText(item.Nome) ?? plan.Tipo,
    price: positive(plan.Valor),
    condoFee: positive(item.ValorCondominio),
    iptu: positive(item.ValorIPTU),
    privateArea: multiPlan ? null : positive(item.AreaPrivativa),
    totalArea: multiPlan ? null : positive(item.AreaTotal),
    bedrooms: plan.Dormitorios || null,
    suites: parseInteger(item.Suites),
    bathrooms: parseInteger(item.Banheiros) || null,
    parkingSpots: parseInteger(item.Garagem),
    neighborhood: cleanText(item.Bairro),
    address: cleanText(item.Endereco),
    latitude: coordinate(item.Latitude),
    longitude: coordinate(item.Longitude),
    description: htmlToText(item.Descricao?.map((d) => d.Texto).join(' ')),
    photos: (Array.isArray(item.Fotos) ? item.Fotos : Object.values(item.Fotos ?? {}).flat()).map((f) => f.Foto_Grande),
    features: [...amenityFlags(item), ...characteristics],
  };
}

async function* listPages(source: SourceConfig, ctx: ScrapeContext, transaction: TransactionType): AsyncGenerator<SigaListing> {
  const headers = { referer: `${source.website}/` };
  for (let page = 1; page <= ctx.maxPages; page++) {
    const url = apiUrl(source, 'imoveis', { operacao: OPERATIONS[transaction], tipoId: RESIDENTIAL_TYPE_IDS, page, limite: 100 });
    const result = await ctx.http.json<SigaPage<SigaListing>>(url, { headers });
    yield* result.data;
    if (page >= result.meta.last_page) break;
  }
}

async function loadDetail(source: SourceConfig, ctx: ScrapeContext, item: SigaListing): Promise<SigaDetail> {
  if (source.options?.details === false) return item;
  try {
    const url = apiUrl(source, `imovel/${item.ID}`, { pgimovel: 1, interno: '' });
    const { data } = await ctx.http.json<{ data: SigaDetail | SigaDetail[] }>(url, { headers: { referer: `${source.website}/` } });
    return { ...item, ...(Array.isArray(data) ? data[0] : data) };
  } catch (error) {
    ctx.log.warn(`detalhe ${item.ID} indisponível: ${(error as Error).message}`);
    return item;
  }
}

export const sigahostNuxtAdapter: PlatformAdapter = {
  platform: 'sigahost-nuxt',
  async *scrape(source, ctx) {
    for (const transaction of ctx.transactions) {
      for await (const item of listPages(source, ctx, transaction)) {
        if (normalizeText(item.Cidade) !== CITY || !item.Tipo?.length) continue;
        const plans = item.Tipo.map((plan) => ({ plan, type: normalizePropertyType(plan.Tipo, plan.Categoria) })).filter(
          (p): p is { plan: SigaPlan; type: PropertyType } => !!p.type,
        );
        if (!plans.length) continue;
        const detail = await loadDetail(source, ctx, item);
        for (const { plan, type } of plans) yield toProperty(detail, plan, type, transaction, plans.length > 1);
      }
    }
  },
};
