import { cx } from '../utils/cx';
import { formatDate } from '../utils/format';

interface SourceAttributionProps {
  sourceName: string;
  url: string;
  collectedAt: string;
  className?: string;
}

export function SourceAttribution({ sourceName, url, collectedAt, className }: SourceAttributionProps) {
  return (
    <div className={cx('source-attribution', className)}>
      <span>
        <i className="bi bi-building me-1" aria-hidden="true" />
        <span className="visually-hidden">Imobiliária: </span>
        <span className="source-attribution__name">{sourceName}</span>
      </span>
      <span title="Data da coleta">
        <i className="bi bi-clock-history me-1" aria-hidden="true" />
        Coletado em <span className="er-tabular">{formatDate(collectedAt)}</span>
      </span>
      <a href={url} target="_blank" rel="noopener noreferrer nofollow" className="fw-semibold">
        Ver anúncio original
        <i className="bi bi-box-arrow-up-right ms-1" aria-hidden="true" />
        <span className="visually-hidden"> (abre em nova aba)</span>
      </a>
    </div>
  );
}
