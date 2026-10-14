import type { SourceConfig } from './core/types';

export const SOURCES: SourceConfig[] = [
  { id: 'casa', name: 'Casa Imóveis', website: 'https://casaimoveis.net', platform: 'alavanca', active: true, inactiveReason: null },
  { id: 'cco', name: 'CCO Imóveis', website: 'https://www.ccoimoveis.com.br', platform: 'code49', active: true, inactiveReason: null },
  { id: 'conquista', name: 'Conquista Imóveis', website: 'https://www.conquistachapeco.com.br', platform: 'imobibrasil', active: true, inactiveReason: null },
  { id: 'imobiliariachapeco', name: 'Imobiliária Chapecó', website: 'https://www.imobiliariachapeco.com.br', platform: 'chapeco-nextjs', active: true, inactiveReason: null },
  { id: 'santamaria', name: 'SM Santa Maria', website: 'https://santamaria.com.br', platform: 'site-proprio', active: false, inactiveReason: 'Coletor ainda não implementado' },
  { id: 'plaza', name: 'Plaza Imóveis', website: 'https://plazachapeco.com.br', platform: 'plaza-wordpress', active: true, inactiveReason: null },
  { id: 'pacheco', name: 'Pacheco Imóveis', website: 'https://pachecoimoveischapeco.com.br', platform: 'praedium', active: true, inactiveReason: null },
  { id: 'foco', name: 'Foco Imóveis', website: 'https://focoimoveischapeco.com.br', platform: 'cim-1wd', active: true, inactiveReason: null },
  { id: 'exata', name: 'Imobiliária Exata', website: 'https://www.imobiliariaexata.com', platform: 'exata-catalog', active: true, inactiveReason: null },
  { id: 'sim', name: 'Sim Imóveis', website: 'https://www.simimoveischapeco.com', platform: 'sim', active: false, inactiveReason: 'Coletor ainda não implementado; anúncio consultado do sitemap retornou HTTP 410' },
  { id: 'smcorretores', name: 'SM Corretores', website: 'https://smcorretores.com.br', platform: 'site-proprio', active: false, inactiveReason: 'Coletor ainda não implementado' },
];
