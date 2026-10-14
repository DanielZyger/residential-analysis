import type { FastifyInstance } from 'fastify';
import type { Catalog } from '../services/catalog';
import { parseFilters, parseTransaction } from './parseFilters';

type Query = { Querystring: Record<string, string | undefined> };

export async function registerRoutes(app: FastifyInstance, getCatalog: () => Catalog): Promise<void> {
  const cache = (seconds: number) => `public, max-age=${seconds}`;

  app.get<Query>('/api/properties', async (req, reply) => {
    reply.header('cache-control', cache(60));
    return getCatalog().list(parseFilters(req.query));
  });

  app.get<{ Params: { id: string } }>('/api/properties/:id', async (req, reply) => {
    const detail = getCatalog().detail(req.params.id);
    if (!detail) return reply.code(404).send({ message: 'Imóvel não encontrado' });
    reply.header('cache-control', cache(300));
    return detail;
  });

  app.get<Query>('/api/neighborhoods', async (req, reply) => {
    reply.header('cache-control', cache(300));
    return getCatalog().neighborhoods(parseTransaction(req.query.transaction));
  });

  app.get('/api/sources', async (_req, reply) => {
    reply.header('cache-control', cache(300));
    return getCatalog().sources();
  });

  app.get('/api/meta', async (_req, reply) => {
    reply.header('cache-control', cache(300));
    return getCatalog().meta();
  });

  app.get('/api/health', async () => ({ ok: true }));
}
