import { useCallback, useEffect, useState, type DependencyList } from 'react';
import { isAbortError } from '../api/client';

interface ApiSnapshot<T> {
  data: T | undefined;
  error: Error | undefined;
  loading: boolean;
}

export interface ApiState<T> extends ApiSnapshot<T> {
  reload: () => void;
}

interface UseApiOptions {
  keepPreviousData?: boolean;
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error('Erro inesperado.');
}

export function useApi<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  deps: DependencyList,
  { keepPreviousData = false }: UseApiOptions = {},
): ApiState<T> {
  const [snapshot, setSnapshot] = useState<ApiSnapshot<T>>({ data: undefined, error: undefined, loading: true });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setSnapshot((previous) => ({
      data: keepPreviousData ? previous.data : undefined,
      error: undefined,
      loading: true,
    }));
    fetcher(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setSnapshot({ data, error: undefined, loading: false });
      },
      (error: unknown) => {
        if (controller.signal.aborted || isAbortError(error)) return;
        setSnapshot((previous) => ({ data: previous.data, error: toError(error), loading: false }));
      },
    );
    return () => controller.abort();
  }, [...deps, attempt]);

  const reload = useCallback(() => setAttempt((value) => value + 1), []);

  return { ...snapshot, reload };
}
