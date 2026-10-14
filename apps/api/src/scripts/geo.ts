import path from 'node:path';
import { CITY_NAME, CITY_IBGE_CODE } from '@er/shared';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { config } from '../config';
import { HttpClient } from '../scrapers/core/http';
import { createLogger } from '../scrapers/core/logger';
import { NEIGHBORHOOD_ALIASES } from '../data/neighborhoods';
import { normalizeNeighborhood } from '../scrapers/core/normalize';
import type { GeoData } from '../repositories/geoRepository';

interface OverpassElement {
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

const ENDPOINTS = ['https://overpass.kumi.systems/api/interpreter', 'https://overpass.private.coffee/api/interpreter'];
const QUERY = `[out:json][timeout:90];area["ref:IBGE"="${CITY_IBGE_CODE}"]["admin_level"="8"]->.a;(nwr(area.a)["place"~"^(city|suburb|neighbourhood|quarter)$"];rel(area.a)["boundary"="administrative"]["admin_level"="10"];);out center tags;`;

const log = createLogger('geo');
const http = new HttpClient({ minIntervalMs: 1000, retries: 0, timeoutMs: 180_000, log });

async function fetchPlaces(): Promise<OverpassElement[]> {
  for (const endpoint of ENDPOINTS) {
    try {
      const body = new URLSearchParams({ data: QUERY });
      const result = await http.json<{ elements: OverpassElement[] }>(endpoint, { method: 'POST', body });
      if (result.elements.length) return result.elements;
    } catch (error) {
      log.warn(`${endpoint}: ${(error as Error).message}`);
    }
  }
  throw new Error('Nenhum servidor Overpass respondeu');
}

function position(element: OverpassElement): { lat: number; lng: number } | null {
  const lat = element.lat ?? element.center?.lat;
  const lng = element.lon ?? element.center?.lon;
  return lat !== undefined && lng !== undefined && Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}

async function loadPlaces(): Promise<OverpassElement[]> {
  const nominatimFile = process.argv.find((arg) => arg.startsWith('--from-nominatim='))?.slice('--from-nominatim='.length);
  if (nominatimFile) {
    type Result = { name: string; lat: string; lon: string; address: { city?: string; municipality?: string; 'ISO3166-2-lvl4'?: string } };
    const rows = JSON.parse(await readFile(nominatimFile, 'utf8')) as { results: Result[] }[];
    return rows.flatMap((row) => row.results)
      .filter((r) => (r.address.city ?? r.address.municipality) === CITY_NAME && r.address['ISO3166-2-lvl4'] === 'BR-SC')
      .map((r) => ({ lat: Number(r.lat), lon: Number(r.lon), tags: { name: r.name, place: r.name === CITY_NAME ? 'city' : 'suburb' } }));
  }
  const file = process.argv.find((arg) => arg.startsWith('--from='))?.slice('--from='.length);
  if (!file) return fetchPlaces();
  return (JSON.parse(await readFile(file, 'utf8')) as { elements: OverpassElement[] }).elements;
}

async function main(): Promise<void> {
  const elements = (await loadPlaces()).filter((e) => e.tags?.place || e.tags?.admin_level === '10');
  const city = elements.find((e) => e.tags?.place === 'city' && e.tags?.name === CITY_NAME);
  const centralNeighborhood = elements.find((e) => e.tags?.name === 'Centro');
  const center = (centralNeighborhood && position(centralNeighborhood)) || (city && position(city));
  if (!center) throw new Error('Centro da cidade não encontrado no OpenStreetMap');
  const neighborhoods: GeoData['neighborhoods'] = {};
  for (const element of elements) {
    const point = position(element);
    const hood = element.tags?.place !== 'city' ? normalizeNeighborhood(element.tags?.name) : null;
    if (point && hood && NEIGHBORHOOD_ALIASES[hood.slug] && !neighborhoods[hood.slug]) neighborhoods[hood.slug] = { name: hood.name, ...point };
  }
  const geo: GeoData = { source: process.argv.some((arg) => arg.startsWith('--from-nominatim=')) ? 'OpenStreetMap / Nominatim (ODbL)' : 'OpenStreetMap (ODbL)', generatedAt: new Date().toISOString(), center, neighborhoods };
  await mkdir(path.dirname(config.geoPath), { recursive: true });
  await writeFile(config.geoPath, JSON.stringify(geo, null, 2));
  log.info(`${Object.keys(neighborhoods).length} bairros salvos em ${config.geoPath}`);
}

main().catch((error) => {
  log.error((error as Error).message);
  process.exit(1);
});
