# Erechim Residencial — Planejamento

Plataforma web que coleta anúncios residenciais (venda e aluguel) das imobiliárias de Erechim‑RS, calcula o valor do m² por bairro e ranqueia os imóveis por custo‑benefício, com filtros (dormitórios, garagem, preço, área, bairro, tipo).

> **Origem dos dados:** não há parceria com imobiliárias neste momento. Os dados vêm de coleta automatizada (scraping) dos sites públicos das imobiliárias listadas em [IMOBILIARIAS.md](IMOBILIARIAS.md). A interface deixa isso explícito: cada imóvel exibe a fonte, link para o anúncio original e a data da coleta, e existe uma página "Fontes" com a cobertura atual.

## Stack

| Camada | Escolha | Motivo |
|---|---|---|
| Monorepo | npm workspaces (`apps/*`, `packages/*`) | Sem ferramenta extra; tipos compartilhados |
| Contratos | `packages/shared` (TS puro) | Um único lugar para tipos de domínio, filtros e respostas da API |
| Backend | Node 22 + TypeScript + Fastify | Rápido, schema/validação nativos, baixo overhead |
| Scraping | `fetch` nativo do Node + `cheerio` | Leve; sem browser headless no MVP |
| Persistência MVP | Arquivo JSON versionado em `apps/api/data/` carregado em memória | Volume esperado < 5 mil imóveis; zero infra. Fase 2 → SQLite/Postgres |
| Frontend | Vite + React + TypeScript | Componentização, build rápido |
| UI | Bootstrap 5 (SCSS) | Estilos por feature (`*.scss` ao lado da feature) + `styles/` central para tokens, mixins e utilitários repetidos |

Sem testes unitários (decisão do projeto). Sem comentários no código.

## Arquitetura

```
packages/shared        tipos: Property, PropertyFilters, ScoreBreakdown, NeighborhoodStats, Source
apps/api
  scrapers/core        http com rate limit + robots.txt, normalizadores (preço, área, bairro, tipo)
  scrapers/platforms   1 adapter por plataforma de site (cobre várias imobiliárias)
  scrapers/sources.ts  registro imobiliária → plataforma + config
  scrapers/run.ts      CLI `npm run scrape` → grava data/properties.json
  services/market      estatísticas de m² por bairro/tipo/transação
  services/scoring     motor de pontuação e ranking
  repositories         acesso aos dados (JSON em memória; trocável por DB)
  routes               /properties, /properties/:id, /neighborhoods, /sources, /meta
apps/web
  styles/              _variables, _mixins, shared (centralizados) + main.scss com Bootstrap
  components/          componentes genéricos reutilizáveis
  features/ranking     lista ranqueada + card do imóvel
  features/filters     painel de filtros (estado na URL)
  features/property    detalhe com breakdown da nota
  features/neighborhoods  m² por bairro
  features/sources     transparência das fontes
```

### Fluxo de dados
1. `npm run scrape` percorre as fontes ativas, respeita `robots.txt` e um intervalo entre requisições, normaliza e deduplica (mesmo endereço/área/preço entre imobiliárias).
2. Resultado salvo em `data/properties.json` com `collectedAt`.
3. A API carrega em memória na inicialização, pré‑calcula estatísticas de mercado e notas.
4. O frontend consulta `/properties` com filtros + paginação; filtragem e ordenação ocorrem no servidor.

## Modelo de pontuação (0–100)

Calculado separadamente para **venda** e **aluguel**, comparando cada imóvel com os pares do mesmo tipo (casa / apartamento / outros).

| Fator | Peso | Como |
|---|---|---|
| Preço do m² vs. mediana do bairro | 35% | Desvio percentual em relação à mediana do bairro (mesmo tipo; neutro quando o bairro tem < 3 amostras). Mais barato que a mediana = nota maior |
| Preço do m² vs. mediana da cidade | 10% | Mesmo cálculo, referência cidade |
| Localização | 20% | 60% distância até o centro (coordenada do anúncio ou posição do bairro no OpenStreetMap) + 40% valorização do bairro (m² mediano do bairro vs. cidade) |
| Espaço por real | 15% | Área e dormitórios por unidade de preço, percentil entre pares |
| Garagem e suítes | 10% | Vagas e suítes em relação à faixa de preço |
| Qualidade do anúncio | 10% | Área informada, fotos, bairro identificado, descrição — anúncios incompletos perdem confiança |

Dados de localização: `npm run geo -w @er/api` baixa do OpenStreetMap (Overpass) o centro da cidade e a posição dos bairros para `apps/api/data/geo.json`. Os serviços (escolas, mercados, saúde) ainda estão pouco mapeados no OSM para Erechim, por isso não entram na nota por enquanto.

Deduplicação: feita ao carregar os dados na API. Anúncios de imobiliárias diferentes com o mesmo preço e mesma rua, ou com área até 3% diferente no mesmo bairro, viram um único imóvel; fica o anúncio mais completo e os demais aparecem em "Também anunciado em".

O detalhamento (`ScoreBreakdown`) é retornado pela API e exibido na tela para que a nota seja explicável. Os pesos ficam em um único arquivo de configuração.

## Filtros

Transação (venda/aluguel), tipo, dormitórios mín., vagas mín., suítes mín., faixa de preço, faixa de área, bairros (multi), fonte, texto livre (código/título). Ordenação: nota, preço, preço/m², área. Estado dos filtros sincronizado na URL (link compartilhável).

## Entregas

### Entrega 1 — MVP
- [x] Levantamento: 29 imobiliárias de Erechim e plataformas usadas (`docs/IMOBILIARIAS.md`)
- [x] Monorepo + tipos compartilhados
- [x] Coleta com adapters por plataforma, respeitando robots.txt, com normalização e deduplicação entre imobiliárias
  - SigaHost Nuxt (7 imobiliárias), SigaHost clássico (6), ImobiBrasil (5), Erechim Imóveis, Simão
  - Fora da coleta: Rigon, Santin, Piazza e LCD (robots.txt pede para não coletar)
- [x] Estatísticas de m² por bairro (58 bairros oficiais do PL 045/2015 + mapa de grafias)
- [x] Motor de pontuação e ranking explicável
- [x] API: listagem filtrada/paginada, detalhe, bairros, fontes, meta
- [x] Web: ranking com filtros, detalhe com breakdown da nota, m² por bairro, página de fontes
- [x] Aviso de origem dos dados em todas as telas

### Entrega 2 — Qualidade dos dados
- Adapters pendentes: Demarco (Praedium, JSON-LD), AGE (Arbo, `__NEXT_DATA__`), Abenur, Silvana, Bonatto
- Agendamento diário da coleta (cron)
- Mapear loteamentos ("Florais Itália", "Estar do Chile"...) para o bairro oficial usando lat/long
- Padronizar IPTU (anual vs. parcela) entre fontes
- Área por planta em lançamentos com várias plantas
- Banco SQLite/Postgres com histórico de preço (variação, tempo em anúncio)
- Deduplicação por similaridade de fotos/descrição
- Geocodificação dos imóveis

### Entrega 3 — Contexto do bairro
- Índice de infraestrutura por bairro via OpenStreetMap (escolas, saúde, mercados, transporte)
- Mapa com camadas de preço/m²
- Pesos da nota ajustáveis pelo usuário

### Entrega 4 — Parcerias
- Integração oficial com imobiliárias (feed XML/API — formatos VRSync/ZAP são padrão de mercado)
- Alertas de novos imóveis que atendem aos filtros
