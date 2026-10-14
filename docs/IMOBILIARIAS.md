# Imobiliárias de Erechim-RS: levantamento para o scraper

> Levantamento feito em **14/10/2026** com WebSearch, WebFetch e `curl` (User-Agent de navegador comum).
> Contagens, seletores e endpoints valem para essa data. Os sites mudam, então revalide antes de implementar.
> "não verificado" = não consegui confirmar. Nada aqui foi estimado sem dizer que é estimativa.

## Tabela resumo

Legenda:
- **Renderização**: SSR = HTML já vem com os dados. API = SPA que busca JSON via XHR. SSR+LD = SSR com JSON-LD (schema.org).
- **Campos**: P = preço, A = área (priv/total), D = dormitórios, S = suítes, B = banheiros, V = vagas, Bai = bairro, T = tipo, C = código, F = fotos, Geo = lat/long.
- **Res. (V/L)** = imóveis residenciais (apto + casa [+ sobrado]) à venda / para locação. Entre parênteses, o total de todos os tipos.

| # | Nome | Site | Plataforma | Renderização | Campos disponíveis | Res. (V/L) | robots.txt OK? | Prioridade |
|---|------|------|-----------|--------------|--------------------|-----------|----------------|-----------|
| 1 | Imóveis Bem Morar | imoveisbemmorar.com.br | SigaHost (Nuxt) | API JSON | P A D S B V Bai T C F Geo | 544 / 59 (975 / 142) | Sim (não tem robots.txt) | **Alta** |
| 2 | Prigol Imóveis | prigolimoveis.com.br | SigaHost (Nuxt) | API JSON | P A D S B V Bai T C F Geo | 341 / 30 (551 / 77) | Sim | **Alta** |
| 3 | Serrana Imóveis | serranaerechim.com.br | SigaHost (Nuxt) | API JSON | P A D S B V Bai T C F Geo | 269 / 31 (444 / 56) | Sim | **Alta** |
| 4 | Gaúcha Imóveis | gauchaimoveis.com.br | SigaHost (Nuxt) | API JSON | P A D S B V Bai T C F Geo | 241 / 14 (365 / 23) | Sim | **Alta** |
| 5 | Lia Imobiliária | liaimobiliaria.com.br | SigaHost (Nuxt) | API JSON | P A D S B V Bai T C F Geo | 220 / 8 (344 / 21) | Sim | **Alta** |
| 6 | Zion Imóveis | zionimoveisrs.com.br | SigaHost (Nuxt) | API JSON | P A D S B V Bai T C F Geo | 110 / 4 (164 / 6) | Sim | **Alta** |
| 7 | Menegatti Imóveis | menegattiimoveis.com.br | SigaHost (Nuxt) | API JSON | P A D S B V Bai T C F Geo | 106 / 28 (235 / 79) | Sim (não tem robots.txt) | **Alta** |
| 8 | Imobiliária Rigon | imobiliariarigon.com.br | SigaHost (Nuxt) | API JSON | igual aos acima (mesma plataforma) | não verificado | **Não**: bloqueia `/imoveis/` e bots de IA | Excluir |
| 9 | Imobiliária Santin | imobiliariasantin.com.br | SigaHost (Nuxt) | API JSON | idem | não verificado (snippet de busca: "139 imóveis encontrados") | **Não** (idem) | Excluir |
| 10 | Piazza Imóveis | imobiliariapiazza.com.br | SigaHost (Nuxt) | API JSON | idem | não verificado | **Não** (idem) | Excluir |
| 11 | LCD Imobiliária | lcdimobiliaria.com.br | SigaHost (Nuxt) | API JSON | idem | não verificado | **Não** (idem) | Excluir |
| 12 | Castelinho Imóveis | castelinhoimoveis.com.br | SigaHost clássico (PHP) | SSR | P A D S B V Bai* T C F | 180 / 0 (319 / 0) | Sim | **Alta** |
| 13 | Imóveis Casa Dez | imoveiscasadez.com.br | SigaHost clássico | SSR | P A D S B V Bai* T C F | 133 / 2 (202 / 7) | Sim | **Alta** |
| 14 | Pity Azevedo Negócios Imob. | azevedocorretores.com.br | SigaHost clássico | SSR | P A D S B V Bai* T C F | 94 / 0 (140 / 0) | Sim | Média |
| 15 | Piccoli Imóveis | piccoliimoveis.com.br | SigaHost clássico | SSR | P A D S B V Bai* T C F | 87 / 4 (140 / 21) | Sim | Média |
| 16 | Palmas Imobiliária | imobiliariapalmas.com.br | SigaHost clássico | SSR | P A D S B V Bai* T C F | 25 / 5 (42 / 19) | Sim | Baixa |
| 17 | Imobiliária Tonatto | tonatto.com.br | SigaHost clássico | SSR | P A D S B V Bai* T C F | 9 / 6 (27 / 9) | Sim | Baixa |
| 18 | Dalmut Imóveis | dalmutimoveis.com.br | ImobiBrasil | SSR+LD | P A(total/útil) D B V Bai T C F Condomínio | 206 / 14 (432 / 25) | Sim (`Allow: /`) | **Alta** |
| 19 | Marcio Rossi Imóveis | rossiimoveis.imb.br | ImobiBrasil | SSR+LD | idem | 124 / 13 (352 / 40) | Sim | **Alta** |
| 20 | Mora Imobiliária | imobiliariamora.com.br | ImobiBrasil | SSR+LD | idem | 51 / 3 (79 / 8) | Sim | Média |
| 21 | Imobiliária Boa Vista | imobiliariaboavistaerechim.com.br | ImobiBrasil | SSR+LD | idem | 33 / 0 (58 / 0) | Sim | Média |
| 22 | Scala Corretora | scalaimoveis.com.br | ImobiBrasil | SSR+LD | idem | 10 / 1 (17 / 11) | Sim | Baixa |
| 23 | Erechim Imóveis | erechimimoveis.com.br | ViaSW (site próprio) | SSR | P A(priv) D B V Bai T C F | não separado (636 / 141 no total) | Sim (não tem robots.txt) | **Alta** |
| 24 | Simão Imóveis | simaoimoveis.com.br | Sami Sistemas (PHP) + fotos Widesys | SSR | P A(constr/terreno) D S V Bai T C F IPTU | não separado (503 / 296 no total) | Sim | **Alta** |
| 25 | Demarco Imóveis | demarcoimoveis.com | Praedium CRM | SSR+LD | P A D B Bai T C F | 118 / 3 (222 / 4 em Erechim) | Sim (só bloqueia `/busca-imoveis.html`) | Média |
| 26 | AGE Imóveis | imoveisage.com.br | Arbo Imóveis (Next.js) | SSR (`__NEXT_DATA__`) + XHR | P A D B V Bai T C F Geo Cond IPTU | 90 / 2 (143 / 7) | Sim | Média |
| 27 | Abenur Imóveis | abenurimoveis.com.br | Site próprio (BYOV / "Enterprise" Orby) | SSR | P A(terreno/constr) D B V Bai T C | não verificado (~117 links na home) | Sem robots.txt válido (devolve página 404) | Baixa/Média |
| 28 | Imóveis Silvana | imoveissilvana.com.br | Byll Agência (PHP) | SSR | P Bai T C F (área/dorm só no texto livre) | não verificado (28 por página) | Sim (`Crawl-delay: 10`) | Baixa |
| 29 | Bonatto Empreend. Imobiliários | bonattoimoveis.com.br | Painel Imobiliário / Studio72 (Sistemas Pleno) | SSR | não verificado em detalhe | não verificado (~29 na listagem) | robots.txt devolve HTML | Baixa |

