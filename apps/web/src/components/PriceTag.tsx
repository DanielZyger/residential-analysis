import type { TransactionType } from '@er/shared';
import { cx } from '../utils/cx';
import { formatCurrency } from '../utils/format';

interface PriceTagProps {
  value: number | null | undefined;
  transaction?: TransactionType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PriceTag({ value, transaction, size = 'md', className }: PriceTagProps) {
  if (value == null) {
    return <span className={cx('price-tag', 'price-tag--empty', `price-tag--${size}`, className)}>Sob consulta</span>;
  }
  return (
    <span className={cx('price-tag', `price-tag--${size}`, className)}>
      {formatCurrency(value)}
      {transaction === 'rent' && <small className="price-tag__suffix">/mês</small>}
    </span>
  );
}
