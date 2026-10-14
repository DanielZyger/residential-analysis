# Erechim Residencial

Análise e ranking de imóveis residenciais (venda e aluguel) em Erechim‑RS, com valor do m² por bairro e filtros por dormitórios, garagem, preço, área e bairro.

> Os dados são coletados automaticamente dos sites públicos das imobiliárias de Erechim — **não há parceria com as imobiliárias**. Veja a cobertura em [docs/IMOBILIARIAS.md](docs/IMOBILIARIAS.md) e o roadmap em [docs/PLANEJAMENTO.md](docs/PLANEJAMENTO.md).

## Requisitos
Node 22+

## Uso
```bash
npm install
npm run scrape          # coleta todas as fontes ativas → apps/api/data/dataset.json
npm run geo -w @er/api  # atualiza centro da cidade e posição dos bairros (OpenStreetMap) → apps/api/data/geo.json
npm run dev             # API em :3333 e web em :5173
```

Opções da coleta (`npm run scrape -- <opções>`):

| Opção | Exemplo | Descrição |
|---|---|---|
| `--source` | `--source=imob-a,imob-b` | Coleta só as fontes indicadas |
| `--transaction` | `--transaction=rent` | `sale`, `rent` ou ambos |
| `--max-pages` | `--max-pages=2` | Limite de páginas de listagem por transação |
| `--concurrency` | `--concurrency=4` | Fontes coletadas em paralelo (cada host recebe 1 requisição por vez) |

A API recarrega o dataset automaticamente quando a coleta termina.

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
