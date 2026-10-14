import { useId } from 'react';
import { cx } from '../utils/cx';

interface SearchInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hideLabel?: boolean;
  size?: 'sm' | 'md';
}

export function SearchInput({ label, value, onChange, placeholder, hideLabel = true, size = 'md' }: SearchInputProps) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className={cx(hideLabel ? 'visually-hidden' : 'form-label')}>
        {label}
      </label>
      <div className="search-input">
        <i className="bi bi-search" aria-hidden="true" />
        <input
          id={id}
          type="search"
          className={cx('form-control', size === 'sm' && 'form-control-sm')}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          autoComplete="off"
        />
      </div>
    </div>
  );
}
