# Chapecó Residencial

Análise e ranking de imóveis residenciais (venda e aluguel) em Chapecó‑SC, com valor do m² por bairro e filtros por dormitórios, garagem, preço, área e bairro.

> Os dados são coletados automaticamente dos sites públicos das imobiliárias de Chapecó — **não há parceria com as imobiliárias**. Veja a cobertura em [docs/IMOBILIARIAS.md](docs/IMOBILIARIAS.md) e o roadmap em [docs/PLANEJAMENTO.md](docs/PLANEJAMENTO.md).

## Requisitos
Node 22+

## Uso
```bash
npm install
npm run scrape          # coleta todas as fontes ativas → apps/api/data/dataset.chapeco-sc.json
npm run geo -w @er/api  # atualiza centro da cidade e posição dos bairros (OpenStreetMap) → apps/api/data/geo.chapeco-sc.json
npm run dev             # API em :3333 e web em :5173
```

Opções da coleta (`npm run scrape -- <opções>`):

| Opção | Exemplo | Descrição |
|---|---|---|
| `--source` | `--source=casa,cco` | Coleta só as fontes indicadas |
| `--transaction` | `--transaction=rent` | `sale`, `rent` ou ambos |
| `--max-pages` | `--max-pages=2` | Limite de páginas de listagem por transação |
| `--concurrency` | `--concurrency=4` | Fontes coletadas em paralelo (cada host recebe 1 requisição por vez) |

A API recarrega o dataset automaticamente quando a coleta termina. A execução padrão percorre até 50 páginas por fonte, com venda e aluguel; `--max-pages=1` é uma amostra para validação, não o catálogo completo.

Na validação da expansão foram coletados **1.598 anúncios de sete imobiliárias**; a API apresenta **1.557 imóveis após deduplicação**. A cobertura por fonte está em [docs/IMOBILIARIAS.md](docs/IMOBILIARIAS.md).

Para ampliar ou atualizar a base completa:
```bash
npm run scrape
# Apenas algumas imobiliárias, mantendo as demais na base:
npm run scrape -- --source=cco,exata,plaza,pacheco,imobiliariachapeco --max-pages=50
```

Falhas parciais preservam anúncios anteriores e atualizam os que responderam. Uma coleta com `--transaction=rent` preserva os imóveis de venda. As estatísticas e o ranking deduplicam anúncios compartilhados entre imobiliárias.

O foco é Chapecó–SC (IBGE 4204202), com 54 bairros municipais cadastrados e coordenadas verificadas de 51 bairros no arquivo geográfico versionado. Há coletores para CCO, Conquista, Imobiliária Chapecó, Plaza, Pacheco, Foco, Exata e Casa Imóveis. SM Santa Maria, Sim Imóveis e SM Corretores estão registradas com a integração pendente. Sites podem bloquear requisições com HTTP 403, que fica registrado em `lastRunError` na página Fontes. A coleta não contorna bloqueios.

Os arquivos padrão agora são específicos de Chapecó. Bases anteriores em `dataset.json` e `geo.json` não são carregadas, evitando misturar anúncios, medianas e coordenadas de Erechim. Se você configurou `DATASET_PATH` ou `GEO_PATH`, atualize-os para os novos arquivos. Sem dados geográficos, a distância ao centro não entra na nota; não há coordenadas fictícias.

A lista de bairros e as fontes da pesquisa estão em [docs/IMOBILIARIAS.md](docs/IMOBILIARIAS.md). As medianas são calculadas com os anúncios coletados de Chapecó, separadamente por transação e tipo; não são preços oficiais de mercado.

Validação:
```bash
npm run typecheck
npm run build
npm test
```

## Estrutura
```
packages/shared   tipos e contratos compartilhados
apps/api          Fastify: coleta (scrapers), estatísticas de m², pontuação e endpoints
apps/web          React + Bootstrap 5
docs/             planejamento e levantamento das imobiliárias
```

### Adicionando uma imobiliária
1. Se a plataforma do site já tem adapter em `apps/api/src/scrapers/platforms/`, basta registrar em `apps/api/src/scrapers/sources.ts`.
2. Caso contrário, crie um adapter implementando `PlatformAdapter` (veja `scrapers/core/crawl.ts` para o fluxo listagem → detalhe) e registre em `platforms/index.ts`.

A coleta respeita `robots.txt`, identifica-se por User‑Agent próprio e espaça as requisições por host.
