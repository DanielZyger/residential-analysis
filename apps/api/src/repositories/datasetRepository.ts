import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import type { Property, Source } from '@er/shared';
import { config } from '../config';

export interface Dataset {
  collectedAt: string | null;
  sources: Source[];
  properties: Property[];
}

const EMPTY: Dataset = { collectedAt: null, sources: [], properties: [] };

export async function loadDataset(file = config.datasetPath): Promise<Dataset> {
  try {
    return { ...EMPTY, ...(JSON.parse(await readFile(file, 'utf8')) as Dataset) };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return EMPTY;
    throw error;
  }
}

export async function saveDataset(dataset: Dataset, file = config.datasetPath): Promise<void> {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(dataset));
}
