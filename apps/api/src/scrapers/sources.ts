import type { SourceConfig } from './core/types';

type Entry = [id: string, name: string, website: string];

const ROBOTS_DISALLOWED = new Set(['rigon', 'santin', 'piazza', 'lcd']);
const PENDING_PLATFORMS = new Set(['praedium', 'arbo', 'abenur', 'byll', 'painel-imobiliario']);

function group(platform: string, entries: Entry[], options?: SourceConfig['options']): SourceConfig[] {
  return entries.map(([id, name, website]) => {
    const inactiveReason = ROBOTS_DISALLOWED.has(id)
      ? 'O robots.txt do site pede para não coletar os anúncios'
      : PENDING_PLATFORMS.has(platform)
        ? 'Coletor ainda não implementado'
        : null;
    return { id, name, website, platform, active: !inactiveReason, inactiveReason, options };
  });
}

export const SOURCES: SourceConfig[] = [
  ...group('sigahost-nuxt', [
    ['bemmorar', 'Imóveis Bem Morar', 'https://www.imoveisbemmorar.com.br'],
    ['prigol', 'Prigol Imóveis', 'https://www.prigolimoveis.com.br'],
    ['serrana', 'Serrana Imóveis', 'https://www.serranaerechim.com.br'],
    ['gaucha', 'Gaúcha Imóveis', 'https://www.gauchaimoveis.com.br'],
    ['lia', 'Lia Imobiliária', 'https://www.liaimobiliaria.com.br'],
    ['zion', 'Zion Imóveis', 'https://www.zionimoveisrs.com.br'],
    ['menegatti', 'Menegatti Imóveis', 'https://www.menegattiimoveis.com.br'],
    ['rigon', 'Imobiliária Rigon', 'https://www.imobiliariarigon.com.br'],
    ['santin', 'Imobiliária Santin', 'https://www.imobiliariasantin.com.br'],
    ['piazza', 'Piazza Imóveis', 'https://www.imobiliariapiazza.com.br'],
    ['lcd', 'LCD Imobiliária', 'https://www.lcdimobiliaria.com.br'],
  ]),
  ...group('sigahost-classic', [
    ['castelinho', 'Castelinho Imóveis', 'https://www.castelinhoimoveis.com.br'],
    ['casadez', 'Imóveis Casa Dez', 'https://www.imoveiscasadez.com.br'],
    ['azevedo', 'Pity Azevedo Negócios Imobiliários', 'https://www.azevedocorretores.com.br'],
    ['piccoli', 'Piccoli Imóveis', 'https://www.piccoliimoveis.com.br'],
    ['palmas', 'Palmas Imobiliária', 'https://www.imobiliariapalmas.com.br'],
    ['tonatto', 'Imobiliária Tonatto', 'https://www.tonatto.com.br'],
  ]),
  ...group('imobibrasil', [
    ['dalmut', 'Dalmut Imóveis', 'https://www.dalmutimoveis.com.br'],
    ['rossi', 'Marcio Rossi Imóveis', 'https://www.rossiimoveis.imb.br'],
    ['mora', 'Mora Imobiliária', 'https://www.imobiliariamora.com.br'],
    ['boavista', 'Imobiliária Boa Vista', 'https://www.imobiliariaboavistaerechim.com.br'],
    ['scala', 'Scala Corretora de Imóveis', 'https://www.scalaimoveis.com.br'],
  ]),
  ...group('viasw', [['erechimimoveis', 'Erechim Imóveis', 'https://www.erechimimoveis.com.br']]),
  ...group('sami', [['simao', 'Simão Imóveis', 'https://www.simaoimoveis.com.br']]),
  ...group('praedium', [['demarco', 'Demarco Imóveis', 'https://www.demarcoimoveis.com']]),
  ...group('arbo', [['age', 'AGE Imóveis', 'https://www.imoveisage.com.br']]),
  ...group('abenur', [['abenur', 'Abenur Imóveis', 'https://www.abenurimoveis.com.br']]),
  ...group('byll', [['silvana', 'Imóveis Silvana', 'https://www.imoveissilvana.com.br']]),
  ...group('painel-imobiliario', [['bonatto', 'Bonatto Empreendimentos Imobiliários', 'https://www.bonattoimoveis.com.br']]),
];