\* Na listagem do SigaHost clássico o card mostra só "Erechim / RS". O bairro aparece na página de detalhe (`.sp-address-property`).

### Agrupamento por plataforma (um adapter atende várias imobiliárias)

| Plataforma | Imobiliárias | Esforço do adapter | Volume residencial verificado (venda) |
|-----------|--------------|--------------------|--------------------------------------|
| **SigaHost / SigaCRM: versão Nuxt (API JSON)** | Bem Morar, Prigol, Serrana, Gaúcha, Lia, Zion, Menegatti (+ Rigon, Santin, Piazza, LCD, que o robots.txt bloqueia) | **Baixo**: JSON limpo e paginado | ~1.830 registros (7 sites liberados) |
| **SigaHost clássico (PHP, template `siga-modelo`)** | Castelinho, Casa Dez, Azevedo, Piccoli, Palmas, Tonatto | Médio: parse de HTML, mesmo template | ~530 |
| **ImobiBrasil** | Dalmut, Rossi, Mora, Boa Vista, Scala | Médio-baixo: HTML + JSON-LD por item | ~420 |
| Praedium CRM | Demarco | Médio-baixo: JSON-LD rico no detalhe | ~118 |
| Arbo (Next.js) | AGE | Médio: `__NEXT_DATA__` | ~90 |
| Sites próprios | Erechim Imóveis (ViaSW), Simão (Sami Sistemas), Abenur, Silvana, Bonatto | Um adapter por site | Erechim Imóveis e Simão são grandes |

A **SigaHost** tem 17 das 29 imobiliárias (11 na versão Nuxt e 6 na clássica). As URLs públicas das duas versões seguem o mesmo padrão (`/comprar-imoveis/...`, `/alugar-imoveis/...`, `/imovel/<slug>/<id>`).

### Recomendação de ordem de implementação

1. **SigaHost Nuxt (API JSON)**: um adapter cobre 7 imobiliárias e ~1.800 anúncios residenciais à venda. Os dados vêm estruturados, com lat/long.
2. **ImobiBrasil (SSR + JSON-LD)**: 5 imobiliárias. Dalmut e Rossi são grandes. O título do JSON-LD já traz bairro, dormitórios, banheiros, vagas e área.
3. **SigaHost clássico (SSR)**: 6 imobiliárias, todas com o mesmo template HTML. Castelinho e Casa Dez são as maiores.
4. **Erechim Imóveis (ViaSW)**: 636 venda e 141 locação, HTML simples e paginação por path.
5. **Simão Imóveis**: 503 venda e **296 locação**. É a maior oferta de **aluguel** encontrada, e o HTML é simples.

Depois vêm Demarco (Praedium, JSON-LD) e AGE (Arbo, `__NEXT_DATA__`).

**Atenção: duplicidade.** Nos 7 sites SigaHost Nuxt, cerca de **96 imóveis** aparecem em 2 a 5 imobiliárias diferentes, comparando a chave bairro + área privativa + preço. O pipeline precisa de deduplicação entre fontes.

---

## 1. Plataforma SigaHost / SigaCRM: versão Nuxt (API JSON)

**Como identificar:** `<div id="__nuxt">`, scripts em `/_nuxt/*.js`, `window.__NUXT__.config={public:{bsimob:"<slug>", apiURL:"https://www.<dominio>/api/", hostDomain:"sigahost.com.br", crmDomain:"sigacrm.com.br", cdn:"https://cdn.sigahost.com.br"}}`, `og:image` em `cdn.sigahost.com.br/<slug>/...`. O `__NEXT_DATA__`/`data-ssr="false"` mostra que é **SPA sem SSR**: o HTML não traz imóveis.

**URLs públicas (SPA):**
- Venda: `/comprar-imoveis/apartamentos-erechim`, `/comprar-imoveis/casas-erechim`, `/comprar-imoveis/sobrados-...`
- Aluguel: `/alugar-imoveis/...`
- Detalhe: `/imovel/<slug-titulo>/<ID>` (ex.: `https://www.prigolimoveis.com.br/imovel/le-quattro-torri-firenze/5606`)
- Busca: `/buscar-imoveis/todos?nome=...`

