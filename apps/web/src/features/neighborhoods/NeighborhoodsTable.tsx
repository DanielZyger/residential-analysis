import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { NeighborhoodStats, TransactionType } from '@er/shared';
import { BarTrack } from '../../components/BarTrack';
import { SortHeader } from '../../components/SortHeader';
import { cx } from '../../utils/cx';
import { formatCurrency, formatNumber, formatPricePerM2 } from '../../utils/format';
import { rankingHref } from '../../utils/query';

type ColumnKey = 'name' | 'count' | 'medianPricePerM2' | 'avgPricePerM2' | 'minPricePerM2' | 'maxPricePerM2' | 'medianPrice';

interface NeighborhoodsTableProps {
  items: NeighborhoodStats[];
  transaction: TransactionType;
  cityMedian: number | null;
}

const NUMERIC_COLUMNS: { key: Exclude<ColumnKey, 'name' | 'count' | 'medianPricePerM2'>; label: string; format: (value: number | null) => string; className?: string }[] = [
  { key: 'avgPricePerM2', label: 'Média m²', format: formatPricePerM2, className: 'd-none d-md-table-cell' },
  { key: 'minPricePerM2', label: 'Mín. m²', format: formatPricePerM2, className: 'd-none d-xl-table-cell' },
  { key: 'maxPricePerM2', label: 'Máx. m²', format: formatPricePerM2, className: 'd-none d-xl-table-cell' },
  { key: 'medianPrice', label: 'Mediana preço', format: (value) => formatCurrency(value), className: 'd-none d-lg-table-cell' },
];

function compare(a: NeighborhoodStats, b: NeighborhoodStats, key: ColumnKey): number {
  if (key === 'name') return a.name.localeCompare(b.name, 'pt-BR');
  const left = a[key];
  const right = b[key];
  if (left == null && right == null) return 0;
  if (left == null) return 1;
  if (right == null) return -1;
  return left - right;
}

export function NeighborhoodsTable({ items, transaction, cityMedian }: NeighborhoodsTableProps) {
  const [sortKey, setSortKey] = useState<ColumnKey>('medianPricePerM2');
  const [direction, setDirection] = useState<'asc' | 'desc'>('desc');

  const sorted = useMemo(() => {
    const factor = direction === 'asc' ? 1 : -1;
    return [...items].sort((a, b) => {
      const result = compare(a, b, sortKey);
      if (result === 0) return 0;
      if (sortKey !== 'name' && (a[sortKey] == null || b[sortKey] == null)) return result;
      return result * factor;
    });
  }, [items, sortKey, direction]);

  const maxMedian = useMemo(() => Math.max(cityMedian ?? 0, ...items.map((item) => item.medianPricePerM2 ?? 0)), [items, cityMedian]);

  const onSort = (key: ColumnKey) => {
    if (key === sortKey) {
      setDirection((value) => (value === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(key);
    setDirection(key === 'name' ? 'asc' : 'desc');
  };

  const headerProps = { activeKey: sortKey, direction, onSort };
  const cityMarker = cityMedian != null ? { value: cityMedian, label: `Mediana da cidade: ${formatPricePerM2(cityMedian)}` } : null;

  return (
    <div className="er-surface p-0 overflow-hidden">
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0 neighborhoods-table">
          <caption className="visually-hidden">Preço do metro quadrado por bairro. Clique no nome do bairro para ver os imóveis no ranking.</caption>
          <thead>
            <tr>
              <SortHeader label="Bairro" sortKey="name" {...headerProps} />
              <SortHeader label="Imóveis" sortKey="count" align="end" {...headerProps} />
              <SortHeader label="Mediana m²" sortKey="medianPricePerM2" {...headerProps} />
              {NUMERIC_COLUMNS.map((column) => (
                <SortHeader key={column.key} label={column.label} sortKey={column.key} align="end" className={column.className} {...headerProps} />
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((item) => {
              const aboveCity = cityMedian != null && item.medianPricePerM2 != null && item.medianPricePerM2 > cityMedian;
              return (
                <tr key={item.slug}>
                  <th scope="row" className="fw-semibold">
                    <Link to={rankingHref({ transaction, neighborhoods: [item.slug] })} className="neighborhoods-table__link">
                      {item.name}
                      <i className="bi bi-arrow-right-short" aria-hidden="true" />
                    </Link>
                  </th>
                  <td className="text-end er-tabular">{formatNumber(item.count)}</td>
                  <td className="neighborhoods-table__median">
                    <div className="er-tabular fw-semibold">{formatPricePerM2(item.medianPricePerM2)}</div>
                    <BarTrack value={item.medianPricePerM2} max={maxMedian} size="sm" tone={aboveCity ? 'warning' : 'accent'} marker={cityMarker} />
                  </td>
                  {NUMERIC_COLUMNS.map((column) => (
                    <td key={column.key} className={cx('text-end er-tabular', column.className)}>
                      {column.format(item[column.key])}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
