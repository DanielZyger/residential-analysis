import { readFile } from 'node:fs/promises';
import { config } from '../config';

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface GeoData {
  source: string;
  generatedAt: string;
  center: GeoPoint;
  neighborhoods: Record<string, GeoPoint & { name: string }>;
}

export async function loadGeo(file = config.geoPath): Promise<GeoData | null> {
  try {
    return JSON.parse(await readFile(file, 'utf8')) as GeoData;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw error;
  }
}