**API (verificada):**
```
GET https://www.<dominio>/api/imoveis?operacao=vendas|aluguel&tipoId=1,10,60&page=N&limite=100&idimob=1&rede=0
    Header obrigatório: Referer: https://www.<dominio>/      (sem Referer -> {"status":403,"error":"Acesso não autorizado"})
GET https://www.<dominio>/api/imovel/<ID>?pgimovel=1&interno=&idimob=1&rede=0     (detalhe completo)
GET https://www.<dominio>/api/bairros?cidade=<cidade>&idimob=1&rede=0&operacao=vendas
GET https://www.<dominio>/api/tipologias?operacao=vendas&idimob=1&rede=0
GET https://www.<dominio>/api/cidades?idimob=1&rede=0&operacao=vendas
```
- O backend real é `https://api.sigacrm.com.br/<slug>/imoveis`, mas a chamada direta devolve `{"message":"Unauthenticated."}`. Use o proxy `/api/` do próprio site.
- `limite=100` funciona (`meta.per_page=100`). A resposta segue a paginação do Laravel: `meta.total`, `meta.last_page`, `meta.current_page`, `links.next`.
- `tipoId` (extraído do bundle JS): `1`=Apartamentos, `10`=Casas, `20`=Comercial, `30`=Terrenos, `60`=Sobrados, `70`=Condomínios.
- Outros filtros que o front aceita: `cidade`, `bairro`, `dorm`, `suites`, `garagem`, `valorMinimo`, `valorMaximo`, `mobilia`, `perfil`, `ordem`, `aceitaPet`, `piscina`, `elevador` etc.
- A resposta inclui imóveis de **outras cidades** (Itapema, Barão de Cotegipe, Gaurama...). Filtre por `Cidade == "Erechim"`. No teste, 1.756 dos 1.831 registros eram de Erechim.

**Estrutura de um item (listagem; trecho real da Prigol):**
```json
{
  "ID": 5606, "Categoria": "Vendas", "Codigo": "5606",
  "Nome": "LE QUATTRO TORRI | FIRENZE", "Anuncio": "",
  "URL": "https://www.prigolimoveis.com.br/imovel/le-quattro-torri-firenze/5606",
  "Endereco": "", "Bairro": "Linho", "Cidade": "Erechim", "UF": "RS",
  "Latitude": "-27.6375...", "Longitude": "-52.2577...",
  "Perfil": "Em Construção", "Mobilia": "Sem mobilia",
  "Garagem": "0", "Suites": "0", "Banheiros": "0",
  "Tipo": [
    {"Id": 3, "Categoria": "Apartamentos", "Tipo": "Apartamento 01 Dorm.", "Dormitorios": 1, "Valor": "312.865,00"},
    {"Id": 4, "Categoria": "Apartamentos", "Tipo": "Apartamento 02 Dorm.", "Dormitorios": 2, "Valor": "366.815,00"}
  ],
  "AreaTotal": "0,00", "AreaPrivativa": "0,00",
  "Elevador": 0, "Piscina": false, "Sacada": false, "Churrasqueira": false,
  "DataCadastro": "13/10/2026", "DataPublicacao": "13/10/2026",
  "Agenciador": {"Nome": "...", "Creci": "74.255", "Imobiliaria": "Prigol Imóveis"},
  "Fotos": [{"Foto_Grande": "https://files.sigahost.com.br/prigol/img_vendas/g1_5606_...jpeg", "Foto_Media": "...", "Foto_Pequena": "..."}]
}
```
- **Preço e dormitórios ficam dentro de `Tipo[]`.** Lançamentos podem ter vários `Tipo` (um por planta). Para análise de m², use itens com `len(Tipo)==1` ou crie uma linha por planta.
- Valores e áreas vêm como string pt-BR (`"390.000,00"`, `"49,20"`).
- O detalhe (`/api/imovel/<ID>`) acrescenta: `AreaGlobal`, `ValorCondominio`, `ValorIPTU`, `DemiSuite`, `Lavabos`, `SuiteMaster`, `AnoConclusao`, `Financiamento`, `MinhaCasaMinhaVida`, `Caracteristicas`, `Descricao[]` (HTML), `Unidade`, `Situacao`, `Status`.
- Exemplo de detalhe (Prigol ID 5601): `Bairro: "Florais Itália"`, `AreaTotal: "360,00"`, `AreaPrivativa: "171,40"`, `Suites: 1`, `Banheiros: 2`, `Garagem: 2`, `Tipo: [{Categoria: "Casas", Tipo: "Casa 03 Dorm.", Dormitorios: 3, Valor: "1.200.000,00"}]`.
- `Bairro` é texto livre: aparecem "José Bonifacio" e "José Bonifácio", "Jaboticabal" e "Jabuticabal", e nomes de loteamento ("Florais Itália", "Jardim Europa", "Loteamento Calgaro"). **É preciso um mapa de normalização para os bairros oficiais** (ver a seção de bairros).

**robots.txt:** há dois modelos.
- Modelo antigo (Prigol, Serrana, Gaúcha, Lia, Zion): só `Disallow: /arquivos/ /conf/ /sistema/ /xml_integracao/ /*.php /*.html` etc. Nada que afete `/api/` ou `/imovel/`.
- Modelo novo (Rigon, Santin, Piazza, LCD), versão 1.5.x do template:
  ```
  User-agent: *
  Disallow: /vitrine/
  Disallow: /imoveis/
  User-agent: GPTBot / ClaudeBot / Google-Extended / CCBot
  Disallow: /
  Allow: /imobiliaria
  Allow: /blog
  ```
  Esses 4 sites **pedem explicitamente para não serem raspados** por bots de dados/IA. Recomendo **excluir**. Não consultei a API deles.
  O template novo tende a se espalhar para os outros sites SigaHost, então **re-verifique o robots.txt a cada execução**.
- Bem Morar e Menegatti: `/robots.txt` devolve HTML, ou seja, não existe robots.txt.

**Sitemap:** `https://www.prigolimoveis.com.br/sitemap.xml` lista as URLs `/imovel/<slug>/<id>`. É útil para descoberta incremental.

**Dados por imobiliária (Nuxt)**

| Imobiliária | Slug (`bsimob`) | CRECI | Venda total / res. | Aluguel total / res. |
|---|---|---|---|---|
| Imóveis Bem Morar | `bemmorar` | não verificado | 975 / 544 | 142 / 59 |
| Prigol Imóveis | `prigol` | não verificado | 551 / 341 | 77 / 30 |
| Serrana Imóveis | `serrana` | não verificado | 444 / 269 | 56 / 31 |
| Gaúcha Imóveis | `gaucha` | 21.984-J (snippet de busca) | 365 / 241 | 23 / 14 |
| Lia Imobiliária | `lia` | não verificado | 344 / 220 | 21 / 8 |
| Zion Imóveis | `zion` | não verificado | 164 / 110 | 6 / 4 |
| Menegatti Imóveis | `menegatti` | não verificado | 235 / 106 | 79 / 28 |
| Imobiliária Rigon | `rigon` | 25104-J (JSON-LD) | não verificado (robots) | não verificado |
| Imobiliária Santin | não verificado | 27.546 J (JSON-LD) | não verificado (robots) | não verificado |
| Piazza Imóveis | não verificado | 22775J (JSON-LD) | não verificado (robots) | não verificado |
| LCD Imobiliária | não verificado | 24842 J (JSON-LD) | não verificado (robots) | não verificado |

