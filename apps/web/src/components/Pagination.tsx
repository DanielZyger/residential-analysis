import { cx } from '../utils/cx';

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
}

type PageItem = number | 'gap-start' | 'gap-end';

function buildPages(page: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);
  const items: PageItem[] = [1];
  if (start > 2) items.push('gap-start');
  for (let current = start; current <= end; current += 1) items.push(current);
  if (end < totalPages - 1) items.push('gap-end');
  items.push(totalPages);
  return items;
}

export function Pagination({ page, totalPages, onChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;
  const items = buildPages(page, totalPages);
  return (
    <nav aria-label="Paginação" className={className}>
      <ul className="pagination justify-content-center flex-wrap mb-0">
        <li className={cx('page-item', page <= 1 && 'disabled')}>
          <button type="button" className="page-link" onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="Página anterior">
            <i className="bi bi-chevron-left" aria-hidden="true" />
          </button>
        </li>
        {items.map((item) =>
          typeof item === 'number' ? (
            <li key={item} className={cx('page-item', item === page && 'active')}>
              <button
                type="button"
                className="page-link er-tabular"
                onClick={() => onChange(item)}
                aria-current={item === page ? 'page' : undefined}
                aria-label={`Página ${item}`}
              >
                {item}
              </button>
            </li>
          ) : (
            <li key={item} className="page-item disabled" aria-hidden="true">
              <span className="page-link">…</span>
            </li>
          ),
        )}
        <li className={cx('page-item', page >= totalPages && 'disabled')}>
          <button type="button" className="page-link" onClick={() => onChange(page + 1)} disabled={page >= totalPages} aria-label="Próxima página">
            <i className="bi bi-chevron-right" aria-hidden="true" />
          </button>
        </li>
      </ul>
    </nav>
  );
}
