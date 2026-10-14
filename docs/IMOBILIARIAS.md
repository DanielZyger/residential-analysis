# Imobiliárias e bairros de Chapecó–SC

Levantamento verificado em 14/10/2026. Somente anúncios residenciais de Chapecó são aceitos. Imóveis de Guatambú, Cordilheira Alta, Coronel Freitas e outros municípios são descartados, mesmo quando publicados por uma imobiliária local.

## Fontes

| Imobiliária | Site | Integração |
|---|---|---|
| CCO Imóveis | https://www.ccoimoveis.com.br/ | Code49: sitemap público e detalhes HTML/JSON-LD. Coleta completa validada. |
| Conquista Imóveis | https://www.conquistachapeco.com.br/ | ImobiBrasil: listagens por tipo/cidade e detalhes. Acesso disponível nesta validação. |
| Imobiliária Chapecó | https://www.imobiliariachapeco.com.br/ | Next.js: sitemap e dados públicos dos detalhes, incluindo descrições longas do React Flight. A API de paginação é bloqueada pelo robots.txt e não é usada. |
| Plaza Imóveis | https://plazachapeco.com.br/ | WordPress: paginação `/pag-N`, detalhes com JSON-LD de imóvel, áreas e coordenadas. |
| Pacheco Imóveis | https://pachecoimoveischapeco.com.br/ | Praedium: paginação `?pagina=N`, detalhes e JSON-LD, inclusive quando contém novas linhas literais. |
| Foco Imóveis | https://focoimoveischapeco.com.br/ | CIM/1WD: catálogo público com cards completos. O catálogo consultado apresenta apenas venda. |
| Imobiliária Exata | https://www.imobiliariaexata.com/ | Catálogo público paginado com `?p=N`. Venda; preços, localização, áreas, quartos, banheiros e vagas dos cards. |
| Casa Imóveis | https://casaimoveis.net/ | Alavanca: coletor implementado, porém HTTP 403 na validação ao vivo. |
| SM Santa Maria | https://santamaria.com.br/ | Site acessível; coletor ainda não implementado. |
| Sim Imóveis | https://www.simimoveischapeco.com/ | Site e sitemap acessíveis; anúncio antigo do sitemap retornou HTTP 410. Coletor pendente de validação. |
| SM Corretores | https://smcorretores.com.br/ | Site acessível; coletor ainda não implementado. |

O registro executável está em `apps/api/src/scrapers/sources.ts`. Coletor implementado não garante acesso contínuo: o site pode bloquear o bot ou mudar o HTML. `robots.txt`, identificação própria e intervalo de requisições são mantidos. Não há parceria com as imobiliárias.

Na CCO, `--max-pages=N` limita a leitura do sitemap a até `24 × N` anúncios por transação. Na Imobiliária Chapecó, limita o total de detalhes a `24 × N`, pois a transação é identificada no anúncio. Na Casa, limita as páginas de listagem. A Casa fornece área privativa com vírgula e área total com ponto decimal; ambos os formatos são tratados.

## Bairros e geografia

Fontes municipais:

- [Anexo XIII — bairros de Chapecó (2025)](https://web.chapeco.sc.gov.br/documentos/Croquis/03_BAIRROS%20DE%20CHAPEC%C3%93%202025.pdf).
- [Mapa de bairros de maio/2026](https://web.chapeco.sc.gov.br/documentos/Croquis/01_MAPA%20DE%20BAIRROS_MAIO-2026.pdf).
- [Diretório de croquis da Prefeitura](https://web.chapeco.sc.gov.br/documentos/Croquis/).

A normalização usa os nomes municipais e aliases frequentes, como Maria Goreti → Maria Goretti e Pres. Médici → Presidente Médici. Não se convertem loteamentos em bairros por suposição. Nomes não reconhecidos são preservados, enquanto rodovias e localidades rurais não entram como bairros urbanos.

O script `npm run geo -w @er/api` consulta o OpenStreetMap usando o código municipal IBGE 4204202 e grava `geo.chapeco-sc.json`. O arquivo versionado contém posições verificadas de 51 bairros, obtidas via Nominatim durante a migração, e usa o bairro Centro como referência de distância. Castanheira, Florência e Perimetral não retornaram posições nessa consulta; não foram preenchidos por aproximação. Só usa posições disponíveis na fonte. Também aceita dados locais: `npm run geo -w @er/api -- --from=overpass.json`, ou `--from-nominatim=resultados.json` com uma lista de objetos `{ "results": [...] }` contendo respostas Nominatim. O importador Nominatim exige município Chapecó e UF BR-SC. Overpass pode ficar indisponível; sem arquivo geográfico, a aplicação funciona sem o componente de distância ao centro.

## Cobertura e atualização

Resultado da coleta ampliada de 14/10/2026:

| Fonte | Anúncios residenciais coletados |
|---|---:|
| Plaza Imóveis | 708 |
| Imobiliária Exata | 418 |
| Imobiliária Chapecó | 260 |
| CCO Imóveis | 157 |
| Pacheco Imóveis | 36 |
| Foco Imóveis | 16 |
| Conquista Imóveis | 3 |
| **Total** | **1.598** |

A API apresenta **1.557 entradas após deduplicação**, sendo **1.265 de venda** e **292 de aluguel**, com 65 nomes de bairros/localidades presentes nos anúncios. Essa contagem de localidades inclui nomes comerciais e loteamentos além dos bairros municipais normalizados; não altera a lista oficial de 54 bairros. Os sete coletores concluíram sem erro. Casa Imóveis permanece com HTTP 403; as três fontes sem coletor estão indicadas acima.

Os números são uma fotografia dessa coleta e podem mudar nas próximas execuções. O dataset é gerado localmente em `apps/api/data/dataset.chapeco-sc.json` e não é versionado.


A base inicial de 32 anúncios veio de `--max-pages=1`; não era uma coleta completa. A configuração padrão permite 50 páginas e a expansão foi validada com catálogos completos.

Exata e Foco fornecem dados residenciais nos próprios cards, sem depender de uma requisição de detalhe para cada imóvel. Descrição, IPTU, condomínio e suítes que não estiverem disponíveis ficam ausentes, sem preenchimento por suposição. Na Exata, metragem sem rótulo de área privativa fica como área total de apartamentos; área construída e terreno são tratados separadamente.

Quando uma fonte falha após responder parcialmente, os anúncios anteriores são preservados e os novos são atualizados por ID. Uma coleta apenas de aluguel preserva os anúncios de venda. A deduplicação entre imobiliárias é feita na API antes de calcular medianas e ranking.

## Dados de mercado

Preços, área, quartos, vagas, suítes, fotos e bairros vêm dos próprios anúncios. Medianas de m² e valorização relativa são estimadas a partir da coleta local por tipo e transação. Não foram importados preços de Erechim, estimativas fiscais ou valores inventados de Chapecó.

Para ampliar a cobertura, implementar as fontes pendentes ou obter feeds públicos das imobiliárias. A cobertura depende dos catálogos públicos acessíveis; os resultados não representam um censo de todo o mercado municipal.
