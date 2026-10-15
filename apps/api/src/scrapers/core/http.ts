import { isAllowed, parseRobots, type RobotsRules } from './robots';
import type { Logger } from './logger';

export const USER_AGENT = 'ErechimResidencialBot/0.1 (+analise de mercado residencial; contato via site)';

interface HttpOptions {
  minIntervalMs: number;
  retries: number;
  timeoutMs: number;
  log: Logger;
}

function charsetOf(contentType: string | null, bytes: Uint8Array): string {
  const fromHeader = contentType?.match(/charset=["']?([\w-]+)/i)?.[1];
  if (fromHeader) return fromHeader;
  const head = new TextDecoder('latin1').decode(bytes.subarray(0, 2048));
  return head.match(/<meta[^>]+charset=["']?([\w-]+)/i)?.[1] ?? 'utf-8';
}

function decode(bytes: Uint8Array, contentType: string | null): string {
  try {
    return new TextDecoder(charsetOf(contentType, bytes)).decode(bytes);
  } catch {
    return new TextDecoder('utf-8').decode(bytes);
  }
}

export class RobotsDisallowedError extends Error {}
export class BlockedError extends Error {}
class HttpStatusError extends Error {}

const BLOCKING_STATUSES = new Set([403, 405, 429]);

export function isFatalForSource(error: unknown): boolean {
  return error instanceof BlockedError || error instanceof RobotsDisallowedError;
}

export class HttpClient {
  private robots = new Map<string, Promise<RobotsRules>>();
  private lastRequest = new Map<string, Promise<void>>();

  constructor(private readonly options: HttpOptions) {}

  async text(url: string, init: RequestInit = {}): Promise<string> {
    const response = await this.request(url, init);
    const bytes = new Uint8Array(await response.arrayBuffer());
    return decode(bytes, response.headers.get('content-type'));
  }

  async json<T>(url: string, init: RequestInit = {}): Promise<T> {
    const response = await this.request(url, {
      ...init,
      headers: { accept: 'application/json', ...(init.headers ?? {}) },
    });
    return (await response.json()) as T;
  }

  private async request(url: string, init: RequestInit): Promise<Response> {
    const target = new URL(url);
    await this.assertAllowed(target);
    let lastError: unknown;
    for (let attempt = 0; attempt <= this.options.retries; attempt++) {
      await this.throttle(target.host);
      try {
        const response = await fetch(target, {
          ...init,
          headers: { 'user-agent': USER_AGENT, 'accept-language': 'pt-BR,pt;q=0.9', ...(init.headers ?? {}) },
          signal: AbortSignal.timeout(this.options.timeoutMs),
        });
        if (response.ok) return response;
        if (BLOCKING_STATUSES.has(response.status)) {
          throw new BlockedError(`site bloqueou a coleta (HTTP ${response.status}) em ${url}`);
        }
        if (response.status < 500) throw new HttpStatusError(`HTTP ${response.status} em ${url}`);
        lastError = new Error(`HTTP ${response.status} em ${url}`);
      } catch (error) {
        if (error instanceof BlockedError || error instanceof HttpStatusError) throw error;
        lastError = error;
      }
      await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
    }
    throw lastError instanceof Error ? lastError : new Error(String(lastError));
  }

  private async assertAllowed(target: URL): Promise<void> {
    const rules = await this.getRobots(target);
    if (!isAllowed(rules, target.pathname + target.search)) {
      throw new RobotsDisallowedError(`robots.txt bloqueia ${target.href}`);
    }
  }

  private getRobots(target: URL): Promise<RobotsRules> {
    const key = target.origin;
    let cached = this.robots.get(key);
    if (!cached) {
      cached = (async () => {
        try {
          await this.throttle(target.host);
          const res = await fetch(`${key}/robots.txt`, {
            headers: { 'user-agent': USER_AGENT },
            signal: AbortSignal.timeout(this.options.timeoutMs),
          });
          if (!res.ok) return { allow: [], disallow: [] };
          return parseRobots(await res.text(), USER_AGENT);
        } catch {
          this.options.log.warn(`robots.txt indisponível em ${key}`);
          return { allow: [], disallow: [] };
        }
      })();
      this.robots.set(key, cached);
    }
    return cached;
  }

  private throttle(host: string): Promise<void> {
    const previous = this.lastRequest.get(host) ?? Promise.resolve();
    const next = previous.then(() => new Promise<void>((r) => setTimeout(r, this.options.minIntervalMs)));
    this.lastRequest.set(host, next);
    return previous;
  }
}
