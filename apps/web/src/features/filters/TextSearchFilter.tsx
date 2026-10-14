import { SearchInput } from '../../components/SearchInput';
import { useDebouncedState } from '../../hooks/useDebouncedValue';

interface TextSearchFilterProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}

export function TextSearchFilter({ value, onChange }: TextSearchFilterProps) {
  const [draft, setDraft] = useDebouncedState(value ?? '', (next) => onChange(next.trim() || undefined));
  return <SearchInput label="Buscar por título, código ou endereço" value={draft} onChange={setDraft} placeholder="Título, código, rua…" hideLabel={false} size="sm" />;
}
