import type { Property } from './domain';

export type CountFilterKey = 'bedrooms' | 'suites' | 'parking';

export interface CountFilterConfig {
  key: CountFilterKey;
  field: keyof Pick<Property, 'bedrooms' | 'suites' | 'parkingSpots'>;
  label: string;
  singular: string;
  plural: string;
  none: string;
  options: readonly number[];
}

export const COUNT_FILTERS: readonly CountFilterConfig[] = [
  { key: 'bedrooms', field: 'bedrooms', label: 'Dormitórios', singular: 'dormitório', plural: 'dormitórios', none: 'Sem dormitório', options: [1, 2, 3, 4] },
  { key: 'suites', field: 'suites', label: 'Suítes', singular: 'suíte', plural: 'suítes', none: 'Sem suíte', options: [0, 1, 2, 3] },
  { key: 'parking', field: 'parkingSpots', label: 'Vagas de garagem', singular: 'vaga', plural: 'vagas', none: 'Sem vaga', options: [0, 1, 2, 3] },
];

export function isOpenEnded(config: CountFilterConfig, option: number): boolean {
  return option === config.options[config.options.length - 1] && option > 0;
}

export function countOptionLabel(config: CountFilterConfig, option: number, long = false): string {
  const text = isOpenEnded(config, option) ? `${option}+` : String(option);
  if (!long) return option === 0 ? 'Nenhuma' : text;
  if (option === 0) return config.none;
  return `${text} ${option === 1 ? config.singular : config.plural}`;
}

export function matchesCount(config: CountFilterConfig, value: number | null, selected: readonly number[]): boolean {
  if (value === null) return false;
  return selected.some((option) => (isOpenEnded(config, option) ? value >= option : value === option));
}
