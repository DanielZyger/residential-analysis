import { cx } from '../../utils/cx';
import './ranking.scss';

interface PropertyCardSkeletonProps {
  layout?: 'list' | 'grid';
}

export function PropertyCardSkeleton({ layout = 'list' }: PropertyCardSkeletonProps) {
  return (
    <div className={cx('property-card', `property-card--${layout}`, 'placeholder-glow')} aria-hidden="true">
      <div className="property-card__media er-media">
        <span className="placeholder w-100 h-100" />
      </div>
      <div className="property-card__body">
        <span className="placeholder col-3 rounded" />
        <span className="placeholder placeholder-lg col-9 rounded" />
        <span className="placeholder col-5 rounded" />
        <span className="placeholder placeholder-lg col-4 rounded mt-2" />
        <div className="d-flex gap-2 mt-2">
          <span className="placeholder col-2 rounded-pill" />
          <span className="placeholder col-2 rounded-pill" />
          <span className="placeholder col-2 rounded-pill" />
        </div>
      </div>
    </div>
  );
}
