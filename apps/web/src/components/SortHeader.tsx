import { cx } from '../utils/cx';

interface SortHeaderProps<K extends string> {
  label: string;
  sortKey: K;
  activeKey: K;
  direction: 'asc' | 'desc';
  onSort: (key: K) => void;
  align?: 'start' | 'end';
  className?: string;
}

export function SortHeader<K extends string>({ label, sortKey, activeKey, direction, onSort, align = 'start', className }: SortHeaderProps<K>) {
  const active = sortKey === activeKey;
  const icon = !active ? 'arrow-down-up' : direction === 'asc' ? 'sort-up' : 'sort-down';
  return (
    <th scope="col" className={cx(align === 'end' && 'text-end', className)} aria-sort={active ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
      <button type="button" className={cx('sort-header', active && 'sort-header--active')} onClick={() => onSort(sortKey)}>
        {label}
        <i className={`bi bi-${icon}`} aria-hidden="true" />
      </button>
    </th>
  );
}
