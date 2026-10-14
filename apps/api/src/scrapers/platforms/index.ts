import { cimAdapter } from './cim';
import { exataAdapter } from './exata';
import { imobiliariaChapecoAdapter } from './imobiliaria-chapeco';
import { plazaAdapter } from './plaza';
import { praediumAdapter } from './praedium';
import { alavancaAdapter } from './alavanca';
import { code49Adapter } from './code49';
import type { PlatformAdapter } from '../core/types';
import { imobibrasilAdapter } from './imobibrasil';
import { samiAdapter } from './sami';
import { sigahostClassicAdapter } from './sigahost-classic';
import { sigahostNuxtAdapter } from './sigahost-nuxt';
import { viaswAdapter } from './viasw';

const adapters: PlatformAdapter[] = [cimAdapter, exataAdapter, imobiliariaChapecoAdapter, plazaAdapter, praediumAdapter, alavancaAdapter, code49Adapter, sigahostNuxtAdapter, sigahostClassicAdapter, imobibrasilAdapter, viaswAdapter, samiAdapter];

export const PLATFORM_ADAPTERS = new Map(adapters.map((a) => [a.platform, a]));