"res." = `tipoId=1,10,60` (apto + casa + sobrado), todas as cidades. As contagens vêm de `meta.total` com `limite=1`.

---

## 2. Plataforma SigaHost clássico (PHP, template `siga-modelo`)

**Como identificar:** scripts em `https://lib.sigahost.com.br/siga-modelo/...` (jQuery 3.3.1, chosen, owl.carousel), fotos em `files.sigahost.com.br/<slug>/img_vendas/...`, Cloudflare Rocket Loader.

**URLs:**
- Venda: `https://www.<dom>/comprar-imoveis/` (tudo), `/comprar-imoveis/apartamentos-erechim/`, `/comprar-imoveis/casas-erechim/`, `/comprar-imoveis/apartamentos-erechim/apartamento-2-dormitorios/`
- Aluguel: `/alugar-imoveis/`, `/alugar-imoveis/apartamentos-erechim/`, `/alugar-imoveis/casas-erechim/`
- Paginação: **`<url-listagem>&pg=N`**. O "&" vem sem "?", exatamente como no paginador: `.../comprar-imoveis/apartamentos-erechim/&pg=2`. **24 itens por página.**
- Total: texto `"<N> Imóveis encontrados"` (h2 `.titulo-property-h2` / `encontrados`).
- Detalhe: `/imovel/venda-apartamentos-03-dorm-em-erechim/<slug>/<id>` ou `/imovel/venda-casa-03-dorm-em-erechim/<slug>/<id>`.

**Seletores observados na listagem** (Tonatto/Casa Dez):
```
.listing-item                                  -> card
  a.listing-img-container[href]                -> URL do detalhe
  .span-cod-lista                              -> "Cód. V17"
  .listing-price                               -> "R$ 700.000,00"
  .imgAnuncio[style*=background:url(...)]      -> foto (m1_*.jpg)
  h4.titulo-limite                             -> "APARTAMENTO"
  h5.dorm-suite                                -> "3 Dorm.  Sendo 1 Suíte (2 Demi-Suítes)"
  h2.neighborhood-and-city                     -> "Erechim / RS" (o bairro NÃO vem no card)
  ul.listing-features[data-tipo-id]
     li.area[data-area-total] span             -> "159,46 m²"
     li.privativa-item-list span               -> "148,36 m²"
     li.vagas span b                           -> "1"
     li.perfil span                            -> "Novo"
.pagination a[href*="&pg="]
```
**Seletores no detalhe** (Casa Dez `/imovel/venda-apartamentos-03-dorm-em-erechim/edificio-continental/1081`):
```
.property-title h2                     -> "EDIFICIO CONTINENTAL"  + span.imovel-codigo "Cód. V1081"
.listing-address span (1º)             -> "3 Dorm.  Sendo 1 Suíte"
.sp-address-property[data-tag=address] -> "Rua Pedro Alvares Cabral, Centro - Erechim / RS"  (bairro = texto entre ", " e " - ")
.property-pricing .value-real-number   -> "R$ 3.000.000,00"
ul.listing-features li.vagas b         -> 2
ul.listing-features li.area span       -> "388,12 m²"  (Área Total)
li.area-privativa span                 -> "253,41 m²"
li.banheiros .result-infos-description -> 4
li.mobilia span / li.perfil / li.previsao (Andar)
.property-features li                  -> características (lista)
```
- O JSON-LD da página é só `LocalBusiness`, sem dados do imóvel.
- **robots.txt** (igual em todos): `Disallow: /arquivos/ /conf/ /documentos/ /sistema/ /xml_integracao/ /favoritos/ /financiamentos/ /*.html /*.php`. As listagens e os detalhes **não** são afetados.
- Piccoli tem `sitemap.xml`, mas é antigo (gerador de 2018).

| Imobiliária | Site | CRECI | Venda apto / casa (total) | Aluguel apto / casa (total) |
|---|---|---|---|---|
| Castelinho Imóveis | castelinhoimoveis.com.br | não verificado (só CRECI F de corretores) | 76 / 104 (319) | 0 / 0 (0) |
| Imóveis Casa Dez | imoveiscasadez.com.br | 25067 | 74 / 59 (202) | 2 / 0 (7) |
| Pity Azevedo Negócios Imobiliários | azevedocorretores.com.br | 23.267 J (rodapé); CRECI/RS 40.495 (meta) | 48 / 46 (140) | 0 / 0 (0) |
| Piccoli Imóveis | piccoliimoveis.com.br | 24.911J | 39 / 48 (140) | 4 / 0 (21) |
| Palmas Imobiliária | imobiliariapalmas.com.br | 23539-J | 15 / 10 (42) | 3 / 2 (19) |
| Imobiliária Tonatto | tonatto.com.br | não verificado | 3 / 6 (27) | 2 / 4 (9) |

---

## 3. Plataforma ImobiBrasil

**Como identificar:** `og:image` em `cdn-img-src.imobibrasil.app.br/...`, fotos em `imgs1.cdn-imobibrasil.com.br`, `<link rel="alternate" type="text/markdown" href="/llms.txt">`, versão `/mobile/`, `?amp=1`, charset ISO-8859-1.

**URLs (todas redirecionam para a forma em path):**
- Venda: `/imovel/?finalidade=venda` → `/imovel/venda`; por tipo: `/imovel/venda/apartamento`, `/imovel/venda/casa`; por cidade: `/imovel/venda/todos/erechim`
- Aluguel: `/imovel/locacao`, `/imovel/locacao/apartamento`, `/imovel/locacao/casa`
- Paginação: **`?pag=N`** (ex.: `/imovel/venda/todos/erechim/?pag=2`), 15 itens por página.
- Filtros de preço: `/imovel/?vmi=200000&vma=400000`. Bairro: `/imovel?finalidade=venda&cidade=erechim&bairro=centro-835202`.
- Detalhe: `/imovel/<id>/<tipo>-<finalidade>-<cidade>-rs-<bairro>[-<condominio>]` (ex.: `/imovel/4245858/apartamento-venda-erechim-rs-jabuticabal`).
- Total: `<strong>58</strong> im&oacute;veis encontrados` (o template muda: `.cabecalho .grid-3` ou `p.topsearch__total`).
- `/llms.txt` traz contato, CRECI, "Bairros principais" com contagem e lista de condomínios.

