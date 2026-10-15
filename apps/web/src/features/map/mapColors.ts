import { getScoreBand, type ScoreTone } from '../../utils/score';

const SEQUENTIAL_STEPS = 5;

function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function scoreColor(score: number): string {
  return cssVar(`--er-score-${getScoreBand(score).tone satisfies ScoreTone}`);
}

export function sequentialColors(): string[] {
  return Array.from({ length: SEQUENTIAL_STEPS }, (_, i) => cssVar(`--er-seq-${i + 1}`));
}

export interface ColorClass {
  min: number;
  max: number;
  color: string;
}

export function quantileClasses(values: number[]): ColorClass[] {
  const colors = sequentialColors();
  const sorted = [...values].sort((a, b) => a - b);
  if (!sorted.length) return [];
  const edges = colors.map((_, i) => sorted[Math.min(sorted.length - 1, Math.floor(((i + 1) * sorted.length) / colors.length) - 1)] ?? sorted[sorted.length - 1]);
  return colors.map((color, i) => ({ min: i === 0 ? sorted[0] : edges[i - 1], max: edges[i], color }));
}

export function classColor(classes: ColorClass[], value: number | null): string | null {
  if (value === null || !classes.length) return null;
  return (classes.find((c) => value <= c.max) ?? classes[classes.length - 1]).color;
}
