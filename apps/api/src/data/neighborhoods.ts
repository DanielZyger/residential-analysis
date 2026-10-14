import { slugify } from '../utils/text';

// Prefeitura de Chapecó: Anexo XIII (2025) e mapa de bairros de maio/2026.
// https://web.chapeco.sc.gov.br/documentos/Croquis/
export const OFFICIAL_NEIGHBORHOODS = [
  'Água Santa', 'Alvorada', 'Araras', 'Bela Vista', 'Belvedere', 'Boa Vista', 'Bom Pastor', 'Bom Retiro',
  'Campestre', 'Castanheira', 'Centro', 'Cristo Rei', 'Desbravador', 'Dom Gerônimo', 'Dom Pascoal', 'Efapi',
  'Eldorado', 'Engenho Braun', 'Esplanada', 'Florência', 'Fronteira Sul', 'Industrial', 'Jardim América',
  'Jardim Europa', 'Jardim Itália', 'Jardins', 'Jardins do Vale', 'Lajeado', 'Líder', 'Maria Goretti',
  'Monte Belo', 'Palmital', 'Paraíso', 'Parque das Palmeiras', 'Passo dos Fortes', 'Perimetral', 'Pinheirinho',
  'Presidente Médici', 'Progresso', 'Quedas do Palmital', 'Saic', 'Santa Maria', 'Santa Paulina', 'Santo Antônio',
  'Santos Dumont', 'São Cristóvão', 'São Lucas', 'São Pedro', 'Seminário', 'Trevo', 'Universitário',
  'Vederti', 'Vila Real', 'Vila Rica',
];

const ALIASES: Record<string, string> = {
  'centro-chapeco': 'Centro',
  'efapi-chapeco': 'Efapi',
  'pres-medici': 'Presidente Médici',
  'presidente-emilio-garrastazu-medici': 'Presidente Médici',
  'medici': 'Presidente Médici',
  'maria-goreti': 'Maria Goretti',
  'dom-geronimo': 'Dom Gerônimo',
  'santo-dumont': 'Santos Dumont',
  'sao-antonio': 'Santo Antônio',
};

export const NOT_A_NEIGHBORHOOD = new Set(['zona-urbana', 'interior', 'sc-283', 'sc-480', 'br-282', 'zona-rural', 'area-rural-de-chapeco', 'nao-informado', 'outros']);

export const NEIGHBORHOOD_ALIASES: Record<string, string> = {
  ...Object.fromEntries(OFFICIAL_NEIGHBORHOODS.map((name) => [slugify(name), name])),
  ...ALIASES,
};
