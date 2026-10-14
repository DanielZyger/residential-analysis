import type { RankedProperty } from '@er/shared';
import { cx } from '../../utils/cx';
import { PropertyCard } from './PropertyCard';
import { PropertyCardSkeleton } from './PropertyCardSkeleton';

interface PropertyListProps {
  items?: RankedProperty[];
  layout?: 'list' | 'grid';
  startPosition?: number;
  skeletonCount?: number;
  refreshing?: boolean;
}

export function PropertyList({ items, layout = 'list', startPosition, skeletonCount = 6, refreshing = false }: PropertyListProps) {
  return (
    <ol className={cx('property-list', `property-list--${layout}`, refreshing && 'er-is-refreshing')} aria-busy={refreshing || !items}>
      {items
        ? items.map((property, index) => (
            <li key={property.id}>
              <PropertyCard
                property={property}
                position={startPosition != null ? startPosition + index : undefined}
                layout={layout}
              />
            </li>
          ))
        : Array.from({ length: skeletonCount }, (_, index) => (
            <li key={index}>
              <PropertyCardSkeleton layout={layout} />
            </li>
          ))}
    </ol>
  );
}
