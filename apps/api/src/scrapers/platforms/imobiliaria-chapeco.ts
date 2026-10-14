import * as cheerio from 'cheerio';
import { nextFlightObjects, object, string, type JsonObject } from '../core/structured';
import { normalizePropertyType, normalizeTransaction } from '../core/normalize';
import { normalizeText, parseBrNumber, parseInteger } from '../../utils/text';
import type { PlatformAdapter, ScrapedProperty } from '../core/types';

export function parseChapecoProperty(record: JsonObject, base: string): ScrapedProperty | null {
  const location = object(record.location);
  if (normalizeText(string(location.city)) !== 'chapeco' || normalizeText(string(location.state)) !== 'sc') return null;
  const type = normalizePropertyType(string(record.propertyType));
  const status = normalizeText(string(record.status));
  const transaction = normalizeTransaction(status);
  if (!type || !transaction || (/venda/.test(status) && /loca|alug/.test(status))) return null;
  const slug = string(record.slug);
  if (!slug || !/^[\w-]+$/.test(slug)) return null;
  const validNumber = (value: unknown) => value === '$undefined' ? null : parseBrNumber(string(value));
  const gallery = Array.isArray(record.gallery) ? record.gallery.map((p) => string(object(p).src)).filter((p): p is string => !!p) : [];
  return {
    externalId: string(record.id) ?? slug, url: `${base}/imoveis/${slug}`, transaction, type,
    title: string(record.title) ?? 'Imóvel residencial', price: validNumber(record.priceValue),
    condoFee: validNumber(record.condoFee), iptu: validNumber(record.iptuFee),
    privateArea: validNumber(record.area), totalArea: validNumber(record.totalArea),
    bedrooms: parseInteger(string(record.bedrooms)), suites: parseInteger(string(record.suites)),
    bathrooms: parseInteger(string(record.bathrooms)), parkingSpots: parseInteger(string(record.parkingSpaces)),
    neighborhood: string(location.neighborhood), address: null, latitude: null, longitude: null,
    description: string(record.description === '$undefined' ? null : record.description) ?? string(record.highlight),
    photos: gallery.length ? gallery : [string(object(record.image).src)].filter((p): p is string => !!p),
    features: [...(Array.isArray(record.amenities) ? record.amenities : []), ...(Array.isArray(record.tags) ? record.tags : [])].filter((v): v is string => typeof v === 'string' && v !== '$undefined'),
  };
}

export const imobiliariaChapecoAdapter: PlatformAdapter = {
  platform: 'chapeco-nextjs',
  async *scrape(source, ctx) {
    // A API de paginação está bloqueada por robots.txt. O sitemap e os detalhes são públicos e permitidos.
    const $ = cheerio.load(await ctx.http.text(`${source.website}/sitemap.xml`), { xmlMode: true });
    const urls = [...new Set($('url > loc').map((_, el) => $(el).text().trim()).get())]
      .filter((url) => new URL(url).origin === new URL(source.website).origin && /^\/imoveis\/\d+-/.test(new URL(url).pathname))
      .slice(0, ctx.maxPages * 24);
    if (!urls.length) throw new Error('Sitemap não contém anúncios; conferir formato da fonte');
    for (const url of urls) {
      const html = cheerio.load(await ctx.http.text(url));
      const id = new URL(url).pathname.split('/').pop()?.match(/^(\d+)-/)?.[1];
      const record = nextFlightObjects(html).find((p) => String(p.id) === id);
      if (!record) throw new Error(`Dados do anúncio não encontrados em ${url}`);
      const property = parseChapecoProperty(record, source.website);
      if (property && ctx.transactions.includes(property.transaction)) yield property;
    }
  },
};