**JSON-LD por item na listagem** (um `<script type="application/ld+json">` por card):
```json
{"@type": "BuyAction", "price": "330.000,00",
 "object": {"@type": "Place", "address": {"addressLocality": "Erechim", "addressRegion": "RS"},
  "name": "Casa para Venda, em Erechim, bairro Novo Atlântico, 2 dormitórios, 1 banheiro, 2 vagas",
  "url": "https://www.imobiliariamora.com.br/imovel/4299815/casa-venda-erechim-rs-novo-atlantico",
  "image": "..."}}
```
- Na locação o `@type` é `rentAction`.
- O texto de `name` segue um padrão fixo, fácil de parsear com regex: `<Tipo> para <Venda|Locação>, em <Cidade>, bairro <Bairro>, N dormitórios, N banheiro(s), N vaga(s)`.

**Card HTML** (template `imovel_listar_mod1`, Mora):
```
a[title] > .item-lista
  .img-item-lista img[src]                  -> foto
  .desc-item-lista h3                       -> "Jabuticabal, Erechim / RS"
  small strong                              -> "Ref: 0098"
  tr.icones a[data-tooltip="Área"]          -> "58,16 m²"
  a[data-tooltip="Dormitórios"] / "Banheiros" / "Vagas"
  a[data-tooltip="Valor por m²"]            -> "R$5.828,00 m²"
  ul li:first-child                         -> "R$ 339.000,00"
```
O template varia de site para site (Dalmut usa outro, com `section.topsearch`). **Prefira o JSON-LD.**

**Detalhe** (Dalmut `/imovel/4275525/apartamento-venda-erechim-rs-centro`): JSON-LD `Product` com `sku`, `offers.price` ("570000") e `name` ("Apartamento para Venda, Erechim / RS, bairro Centro, 1 dormitório, 1 banheiro, 1 vaga de garagem, área total 45 m², área útil 45 m²"). No texto: Condomínio R$ 250,00, Código 45454, Bairro, Área Total, Área Útil, Valor por m², descrição.

**robots.txt:** `User-Agent: * / Allow: / / Sitemap: /sitemap.xml` (todos). O sitemap da Dalmut não lista URLs de imóveis, só páginas institucionais.

| Imobiliária | Site | CRECI | Venda total / apto / casa | Locação total / apto / casa |
|---|---|---|---|---|
| Dalmut Imóveis | dalmutimoveis.com.br | 26665 J | 432 / 109 / 97 | 25 / 12 / 2 |
| Marcio Rossi Imóveis | rossiimoveis.imb.br | não verificado | 352 / 54 / 70 | 40 / 9 / 4 |
| Mora Imobiliária | imobiliariamora.com.br | 28.446J | 79 / 34 / 17 (inclui Barão de Cotegipe; 58 em Erechim) | 8 / 3 / 0 |
| Imobiliária Boa Vista | imobiliariaboavistaerechim.com.br | CRECI J 28.392 (snippet de busca) | 58 / 18 / 15 | 0 |
| Scala Corretora de Imóveis | scalaimoveis.com.br | não verificado | 17 / 6 / 4 | 11 / 1 / 0 |

---

## 4. Praedium CRM: Demarco Imóveis

- Site: https://www.demarcoimoveis.com. CRECI 26.397J. Rodapé: "Desenvolvido por Praedium CRM Imobiliário". Assets em `cdn3.praedium.com.br`.
- Listagens: `/imoveis/a-venda/erechim-rs` (222), `/imoveis/para-alugar/erechim-rs` (4), `/apartamento/a-venda/erechim-rs` (51), `/casa/a-venda/erechim-rs` (67), `/apartamento/para-alugar/erechim-rs` (2), `/casa/para-alugar/erechim-rs` (1). Por bairro: `/casa/a-venda/erechim-rs/novo-atlantico`. Por quartos: `.../2-quartos`.
- Paginação: **`?pagina=N`**, 20 por página. Total no `<h1>` ("222 Imóveis à Venda em Erechim, RS").
- Detalhe: `/imovel/casa-a-venda-2-quartos-novo-atlantico-erechim-rs-75m2-id-654`. O ID e a área estão no slug.
- JSON-LD do detalhe (`@type: ["Product","SingleFamilyResidence"]`, ou equivalente para apto): `offers.price` (número), `floorSize.value` (m²), `numberOfBedrooms`, `numberOfBathroomsTotal`, `address.streetAddress` ("Novo Atlântico, Erechim-RS"), `description`, `image`. **Atenção:** o JSON tem quebras de linha cruas; use `json.loads(..., strict=False)`.
- HTML do detalhe: "Código 654", "Cômodos e espaços" (quartos, salas, banheiros), "Dimensões e metragens" ("180,00 m² área útil"). Atenção: a "área útil" do texto pode divergir do `floorSize` (75 vs 180 nesse exemplo).
- robots.txt: bloqueia só `/busca-imoveis.html` para `*` e vários bots SEO. Sitemap index em `/sitemap.xml` (cidades, bairros, quartos, preços...).

## 5. Arbo Imóveis (Next.js): AGE Imóveis

- Site: https://www.imoveisage.com.br. CRECI 27175 (JSON-LD: "CRECI 27175; CRECI 75248"). White-label da Arbo (`static.arboimoveis.com.br`). Os imóveis também aparecem em arboimoveis.com.br.
- Listagens SSR com `<script id="__NEXT_DATA__">`: `/imoveis/a-venda/erechim-rs` (count 143), `/imoveis/a-venda/apartamento/erechim-rs` (46), `/imoveis/a-venda/casa/erechim-rs` (44), `/imoveis/para-alugar/erechim-rs` (7), `/imoveis/para-alugar/apartamento/erechim-rs` (2).
- `props.pageProps.imoveis[]` traz só a primeira página (~10 itens). `?pagina=2` e `?page=2` devolvem a mesma página, então **a paginação é client-side via XHR (endpoint não verificado)**. Alternativas: varrer as URLs de bairro (`/imoveis/a-venda/casa/centro-erechim-rs`) ou interceptar o XHR com navegador headless.
- Campos do item: `imv_cod_gaia` ("CA0015_AGEIM"), `imv_titulo`, `imv_preco_venda`, `imv_preco_locacao`, `imv_preco_cond`, `imv_preco_iptu`, `imv_area_util`, `imv_area_total`, `imv_qtd_dorm`, `imv_qtd_vagas`, `imv_qtd_banheiros`, `imv_bairro`, `imv_cidade`, `imv_endereco`, `imv_location{lat,lng}`, `tipo_imovel.timv_nome`, `tipo_negocio.tpng_nome`, `url_amiga`, `fotos[].imvft_url`, `createdAt`, `updatedAt`.
- Detalhe: `/imovel/<tipo>/<venda|locacao>/erechim/rs/<bairro>/<COD_AGEIM>`.
- robots.txt: `Disallow: /dashboard /proposta-compra /proposta-locacao /conheca/imobiliarias` e bloqueia Amazonbot. Listagens liberadas. O sitemap `https://ageimoveis.site.arboimoveis.com.br/sitemap.xml` aponta para `/api/city-routes/erechim-rs-brasil.xml`, mas esse arquivo vem com domínio errado (`elhageimoveis.com.br`), aparentemente um bug da plataforma.

