export function stripAccents(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export function normalizeText(value: string | null | undefined): string {
  return stripAccents(value ?? '').toLowerCase().replace(/\s+/g, ' ').trim();
}

export function slugify(value: string): string {
  return normalizeText(value).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function cleanText(value: unknown): string | null {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const cleaned = String(value).replace(/\s+/g, ' ').trim();
  return cleaned.length ? cleaned : null;
}

export function titleCase(value: string): string {
  const lower = new Set(['de', 'da', 'do', 'das', 'dos', 'e']);
  return value
    .toLowerCase()
    .split(' ')
    .map((word, i) => (i > 0 && lower.has(word) ? word : word.charAt(0).toUpperCase() + word.slice(1)))
    .join(' ');
}

export function parseBrNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const match = value.replace(/\s/g, '').match(/\d[\d.,]*/);
  if (!match) return null;
  let raw = match[0];
  const lastComma = raw.lastIndexOf(',');
  const lastDot = raw.lastIndexOf('.');
  if (lastComma > lastDot) {
    raw = raw.replace(/\./g, '').replace(',', '.');
  } else if (lastDot > -1 && lastComma === -1 && /\.\d{3}$/.test(raw)) {
    raw = raw.replace(/\./g, '');
  } else {
    raw = raw.replace(/,/g, '');
  }
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseInteger(value: string | number | null | undefined): number | null {
  const parsed = parseBrNumber(value);
  return parsed === null ? null : Math.round(parsed);
}

export function hash(value: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < value.length; i++) {
    const ch = value.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}
