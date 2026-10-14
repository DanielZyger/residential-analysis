import type { PlatformAdapter } from '../core/types';
import { imobibrasilAdapter } from './imobibrasil';
import { samiAdapter } from './sami';
import { sigahostClassicAdapter } from './sigahost-classic';
import { sigahostNuxtAdapter } from './sigahost-nuxt';
import { viaswAdapter } from './viasw';

const adapters: PlatformAdapter[] = [sigahostNuxtAdapter, sigahostClassicAdapter, imobibrasilAdapter, viaswAdapter, samiAdapter];

export const PLATFORM_ADAPTERS = new Map(adapters.map((a) => [a.platform, a]));
