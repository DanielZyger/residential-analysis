import { slugify } from '../utils/text';

export const OFFICIAL_NEIGHBORHOODS = [
  'Aeroporto', 'Agrícola', 'Aldo Arioli', 'Amizade', 'Atlântico', 'Bandeirante', 'Bela Vista', 'Boa Vista', 'Centro',
  'Cerâmica', 'Consoladora', 'Copas Verdes', 'Cotrel', 'Cristal', 'Cristo Rei', 'Dal Molin', 'Demoliner', 'Esperança',
  'Espírito Santo', 'Estevam Carraro', 'Fátima', 'Frinape', 'Industrial', 'Industrial Norte', 'Ipiranga', 'Jabuticabal',
  'José Bonifácio', 'Koller', 'Liberdade', 'Linho', 'Maria Clara', 'Morada do Sol', 'Morro da Cegonha', 'Novo Atlântico',
  'Paiol Grande', 'Parque dos Imigrantes', 'Parque Lívia', 'Parque Redenção', 'Petit Vilage', 'Presidente Castelo Branco',
  'Presidente Vargas', 'Progresso', 'Rio Tigre', 'Santa Catarina', 'Santo Antônio', 'São Caetano', 'São Cristóvão',
  'São José', 'São Vicente de Paulo', 'Três Vendas', 'Triângulo', 'União', 'Vale dos Parreirais', 'Vale Dourado',
  'Verdureiros', 'Victoria I', 'Victoria II', 'Zimmer',
];

const ALIASES: Record<string, string> = {
  'jaboticabal': 'Jabuticabal',
  'redencao': 'Parque Redenção',
  'petit-village': 'Petit Vilage',
  'vila-santa-catarina': 'Santa Catarina',
  'v-santa-catarina': 'Santa Catarina',
  'castelo-branco': 'Presidente Castelo Branco',
  'pres-vargas': 'Presidente Vargas',
  'vitoria-i': 'Victoria I',
  'vitoria-ii': 'Victoria II',
  'victoria-1': 'Victoria I',
  'victoria-2': 'Victoria II',
  'parque-livia': 'Parque Lívia',
  'imigrantes': 'Parque dos Imigrantes',
  'centro-erechim': 'Centro',
  'victoria': 'Victoria I',
  'vitoria-2': 'Victoria II',
  'vitoria-1': 'Victoria I',
  'bandeirantes': 'Bandeirante',
  'sao-vicente-de-paula': 'São Vicente de Paulo',
  'dalmolin': 'Dal Molin',
  'colegio-agricola': 'Agrícola',
};

export const NOT_A_NEIGHBORHOOD = new Set(['zona-urbana', 'interior', 'ers-135', 'rs-135', 'zona-rural', 'nao-informado', 'outros']);

export const NEIGHBORHOOD_ALIASES: Record<string, string> = {
  ...Object.fromEntries(OFFICIAL_NEIGHBORHOODS.map((name) => [slugify(name), name])),
  ...ALIASES,
};
