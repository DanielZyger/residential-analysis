import { useId } from 'react';
import { useDebouncedState } from '../hooks/useDebouncedValue';
import { parseNumberInput } from '../utils/format';

interface RangeFieldProps {
  label: string;
  min: number | undefined;
  max: number | undefined;
  onChange: (range: { min: number | undefined; max: number | undefined }) => void;
  prefix?: string;
  suffix?: string;
  minPlaceholder?: string;
  maxPlaceholder?: string;
  step?: number;
}

function toText(value: number | undefined): string {
  return value == null ? '' : String(value);
}

export function RangeField({ label, min, max, onChange, prefix, suffix, minPlaceholder = 'Mín.', maxPlaceholder = 'Máx.', step = 1 }: RangeFieldProps) {
  const id = useId();
  const [minDraft, setMinDraft] = useDebouncedState(toText(min), (value) => onChange({ min: parseNumberInput(value), max }));
  const [maxDraft, setMaxDraft] = useDebouncedState(toText(max), (value) => onChange({ min, max: parseNumberInput(value) }));
  const inputs = [
    { key: 'min', value: minDraft, setValue: setMinDraft, placeholder: minPlaceholder, aria: `${label} mínimo` },
    { key: 'max', value: maxDraft, setValue: setMaxDraft, placeholder: maxPlaceholder, aria: `${label} máximo` },
  ];
  return (
    <fieldset>
      <legend id={id} className="form-label fs-6 mb-2">
        {label}
      </legend>
      <div className="row g-2">
        {inputs.map((input) => (
          <div className="col-6" key={input.key}>
            <div className="input-group input-group-sm">
              {prefix && <span className="input-group-text">{prefix}</span>}
              <input
                type="number"
                inputMode="numeric"
                min={0}
                step={step}
                className="form-control"
                value={input.value}
                placeholder={input.placeholder}
                aria-label={input.aria}
                onChange={(event) => input.setValue(event.target.value)}
              />
              {suffix && <span className="input-group-text">{suffix}</span>}
            </div>
          </div>
        ))}
      </div>
    </fieldset>
  );
}
