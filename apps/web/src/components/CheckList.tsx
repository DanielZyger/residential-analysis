import { useId, useMemo, useState } from 'react';
import { formatNumber } from '../utils/format';
import { SearchInput } from './SearchInput';

export interface CheckOption {
  value: string;
  label: string;
  count?: number;
}

interface CheckListProps {
  label: string;
  options: readonly CheckOption[];
  selected: readonly string[];
  onChange: (selected: string[]) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
}

function normalize(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export function CheckList({ label, options, selected, onChange, searchable = false, searchPlaceholder = 'Buscar…' }: CheckListProps) {
  const id = useId();
  const [term, setTerm] = useState('');
  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const visible = useMemo(() => {
    const query = normalize(term.trim());
    const filtered = query ? options.filter((option) => normalize(option.label).includes(query)) : options;
    return [...filtered].sort((a, b) => Number(selectedSet.has(b.value)) - Number(selectedSet.has(a.value)));
  }, [options, term, selectedSet]);

  const toggle = (value: string) => {
    onChange(selectedSet.has(value) ? selected.filter((item) => item !== value) : [...selected, value]);
  };

  return (
    <fieldset className="check-list">
      <legend className="form-label fs-6 mb-2 d-flex justify-content-between align-items-center">
        <span>{label}</span>
        {selected.length > 0 && (
          <button type="button" className="btn btn-link btn-sm p-0" onClick={() => onChange([])}>
            Limpar ({selected.length})
          </button>
        )}
      </legend>
      {searchable && <SearchInput label={`Buscar em ${label.toLowerCase()}`} value={term} onChange={setTerm} placeholder={searchPlaceholder} size="sm" />}
      <div className="check-list__options">
        {visible.length === 0 && <p className="small text-body-secondary mb-0">Nenhuma opção encontrada.</p>}
        {visible.map((option) => {
          const inputId = `${id}-${option.value}`;
          return (
            <div className="check-list__option" key={option.value}>
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id={inputId} checked={selectedSet.has(option.value)} onChange={() => toggle(option.value)} />
                <label className="form-check-label" htmlFor={inputId}>
                  {option.label}
                </label>
              </div>
              {option.count != null && <span className="check-list__count">{formatNumber(option.count)}</span>}
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
