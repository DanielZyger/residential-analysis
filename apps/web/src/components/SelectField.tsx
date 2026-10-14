import { useId } from 'react';
import { cx } from '../utils/cx';

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

interface SelectFieldProps<T extends string> {
  label: string;
  value: T;
  options: readonly SelectOption<T>[];
  onChange: (value: T) => void;
  hideLabel?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function SelectField<T extends string>({ label, value, options, onChange, hideLabel, size = 'md', className }: SelectFieldProps<T>) {
  const id = useId();
  return (
    <div className={cx(hideLabel ? undefined : 'd-flex align-items-center gap-2', className)}>
      <label htmlFor={id} className={cx(hideLabel ? 'visually-hidden' : 'form-label mb-0 text-nowrap small text-body-secondary')}>
        {label}
      </label>
      <select id={id} className={cx('form-select', size === 'sm' && 'form-select-sm')} value={value} onChange={(event) => onChange(event.target.value as T)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