## 6. Sites próprios

### Erechim Imóveis (ViaSW Sistemas)
- https://www.erechimimoveis.com.br. CRECI 22933J. `<meta name="author" content="ViaSW Sistemas">`. CSP cita `portal.viaimob.com.br` e `imob.sohtec.com.br`. Fotos em `../viasw/fotos/<id>_<n>.jpg`.
- Listagens: `/Imoveis/Venda` (636), `/Imoveis/Locacao` (141), `/Lancamentos`. Paginação por path: **`/Imoveis/Venda/<N>`**, 12 por página (`#pagination[porPag=12][paginas=53]`). Total em `#qtd-imoveis`.
- Detalhe: `/Imovel/Venda/Casa/Jose-Bonifacio/Erechim/RS/5338`. Tipo, bairro e ID estão na URL.
- Card: `.card-imovel-2`, `a.link-imovel[href]`, `.imovel-tipo span` ("Casa"), `.imovel-codigo span` ("5338"), `.imovel-valor` ("R$ 650.000,00"), `.card-endereco span` (bairro, cidade), `.icons .area[data-content]` ("Área privativa: 68,25 m²"), ícones `fa-bed` / `fa-car` / `fa-shower` com o número em `span`.
- O detalhe repete área privativa, dormitórios, vagas, banheiros, características e corretor. Suítes não aparecem como campo.
- Sem robots.txt (`/robots.txt` devolve a home).

### Simão Imóveis (Sami Sistemas)
- https://www.simaoimoveis.com.br. CRECI 23252J. Rodapé: "Desenvolvido por Sami Sistemas". Fotos em `storagelegacy.widesys.com.br` (CRM Widesys). Área do cliente em `clienteonline.com.br`.
- Listagens: `imoveis-para-venda.php` (**503**), `imoveis-para-locacao.php` (**296**). Paginação: **`?&pagina=N`**, 12 por página (42 páginas na venda).
- Filtros (GET): `cidade`, `bairro[]`, `tipo`, `qtd_quartos`, `qtd_vagas`, `valor_minimo`, `valor_maximo`.
- Detalhe: `detalhes-imovel-venda.php?id_imovel=1631` e `detalhes-imovel-locacao.php?id_imovel=L01072`.
- Card: `.ltn__product-item`, `.product-badge li` ("São Cristóvão | Cód. Imóvel 1631", com bairro e código), `h2.product-title a`, `ul.ltn__plot-brief li span` (Quartos, vagas, Suite, Área do Terreno Total, Área Construída). O preço fica no detalhe ("Valor do imóvel: R$ 1.400.000,00", com IPTU).
- robots.txt: bloqueia só `/private/ /temp/ /admin/ /includes/ /logs/`.

### Abenur Imóveis
- https://www.abenurimoveis.com.br. CRECI 26.872 J. Rodapé "Site por BYOV". A página 404 diz "Enterprise" / "Orby Desenvolvimento Web".
- Listagem `/imoveis`, paginação **`/imoveis/pagina/N`** (`page=2` também aparece). Detalhe `/imoveis/detalhes/<slug>-<cod>` (ex.: `...casa-a-venda-no-bairro-atlantico-c596`).
- O detalhe tem tipo, código, bairro, dormitórios, banheiros, vagas (só ícones, sem rótulo), "Terreno 250,00 m²", "Construído 160 m²" e o valor. Os seletores precisam ser mapeados, pois os números aparecem soltos.
- O `/robots.txt` devolve uma página 404 HTML.

### Imóveis Silvana (Byll Agência)
- https://www.imoveissilvana.com.br. `meta author="Byll Agência"`.
- Listagem `imoveis/localizar/?finalidade=V|L&tipo=<id>&page=N`, 28 por página. Tipos: 1 Apartamento, 4 Casa, 6 Cobertura, 17 Terreno, 18 Lançamentos...
- Card: `.individual-imoveis a[href="imoveis/ver/AP0279"]`, `.alt-imagem` (tipo), `.nome-ref` (REF), `p.nome` (Bairro | Cidade), `p.preco` (às vezes "A combinar").
- Detalhe `imoveis/ver/<REF>`: Endereço, Bairro, Cidade, Descrição e preço. **Área e dormitórios não vêm estruturados.**
- robots.txt: `Crawl-delay: 10` e bloqueio só de áreas administrativas.
- Tem imóveis fora de Erechim (Porto Belo/SC etc.).

### Bonatto Empreendimentos Imobiliários
- https://www.bonattoimoveis.com.br. Plataforma "Painel Imobiliário" (Studio72 / Sistemas Pleno: `bonattoimoveis.sistemaspleno.com`).
- Listagens `/imoveis`, `/imoveis/apartamentos`, `/imoveis/casas`, `/imoveis/kitinetes--jk`. Detalhe `/imovel/erechim/apartamento/<id>`.
- Paginação e campos: **não verificados**. A primeira página tem ~29 links.
- O `/robots.txt` devolve HTML. Charset ISO-8859-1.

### Descartados / não encontrados
- **Borba Imóveis** (citada pela UFFS como grande anunciante em 2020): o domínio `borbaimoveis.com.br` (Jetimob, CRECI 20.480-J) é de **Santa Cruz do Sul**, não de Erechim. Não achei site da Borba de Erechim.
- **Solar Imóveis**: site não encontrado.
- Pierozan, Ferretto, Domum, Faggion, Baranoski, Ci5 etc. aparecem só em diretórios (buscja.com, empresaqui.com.br, que lista 361 CNPJs de "imobiliária" em Erechim). Site com listagem não verificado.

