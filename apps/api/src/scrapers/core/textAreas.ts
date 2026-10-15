import { normalizeText, parseBrNumber } from '../../utils/text';

const AREA_PATTERN = /(\d{2,4}(?:[.,]\d{1,2})?)\s*(?:m²|m2|mts²|metros quadrados)/gi;
const EXCLUDED_CONTEXT = /(lazer|terreno|lote|comum|condominio|loja|sala comercial|garage|box|empreendimento|frente|fundos|testada|total)\W*(?:\S+\s+){0,3}$/;
const BUILT_CONTEXT = /(privativa|construida|util|interna)\W*(?:\S+\s+){0,3}$/;
const BEDROOMS_PATTERN = /(\d{1,2})\s*(?:dormitorios?|dorms?\.?|quartos?)\b/;
const SUITES_PATTERN = /(\d{1,2})\s*suites?\b/;
const MULTIPLE_BEDROOMS = /\d{1,2}\s*(?:,|e|ou|\/|a)\s*\d{1,2}\s*(?:dormitorios?|dorms?\.?|quartos?|suites?)\b/;
const STUDIO_PATTERN = /\b(studio|estudio|loft|kitnet|jk)\b/;
const SEGMENT_SPLIT = /;|(?=\b(?:casa|apto|apartamento|planta|unidade|tipo)\s*0?\d+\s*[:\-–])/i;
const MIN_AREA = 15;
const MAX_AREA = 800;

interface AreaMention {
  value: number;
  context: string;
}

function mentions(text: string): AreaMention[] {
  const found: AreaMention[] = [];
  for (const match of text.matchAll(AREA_PATTERN)) {
    const value = parseBrNumber(match[1]);
    if (value === null || value < MIN_AREA || value > MAX_AREA) continue;
    found.push({ value, context: normalizeText(text.slice(Math.max(0, (match.index ?? 0) - 40), match.index)) });
  }
  return found;
}

export function builtAreaFromText(text: string | null): number | null {
  if (!text) return null;
  return mentions(text).find((m) => BUILT_CONTEXT.test(m.context) && !EXCLUDED_CONTEXT.test(m.context))?.value ?? null;
}

function bedroomsOf(segment: string): number | null {
  const text = normalizeText(segment);
  if (MULTIPLE_BEDROOMS.test(text)) return null;
  const match = text.match(BEDROOMS_PATTERN) ?? text.match(SUITES_PATTERN);
  if (match) return Number.parseInt(match[1], 10);
  return STUDIO_PATTERN.test(text) ? 0 : null;
}

export function planAreasFromSegments(segments: string[]): Map<number, number> {
  const areas = new Map<number, number>();
  for (const segment of segments.flatMap((s) => s.split(SEGMENT_SPLIT))) {
    const bedrooms = bedroomsOf(segment);
    if (bedrooms === null) continue;
    const candidates = mentions(segment).filter((m) => !EXCLUDED_CONTEXT.test(m.context));
    const area = candidates.length === 1 ? candidates[0].value : undefined;
    if (area !== undefined) areas.set(bedrooms, Math.min(area, areas.get(bedrooms) ?? Infinity));
  }
  return areas;
}
