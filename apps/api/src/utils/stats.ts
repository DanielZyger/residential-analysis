export function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function mean(values: number[]): number | null {
  if (!values.length) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

export function round(value: number, digits = 0): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function percentileRank(sortedValues: number[], value: number): number {
  if (sortedValues.length <= 1) return 50;
  let lo = 0;
  let hi = sortedValues.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (sortedValues[mid] < value) lo = mid + 1;
    else hi = mid;
  }
  let upper = lo;
  while (upper < sortedValues.length && sortedValues[upper] === value) upper++;
  const position = (lo + upper - 1) / 2;
  return (position / (sortedValues.length - 1)) * 100;
}

export function groupBy<T, K extends string>(items: T[], key: (item: T, index: number) => K): Map<K, T[]> {
  const map = new Map<K, T[]>();
  for (const [index, item] of items.entries()) {
    const k = key(item, index);
    const list = map.get(k);
    if (list) list.push(item);
    else map.set(k, [item]);
  }
  return map;
}
