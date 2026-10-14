import type {
  MetaResponse,
  NeighborhoodListResponse,
  PropertyDetailResponse,
  PropertyFilters,
  PropertyListResponse,
  SourceListResponse,
  TransactionType,
} from '@er/shared';
import { filtersToParams } from '../utils/query';

const BASE_URL = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '');
const META_TTL_MS = 5 * 60 * 1000;

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

interface RequestOptions {
  query?: URLSearchParams;
  signal?: AbortSignal;
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();
    if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string') return body.message;
  } catch {
    return `Erro ${response.status} ao consultar o servidor.`;
  }
  return `Erro ${response.status} ao consultar o servidor.`;
}

export async function request<T>(path: string, { query, signal }: RequestOptions = {}): Promise<T> {
  const search = query?.toString();
  const url = `${BASE_URL}${path}${search ? `?${search}` : ''}`;
  let response: Response;
  try {
    response = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw new ApiError('Não foi possível conectar ao servidor. Verifique se a API está em execução.', 0);
  }
  if (!response.ok) {
    if (response.status === 404) throw new ApiError('Recurso não encontrado.', 404);
    throw new ApiError(await readErrorMessage(response), response.status);
  }
  return (await response.json()) as T;
}

const cache = new Map<string, { expiresAt: number; promise: Promise<unknown> }>();

function cached<T>(key: string, ttl: number, load: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && hit.expiresAt > Date.now()) return hit.promise as Promise<T>;
  const promise = load().catch((error: unknown) => {
    cache.delete(key);
    throw error;
  });
  cache.set(key, { expiresAt: Date.now() + ttl, promise });
  return promise;
}

export function listProperties(filters: PropertyFilters, signal?: AbortSignal) {
  return request<PropertyListResponse>('/properties', { query: filtersToParams(filters), signal });
}

export function getProperty(id: string, signal?: AbortSignal) {
  return request<PropertyDetailResponse>(`/properties/${encodeURIComponent(id)}`, { signal });
}

export function listNeighborhoods(transaction: TransactionType, signal?: AbortSignal) {
  return request<NeighborhoodListResponse>('/neighborhoods', { query: new URLSearchParams({ transaction }), signal });
}

export function listSources(signal?: AbortSignal) {
  return request<SourceListResponse>('/sources', { signal });
}

export function getMeta() {
  return cached('meta', META_TTL_MS, () => request<MetaResponse>('/meta'));
}
