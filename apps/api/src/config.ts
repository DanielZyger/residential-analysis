import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const config = {
  port: Number(process.env.PORT ?? 3333),
  host: process.env.HOST ?? '0.0.0.0',
  datasetPath: process.env.DATASET_PATH ?? path.join(root, 'data', 'dataset.chapeco-sc.json'),
  geoPath: process.env.GEO_PATH ?? path.join(root, 'data', 'geo.chapeco-sc.json'),
  corsOrigin: process.env.CORS_ORIGIN ?? true,
};
