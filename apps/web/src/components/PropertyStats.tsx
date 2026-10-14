import type { Property } from '@er/shared';
import { cx } from '../utils/cx';
import { formatArea } from '../utils/format';
import { StatPill } from './StatPill';

type StatsSource = Pick<Property, 'bedrooms' | 'suites' | 'parkingSpots' | 'area' | 'bathrooms'>;

interface PropertyStatsProps {
  property: StatsSource;
  showBathrooms?: boolean;
  className?: string;
}

interface StatDefinition {
  key: keyof StatsSource;
  icon: string;
  singular: string;
  plural: string;
}

const STATS: StatDefinition[] = [
  { key: 'bedrooms', icon: 'door-closed', singular: 'dormitório', plural: 'dormitórios' },
  { key: 'suites', icon: 'door-open', singular: 'suíte', plural: 'suítes' },
  { key: 'bathrooms', icon: 'droplet', singular: 'banheiro', plural: 'banheiros' },
  { key: 'parkingSpots', icon: 'car-front', singular: 'vaga', plural: 'vagas' },
];

export function PropertyStats({ property, showBathrooms = false, className }: PropertyStatsProps) {
  const stats = STATS.filter((stat) => showBathrooms || stat.key !== 'bathrooms');
  return (
    <ul className={cx('property-stats', className)}>
      {stats.map((stat) => {
        const value = property[stat.key];
        if (value == null || value <= 0) return null;
        return (
          <li key={stat.key}>
            <StatPill icon={stat.icon} label={value === 1 ? stat.singular : stat.plural} value={`${value} ${value === 1 ? stat.singular : stat.plural}`} />
          </li>
        );
      })}
      {property.area != null && (
        <li>
          <StatPill icon="rulers" label="Área" value={formatArea(property.area)} />
        </li>
      )}
    </ul>
  );
}
