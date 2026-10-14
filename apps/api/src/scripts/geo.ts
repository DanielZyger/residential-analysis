import { readFile, writeFile } from 'node:fs/promises';
import { config } from '../config';
import { HttpClient } from '../scrapers/core/http';
import { createLogger } from '../scrapers/core/logger';
import { normalizeNeighborhood } from '../scrapers/core/normalize';
import type { GeoData } from '../repositories/geoRepository';

interface OverpassElement {
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

const ENDPOINTS = ['https://overpass.kumi.systems/api/interpreter', 'https://overpass.private.coffee/api/interpreter'];
const QUERY = `[out:json][timeout:90];area["name"="Erechim"]["admin_level"="8"]->.a;nwr(area.a)["place"~"^(city|suburb|neighbourhood|quarter)$"];out center tags;`;

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
  return lat !== undefined && lng !== undefined ? { lat, lng } : null;
}

async function loadPlaces(): Promise<OverpassElement[]> {
  const file = process.argv.find((arg) => arg.startsWith('--from='))?.slice('--from='.length);
  if (!file) return fetchPlaces();
  return (JSON.parse(await readFile(file, 'utf8')) as { elements: OverpassElement[] }).elements;
}

async function main(): Promise<void> {
  const elements = (await loadPlaces()).filter((e) => e.tags?.place);
  const city = elements.find((e) => e.tags?.place === 'city');
  const center = city && position(city);
  if (!center) throw new Error('Centro da cidade não encontrado no OpenStreetMap');
  const neighborhoods: GeoData['neighborhoods'] = {};
  for (const element of elements) {
    const point = position(element);
    const hood = element.tags?.place !== 'city' ? normalizeNeighborhood(element.tags?.name) : null;
    if (point && hood && !neighborhoods[hood.slug]) neighborhoods[hood.slug] = { name: hood.name, ...point };
  }
  const geo: GeoData = { source: 'OpenStreetMap (ODbL)', generatedAt: new Date().toISOString(), center, neighborhoods };
  await writeFile(config.geoPath, JSON.stringify(geo, null, 2));
  log.info(`${Object.keys(neighborhoods).length} bairros salvos em ${config.geoPath}`);
}

main().catch((error) => {
  log.error((error as Error).message);
  process.exit(1);
});
