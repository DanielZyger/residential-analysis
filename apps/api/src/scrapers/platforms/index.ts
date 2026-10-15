import type { PlatformAdapter } from '../core/types';
import { abenurAdapter } from './abenur';
import { arboAdapter } from './arbo';
import { imobibrasilAdapter } from './imobibrasil';
import { painelImobiliarioAdapter } from './painel-imobiliario';
import { praediumAdapter } from './praedium';
import { samiAdapter } from './sami';
import { sigahostClassicAdapter } from './sigahost-classic';
import { sigahostNuxtAdapter } from './sigahost-nuxt';
import { viaswAdapter } from './viasw';

const adapters: PlatformAdapter[] = [
  sigahostNuxtAdapter,
  sigahostClassicAdapter,
  imobibrasilAdapter,
  viaswAdapter,
  samiAdapter,
  praediumAdapter,
  arboAdapter,
  abenurAdapter,
  painelImobiliarioAdapter,
];

export const PLATFORM_ADAPTERS = new Map(adapters.map((a) => [a.platform, a]));
