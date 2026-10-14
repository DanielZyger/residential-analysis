import { Fragment, useId } from 'react';
import { TRANSACTION_LABELS, type TransactionType } from '@er/shared';
import { cx } from '../utils/cx';

interface TransactionToggleProps {
  value: TransactionType;
  onChange: (value: TransactionType) => void;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const OPTIONS: { value: TransactionType; icon: string }[] = [
  { value: 'sale', icon: 'house-check' },
  { value: 'rent', icon: 'key' },
];

export function TransactionToggle({ value, onChange, size = 'md', fullWidth = false }: TransactionToggleProps) {
  const name = useId();
  return (
    <div
      className={cx('btn-group', 'transaction-toggle', size !== 'md' && `btn-group-${size}`, fullWidth && 'd-flex')}
      role="radiogroup"
      aria-label="Tipo de negócio"
    >
      {OPTIONS.map((option) => {
        const id = `${name}-${option.value}`;
        return (
          <Fragment key={option.value}>
            <input type="radio" className="btn-check" name={name} id={id} checked={value === option.value} onChange={() => onChange(option.value)} />
            <label className={cx('btn', 'btn-outline-primary', fullWidth && 'flex-fill')} htmlFor={id}>
              <i className={`bi bi-${option.icon} me-1`} aria-hidden="true" />
              {TRANSACTION_LABELS[option.value]}
            </label>
          </Fragment>
        );
      })}
    </div>
  );
}
