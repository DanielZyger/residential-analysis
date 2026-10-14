import type { Html } from './html';
import { cleanText } from '../../utils/text';

export type JsonObject = Record<string, unknown>;
export const object = (value: unknown): JsonObject => value && typeof value === 'object' && !Array.isArray(value) ? value as JsonObject : {};
export const string = (value: unknown): string | null => typeof value === 'string' || typeof value === 'number' ? cleanText(value) : null;

// Alguns sites publicam quebras de linha literais dentro das strings JSON-LD.
export function parsePublicJson(text: string): unknown {
  let quoted = false;
  let escaped = false;
  let fixed = '';
  for (const char of text) {
    if (quoted && char.charCodeAt(0) < 32) fixed += `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`;
    else fixed += char;
    if (char === '"' && !escaped) quoted = !quoted;
    escaped = char === '\\' && !escaped;
  }
  return JSON.parse(fixed);
}

export function structuredBlocks($: Html): JsonObject[] {
  const result: JsonObject[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const value = parsePublicJson($(el).text());
      for (const item of Array.isArray(value) ? value : [value]) {
        const record = object(item);
        result.push(...(Array.isArray(record['@graph']) ? record['@graph'].map(object) : [record]));
      }
    } catch { /* Um bloco de SEO inválido não invalida os demais. */ }
  });
  return result;
}

export function nextFlightObjects($: Html): JsonObject[] {
  let stream = '';
  $('script:not([src])').each((_, el) => {
    const match = $(el).text().match(/^self\.__next_f\.push\((.*)\)\s*;?$/s);
    if (!match) return;
    try {
      const chunk = JSON.parse(match[1]);
      if (chunk[0] === 1 && typeof chunk[1] === 'string') stream += chunk[1];
    } catch { /* Nunca executar scripts do site. */ }
  });
  // Flight tem registros T com tamanho em bytes, sem delimitador após o texto.
  // Descrições longas podem conter novas linhas e terminar imediatamente antes de outro registro.
  const bytes = Buffer.from(stream, 'utf8');
  const records = new Map<string, unknown>();
  let offset = 0;
  while (offset < bytes.length) {
    const colon = bytes.indexOf(':', offset);
    if (colon < 0) break;
    const id = bytes.subarray(offset, colon).toString('utf8').trim();
    if (!/^[\da-f]*$/.test(id)) break;
    const start = colon + 1;
    if (bytes[start] === 84) {
      const comma = bytes.indexOf(',', start);
      if (comma < 0) break;
      const size = Number.parseInt(bytes.subarray(start + 1, comma).toString(), 16);
      if (!Number.isFinite(size) || comma + 1 + size > bytes.length) break;
      records.set(id, bytes.subarray(comma + 1, comma + 1 + size).toString('utf8'));
      offset = comma + 1 + size;
    } else {
      const newline = bytes.indexOf('\n', start);
      const end = newline < 0 ? bytes.length : newline;
      const row = bytes.subarray(start, end).toString('utf8');
      if (/^[\[{"]/.test(row)) {
        try { records.set(id, JSON.parse(row)); } catch { /* Metadados React não são imóveis. */ }
      }
      offset = end + 1;
    }
    while (bytes[offset] === 10 || bytes[offset] === 13) offset++;
  }
  function resolve(value: unknown, depth = 0): unknown {
    if (depth > 20) return value;
    if (typeof value === 'string') {
      const reference = value.match(/^\$([\da-f]+)$/);
      return reference && records.has(reference[1]) ? resolve(records.get(reference[1]), depth + 1) : value;
    }
    if (Array.isArray(value)) return value.map((v) => resolve(v, depth + 1));
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, resolve(v, depth + 1)]));
    return value;
  }
  const result: JsonObject[] = [];
  const visited = new Set<unknown>();
  function walk(value: unknown): void {
    if (!value || typeof value !== 'object' || visited.has(value)) return;
    visited.add(value);
    const record = object(value);
    if (record.id && record.propertyType && record.location) result.push(object(resolve(record)));
    for (const child of Object.values(value)) walk(child);
  }
  for (const value of records.values()) walk(value);
  return result;
}