---

## Portais agregadores que cobrem Erechim (só referência, sem scraping)

| Portal | URL (Erechim) | Observação |
|---|---|---|
| ZAP Imóveis | https://www.zapimoveis.com.br/venda/imoveis/rs+erechim/ | URL vista em resultado de busca |
| VivaReal | não verificado (mesmo grupo OLX/ZAP) | — |
| OLX | não verificado | — |
| Imovelweb | https://www.imovelweb.com.br/imoveis-venda-erechim-rs.html | título da página: "480 Imóveis à venda em Erechim" |
| Wimoveis | https://www.wimoveis.com.br/venda/imoveis/rs/erechim | "490 imóveis à venda" (título) |
| Chaves na Mão | não verificado (aparece como origem de anúncios no Mitula) | — |
| Mitula / Trovit (metabuscadores) | https://imoveis.mitula.com.br, https://imoveis.trovit.com.br | agregam anúncios de vários portais |
| MGF Imóveis | https://www.mgfimoveis.com.br/buscar/imoveis/rs-erechim | — |

---

## Bairros de Erechim

**Fonte oficial:** Projeto de Lei nº 045/2015 da Câmara de Erechim, "Denomina e delimita os Bairros do Município de Erechim"
([PDF no SAPL](https://sapl.erechim.rs.leg.br/media/sapl/public/materialegislativa/2015/11052/11052_texto_integral.pdf)).
O Art. 1º cria o Bairro Aldo Arioli e o Art. 2º consolida 58 bairros do perímetro urbano.
*Não verifiquei o número da lei promulgada.* Um artigo acadêmico cita "Lei 6.037/2015", mas não confirmei.

Os 58 bairros do PL 045/2015, com a grafia do texto:

1. Aeroporto
2. Agrícola
3. Aldo Arioli
4. Amizade
5. Atlântico
6. Bandeirante
7. Bela Vista
8. Boa Vista
9. Centro
10. Cerâmica
11. Consoladora
12. Copas Verdes
13. Cotrel
14. Cristal
15. Cristo Rei
16. Dal Molin
17. Demoliner
18. Esperança
19. Espírito Santo
20. Estevam Carraro
21. Fátima
22. Frinape
23. Industrial
24. Industrial Norte
25. Ipiranga
26. Jabuticabal
27. José Bonifácio
28. Koller
29. Liberdade
30. Linho
31. Maria Clara
32. Morada do Sol
33. Morro da Cegonha
34. Novo Atlântico
35. Paiol Grande
36. Parque dos Imigrantes
37. Parque Lívia
38. Parque Redenção
39. Petit Vilage
40. Presidente Castelo Branco
41. Presidente Vargas
42. Progresso
43. Rio Tigre
44. Santa Catarina
45. Santo Antônio
46. São Caetano
47. São Cristóvão
48. São José
49. São Vicente de Paulo
50. Três Vendas
51. Triângulo
52. União
53. Vale dos Parreirais
54. Vale Dourado
55. Verdureiros
56. Victoria I
57. Victoria II
58. Zimmer

Complementos:
- A [Wikipedia: Lista de bairros de Erechim](https://pt.wikipedia.org/wiki/Lista_de_bairros_de_Erechim) traz 31 bairros com população e renda média do Censo IBGE 2010. É a divisão anterior, mas serve de proxy socioeconômico. Renda média mensal mais alta: Ipiranga R$ 2.217, Morro da Cegonha R$ 2.023, Fátima R$ 2.003, Centro R$ 1.911, José Bonifácio R$ 1.727.
- **Nomes usados pelas imobiliárias que não estão na lista oficial** (precisam de mapeamento): "Florais Itália", "Jardim Europa", "Arvoredo", "Novo Horizonte", "Poltronieri", "São Pedro", "Redenção" (= Parque Redenção), "Agrícola II", "Loteamento Bem Morar/Calgaro/Dona Olga/Estar do Chile", "V. Santa Catarina", "Jaboticabal" (= Jabuticabal), "Linha São Sebastião", "Zona Urbana", "ERS 135", "Interior". Em geral são loteamentos ou condomínios dentro de um bairro oficial. O mapeamento exige geolocalização (o SigaHost fornece lat/long) ou consulta ao mapa da Prefeitura.

---

## Referências de preço m²

### Índices oficiais e notícias
- **FipeZap:** não verificado. Provavelmente não cobre Erechim, pois nenhuma busca retornou dados FipeZap para a cidade.
- **Notícias locais com R$/m² por bairro:** não encontrei.
- **Planta Genérica de Valores (IPTU/ITBI):** existe o Projeto de Lei do Executivo nº 110/2017, que "institui a Planta de Valores Venais" ([parecer no SAPL](https://sapl.erechim.rs.leg.br/media/sapl/public/documentoacessorio/2017/5930/5930.pdf)), mas não encontrei a tabela de valores por bairro. A Lei 6.085/2015 atualizou o valor venal em 5,24% para 2016. Os valores venais servem de base fiscal e costumam ficar bem abaixo do valor de mercado.
- **CUB/RS (Sinduscon-RS), custo de construção:** R8-N de setembro/2026 = **R$ 2.943,73/m²**, segundo [Paggo](https://www.paggo.com.br/indices/cub/rio-grande-do-sul) e [Marcca](https://www.marcca.com.br/cub_rs__r8n_.html). Não verificado na publicação primária do Sinduscon-RS. O último PDF primário que encontrei ([junho/2026](https://sinduscon-rs.com.br/wp-content/uploads/2026/07/PRECOS-E-CUSTOS-DA-CONSTRUCAO-DE-JUNHO-2026.pdf)) traz R8-N = R$ 2.879,20. É custo de construção, não preço de venda.
- **UFFS:** Rojeski & Spinelli, "Mercado imobiliário e desigualdades socioespaciais em Erechim-RS" ([PDF](https://portaleventos.uffs.edu.br/index.php/JORNADA/article/download/16821/11396/64690)) levantou ofertas em jornal de 2005, 2010, 2015 e 2020 com preço/m² por bairro. O resumo não publica os valores, só a conclusão: o Centro e o entorno são os mais valorizados. A base seria divulgada no "Observatório Geográfico da Fronteira Sul" (não verificado).

### Referência empírica: preço pedido (asking price) nos anúncios SigaHost

Calculei com os dados da API dos 7 sites SigaHost liberados (Bem Morar, Prigol, Serrana, Gaúcha, Lia, Zion, Menegatti), em 14/10/2026.
- Universo: venda, apartamentos, casas e sobrados, `Cidade == Erechim`.
- Filtros: `len(Tipo)==1`, preço ≥ R$ 50 mil, 25 m² ≤ área privativa ≤ 1.000 m².
- Deduplicação por (bairro normalizado, área arredondada, preço arredondado ao milhar, categoria).
- Bairros com n ≥ 5.

**Ressalvas:** é preço **pedido**, não preço de transação. Para casas, a "AreaPrivativa" informada pela imobiliária pode ser a área construída ou outra medida, o que gera dispersão alta.

**Apartamentos (venda), R$/m² de área privativa**

| Bairro | n | Mediana | P25 – P75 |
|---|---|---|---|
| **Todos** | 655 | 5.952 | |
| Centro | 401 | 6.316 | 5.038 – 7.793 |
| Bela Vista | 61 | 5.237 | 4.340 – 6.161 |
| Fátima | 40 | 6.539 | 4.728 – 7.620 |
| Três Vendas | 27 | 5.558 | 4.512 – 6.213 |
| José Bonifácio | 19 | 4.843 | 4.183 – 6.254 |
| Copas Verdes | 14 | 4.641 | 4.237 – 5.152 |
| Linho | 12 | 6.612 | 6.289 – 6.840 |
| Espírito Santo | 10 | 5.700 | 4.708 – 6.388 |
| Esperança | 7 | 5.519 | 5.410 – 6.491 |
| Ipiranga | 6 | 5.733 | 5.311 – 6.629 |

**Casas (venda), R$/m² ("AreaPrivativa" informada)**

| Bairro | n | Mediana | P25 – P75 |
|---|---|---|---|
| **Todos** | 527 | 5.159 | |
| Centro | 44 | 5.183 | 3.780 – 9.804 |
| Bela Vista | 36 | 5.201 | 3.471 – 6.123 |
| Novo Atlântico | 32 | 6.113 | 5.020 – 7.331 |
| José Bonifácio | 28 | 4.602 | 3.715 – 6.485 |
| Koller | 26 | 4.577 | 3.642 – 5.246 |
| Esperança | 18 | 7.908 | 5.461 – 9.738 |
| Espírito Santo | 18 | 4.570 | 4.003 – 6.201 |
| Ipiranga | 18 | 7.159 | 6.025 – 8.666 |
| Atlântico | 17 | 3.325 | 2.691 – 5.740 |
| Cerâmica | 16 | 4.143 | 3.319 – 6.233 |
| Linho | 15 | 5.321 | 4.337 – 5.614 |
| Três Vendas | 13 | 4.267 | 3.652 – 5.979 |
| Jabuticabal | 13 | 4.808 | 3.425 – 6.809 |
| Liberdade | 13 | 6.483 | 5.803 – 7.399 |
| Cristal | 10 | 5.636 | 4.632 – 6.646 |
| Morada do Sol | 10 | 4.299 | 3.511 – 4.789 |
| Boa Vista | 9 | 5.789 | 3.875 – 6.441 |
| Zimmer | 9 | 4.665 | 3.473 – 5.892 |
| Aldo Arioli | 8 | 3.138 | 2.659 – 4.053 |
| Paiol Grande | 8 | 4.907 | 3.501 – 5.853 |
| Aeroporto | 8 | 2.627 | 2.502 – 4.654 |
| Demoliner | 8 | 5.871 | 5.056 – 6.417 |
| Copas Verdes | 7 | 4.118 | 3.333 – 5.455 |
| Parque dos Imigrantes | 7 | 5.705 | 2.833 – 6.730 |
| Fátima | 7 | 5.172 | 4.400 – 6.447 |
| Dal Molin | 7 | 4.844 | 3.416 – 6.583 |

As páginas da ImobiBrasil também exibem "Valor por m²" calculado por anúncio (ex.: Jabuticabal R$ 5.828/m²; Dalmut, Centro: R$ 12.666/m² num apto mobiliado de 45 m²). Esse valor pode servir de validação cruzada.

---

## Fontes

- Diretórios: [redecasas.com.br (Erechim)](https://redecasas.com.br/estado/rio-grande-do-sul/erechim/), [buscja.com](https://www.buscja.com/rs/erechim/imobiliarias), [empresaqui.com.br](https://www.empresaqui.com.br/empresas/imobiliaria/rs/erechim)
- Sites das imobiliárias listados nas tabelas (acesso direto em 14/10/2026: HTML, robots.txt, API, sitemap)
- [PL 045/2015, Bairros de Erechim (SAPL)](https://sapl.erechim.rs.leg.br/media/sapl/public/materialegislativa/2015/11052/11052_texto_integral.pdf)
- [Wikipedia: Lista de bairros de Erechim](https://pt.wikipedia.org/wiki/Lista_de_bairros_de_Erechim)
- [SAPL: parecer sobre o PL 110/2017 (Planta de Valores)](https://sapl.erechim.rs.leg.br/media/sapl/public/documentoacessorio/2017/5930/5930.pdf)
- [UFFS: Mercado imobiliário e desigualdades socioespaciais em Erechim](https://portaleventos.uffs.edu.br/index.php/JORNADA/article/view/16821/11396)
- CUB/RS: [Paggo](https://www.paggo.com.br/indices/cub/rio-grande-do-sul), [Marcca](https://www.marcca.com.br/cub_rs__r8n_.html), [Sinduscon-RS jun/2026](https://sinduscon-rs.com.br/wp-content/uploads/2026/07/PRECOS-E-CUSTOS-DA-CONSTRUCAO-DE-JUNHO-2026.pdf)
- Portais: [Imovelweb](https://www.imovelweb.com.br/imoveis-venda-erechim-rs.html), [Wimoveis](https://www.wimoveis.com.br/venda/imoveis/rs/erechim), [ZAP](https://www.zapimoveis.com.br/venda/imoveis/rs+erechim/), [MGF](https://www.mgfimoveis.com.br/buscar/imoveis/rs-erechim)
