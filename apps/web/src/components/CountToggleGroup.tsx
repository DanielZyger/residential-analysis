import { Fragment, useId } from 'react';
import { countOptionLabel, isOpenEnded, type CountFilterConfig } from '@er/shared';
import { cx } from '../utils/cx';

interface CountToggleGroupProps {
  config: CountFilterConfig;
  value: number[] | undefined;
  onChange: (value: number[] | undefined) => void;
}

export function CountToggleGroup({ config, value = [], onChange }: CountToggleGroupProps) {
  const name = useId();
  const toggle = (option: number) => {
    const next = value.includes(option) ? value.filter((item) => item !== option) : [...value, option].sort((a, b) => a - b);
    onChange(next.length ? next : undefined);
  };
  return (
    <fieldset>
      <legend className="form-label fs-6 mb-2">{config.label}</legend>
      <div className="btn-group btn-group-sm count-toggle-group" role="group" aria-label={config.label}>
        <button type="button" className={cx('btn btn-outline-secondary', value.length === 0 && 'active')} aria-pressed={value.length === 0} onClick={() => onChange(undefined)}>
          Todos
        </button>
        {config.options.map((option) => {
          const id = `${name}-${option}`;
          const checked = value.includes(option);
          return (
            <Fragment key={option}>
              <input type="checkbox" className="btn-check" id={id} checked={checked} onChange={() => toggle(option)} />
              <label className="btn btn-outline-secondary" htmlFor={id} aria-label={countOptionLabel(config, option, true)} title={isOpenEnded(config, option) ? `${option} ou mais` : undefined}>
                {countOptionLabel(config, option)}
              </label>
            </Fragment>
          );
        })}
      </div>
      <div className="form-text">Selecione um ou mais valores.</div>
    </fieldset>
  );
}
