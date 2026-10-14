import { crawlListings } from '../core/crawl';
import { absoluteUrl, textOf, uniqueUrls, type Html } from '../core/html';
import { normalizePropertyType } from '../core/normalize';
import { cleanText, normalizeText, parseBrNumber, parseInteger } from '../../utils/text';
import type { PlatformAdapter, ScrapedProperty } from '../core/types';
import type { TransactionType } from '@er/shared';

export function parseAlavancaDetail($: Html, url: string, transaction: TransactionType): ScrapedProperty | null {
  const title = textOf($, '#imovel h1') ?? textOf($, 'h1');
  const location = title?.match(/Bairro\s+(.+?)\s+em\s+(.+?)\s*\|/i);
  if (!location || normalizeText(location[2]) !== 'chapeco') return null;
  const type = normalizePropertyType(title);
  if (!type || (transaction === 'sale' ? !/venda/i.test(title ?? '') : !/alug|loca/i.test(title ?? ''))) return null;
  const facts = textOf($, '#destaques') ?? '';
  const number = (pattern: RegExp) => parseBrNumber(facts.match(pattern)?.[1]);
  const count = (pattern: RegExp) => parseInteger(facts.match(pattern)?.[1]);
  const pricing = textOf($, '#valores_resp') ?? '';
  const money = (pattern: RegExp) => parseBrNumber(pricing.match(pattern)?.[1]);
  const total = $('#caracteristicas-do-imovel li').filter((_, el) => /Área total/i.test($(el).text())).first().find('strong').text().match(/[\d.,]+/)?.[0];
  // A área total desta plataforma usa ponto decimal; a privativa usa vírgula.
  const totalArea = total ? (total.includes(',') ? parseBrNumber(total) : Number(total)) : null;
  const photos = $('[data-fancybox="fotos"]').map((_, el) => absoluteUrl($(el).attr('href') ?? $(el).attr('data-src'), url)).get().filter((p): p is string => !!p);
  return {
    externalId: url.match(/\/imovel\/(\d+)/)?.[1] ?? url, url, transaction, type,
    title: title ?? 'Imóvel residencial',
    price: money(/R\$\s*([\d.,]+)/),
    condoFee: money(/condom.nio\s*:?\s*R\$\s*([\d.,]+)/i),
    iptu: money(/IPTU\s*:?\s*R\$\s*([\d.,]+)/i),
    privateArea: number(/([\d.,]+)\s*m²\s*Área privativa/i), totalArea,
    bedrooms: count(/(\d+)\s*quarto/i), suites: count(/(\d+)\s*suíte/i),
    bathrooms: count(/(\d+)\s*banheiro/i), parkingSpots: count(/(\d+)\s*vaga/i),
    neighborhood: location[1], address: null, latitude: null, longitude: null,
    description: cleanText($('#sobre-imovel .txt').text()), photos: [...new Set(photos)],
    features: $('#caracteristicas li strong').map((_, el) => cleanText($(el).text())).get().filter((s): s is string => !!s),
  };
}

export const alavancaAdapter: PlatformAdapter = {
  platform: 'alavanca',
  async *scrape(source, ctx) {
    yield* crawlListings({
      listUrl: (transaction, page) => {
        const operation = transaction === 'sale' ? 'comprar' : 'alugar';
        return page === 1 ? `${source.website}/${operation}${transaction === 'rent' ? '/residencial' : ''}`
          : `${source.website}/imoveis/list/${page}?finalidade=${operation}${transaction === 'rent' ? '&uso=residencial' : ''}`;
      },
      detailUrls: ($, url) => uniqueUrls($, 'a[href*="imovel/"]', 'href', url).filter((u) => new URL(u).origin === new URL(url).origin && /\/imovel\/\d+\//.test(u)),
      parseDetail: parseAlavancaDetail,
    }, ctx);
  },
};
