import { useEffect, useRef, useState } from 'react';

export const DEFAULT_DEBOUNCE_MS = 400;

export function useDebouncedValue<T>(value: T, delay = DEFAULT_DEBOUNCE_MS): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export function useDebouncedState<T>(value: T, onCommit: (value: T) => void, delay = DEFAULT_DEBOUNCE_MS) {
  const [draft, setDraft] = useState(value);
  const debounced = useDebouncedValue(draft, delay);
  const committed = useRef(value);
  const commitRef = useRef(onCommit);
  commitRef.current = onCommit;

  useEffect(() => {
    if (Object.is(value, committed.current)) return;
    committed.current = value;
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (Object.is(debounced, committed.current) || !Object.is(debounced, draft)) return;
    committed.current = debounced;
    commitRef.current(debounced);
  }, [debounced]);

  return [draft, setDraft] as const;
}
