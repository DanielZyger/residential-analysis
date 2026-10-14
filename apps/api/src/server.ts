import Fastify from 'fastify';
import cors from '@fastify/cors';
import compress from '@fastify/compress';
import { watch } from 'node:fs';
import path from 'node:path';
import { config } from './config';
import { loadDataset } from './repositories/datasetRepository';
import { loadGeo } from './repositories/geoRepository';
import { Catalog } from './services/catalog';
import { registerRoutes } from './routes';

const app = Fastify({ logger: { level: process.env.LOG_LEVEL ?? 'info' } });

const buildCatalog = async () => new Catalog(await loadDataset(), await loadGeo());

let catalog = await buildCatalog();

async function reload(): Promise<void> {
  catalog = await buildCatalog();
  app.log.info(`dataset recarregado: ${catalog.meta().totalProperties} imóveis`);
}

let debounce: NodeJS.Timeout | undefined;
watch(path.dirname(config.datasetPath), (_event, file) => {
  if (file !== path.basename(config.datasetPath) && file !== path.basename(config.geoPath)) return;
  clearTimeout(debounce);
  debounce = setTimeout(() => reload().catch((e) => app.log.error(e)), 500);
});

await app.register(cors, { origin: config.corsOrigin });
await app.register(compress);
await registerRoutes(app, () => catalog);

await app.listen({ port: config.port, host: config.host });
app.log.info(`${catalog.meta().totalProperties} imóveis carregados`);
