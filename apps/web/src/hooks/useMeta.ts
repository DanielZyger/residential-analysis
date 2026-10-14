import { useMemo } from 'react';
import { getMeta } from '../api/client';
import { useApi } from './useApi';

export function useMeta() {
  const state = useApi(() => getMeta(), []);
  const lookups = useMemo(() => {
    const meta = state.data;
    return {
      sourceNames: new Map(meta?.sources.map((source) => [source.id, source.name]) ?? []),
      neighborhoodNames: new Map(meta?.neighborhoods.map((item) => [item.slug, item.name]) ?? []),
    };
  }, [state.data]);
  return { ...state, ...lookups };
}

export type MetaState = ReturnType<typeof useMeta>;
