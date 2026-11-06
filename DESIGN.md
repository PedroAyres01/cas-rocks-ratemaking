---
name: CAS Rocks · Reajuste 2017
description: A tarifação do seguro auto contada como uma rodovia noturna, com placas, LED âmbar e marcos de quilômetro.
colors:
  asphalt: "#111417"
  asphalt-2: "#171b1f"
  asphalt-3: "#20262b"
  asphalt-4: "#2c343a"
  green: "#0b6b3f"
  green-ink: "#d9efe2"
  white: "#f2f4f1"
  muted: "#a9b2b6"
  faint: "#6e787d"
  amber: "#ffb000"
  amber-off: "#2b1f06"
  yellow: "#f5c400"
  lane: "#e9ece8"
  vms-black: "#07090a"
  sign-ink: "#111111"
  series-green-2: "#2f8a5c"
  series-green-3: "#5aa47c"
  series-concrete: "#c9cfcc"
  trail-calm: "#c9b48a"
  trail-hot: "#fff3cf"
typography:
  display:
    fontFamily: "Overpass, Helvetica Neue, Arial, sans-serif"
    fontSize: "10rem"
    fontWeight: 900
    lineHeight: 0.95
    letterSpacing: "-0.03em"
    fontFeature: "'tnum' 1, 'lnum' 1"
  headline:
    fontFamily: "Overpass, Helvetica Neue, Arial, sans-serif"
    fontSize: "3.1rem"
    fontWeight: 800
    lineHeight: 1.08
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Overpass, Helvetica Neue, Arial, sans-serif"
    fontSize: "2.9rem"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "-0.02em"
    fontFeature: "'tnum' 1, 'lnum' 1"
  body:
    fontFamily: "Overpass, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.3rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Overpass, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.15rem"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "0.02em"
  caption-mono:
    fontFamily: "Overpass Mono, ui-monospace, SF Mono, Menlo, monospace"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  plate: "0.95rem"
  tab: "0.8rem"
  panel: "0.6rem"
  control: "0.55rem"
  post: "0.4rem"
  track: "1rem"
  round: "50%"
spacing:
  gap-xs: "0.6rem"
  gap-sm: "1.2rem"
  gap-md: "2.4rem"
  gap-lg: "4rem"
  station-top: "6.2rem"
  station-x: "4rem"
  station-bottom: "7.6rem"
components:
  sign:
    backgroundColor: "{colors.green}"
    textColor: "{colors.white}"
    rounded: "{rounded.plate}"
    padding: "1.4rem 2rem 1.1rem"
  sign-hot:
    backgroundColor: "{colors.green}"
    textColor: "{colors.white}"
    rounded: "{rounded.plate}"
  exit-tab:
    backgroundColor: "{colors.green}"
    textColor: "{colors.white}"
    rounded: "{rounded.tab}"
    padding: "1rem 1.1rem 0.9rem"
  vms:
    backgroundColor: "{colors.vms-black}"
    textColor: "{colors.amber}"
    rounded: "{rounded.panel}"
    padding: "0.9rem 1.1rem"
  shield:
    textColor: "{colors.white}"
    rounded: "{rounded.panel}"
    padding: "0.45rem 1rem 0.35rem"
  exit-link:
    textColor: "{colors.muted}"
    rounded: "0.5rem"
    padding: "0.35rem 0.75rem 0.4rem"
  exit-link-current:
    backgroundColor: "{colors.green}"
    textColor: "{colors.white}"
    rounded: "0.5rem"
  kmpost:
    backgroundColor: "{colors.white}"
    textColor: "{colors.sign-ink}"
    rounded: "{rounded.post}"
    padding: "0.35rem 0.75rem 0.25rem"
  drive-button:
    backgroundColor: "{colors.asphalt-3}"
    textColor: "{colors.white}"
    rounded: "{rounded.round}"
    size: "3rem"
  drive-button-hover:
    backgroundColor: "{colors.asphalt-4}"
  preset:
    backgroundColor: "{colors.asphalt-3}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "0.65rem 1rem 0.55rem"
  preset-hover:
    backgroundColor: "{colors.asphalt-4}"
  preset-on:
    backgroundColor: "{colors.green}"
    textColor: "{colors.white}"
  formula-panel:
    backgroundColor: "{colors.asphalt-2}"
    textColor: "{colors.white}"
    rounded: "{rounded.panel}"
    padding: "1.1rem 1.4rem"
---

# Design System: CAS Rocks · Reajuste 2017

## Overview

**Creative North Star: "A Rodovia Noturna"**

Cada ideia é um objeto de beira de estrada à noite. O fundo é asfalto fosco quase preto com grão fino e rastros de faróis em longa exposição; sobre ele, placas verde-rodovia com borda branca interna carregam os números, painéis de mensagem variável em LED âmbar dão o veredito, e a pista (faixa contínua, faixa tracejada, marco de quilômetro) ancora a parte de baixo da tela. Nada é "card": tudo é placa, painel, poste ou faixa.

A densidade é de sinalização, não de documento: poucos elementos por tela, números enormes lidos a distância num telão, texto corrido curto e em cinza. O movimento é de viagem: a estação seguinte chega da direita em camadas de profundidade, a pista corre, os rastros de luz aceleram e as placas captam um reflexo que varre a película. O ponteiro funciona como a cabeça de quem dirige: a câmera desliza levemente e todas as placas refletem a mesma fonte de luz.

A recusa confirmada é o deck corporativo de título, gráfico e logo: nenhum slide branco, nenhum template de apresentação, nenhuma identidade de terceiros.

**Key Characteristics:**
- Asfalto escuro com grão e rastros de luz em canvas como única superfície de fundo.
- Placas verdes com borda branca interna desenhada por sombras internas, cantos arredondados.
- LED âmbar em matriz de pontos para o resultado que o modelo emite.
- Amarelo refletivo só no que está em foco ou mudou.
- Overpass em todos os pesos; Overpass Mono só para nomear a célula da planilha.
- Tudo em rem escalado como slide (base 1440×900) no modo apresentação.

## Colors

Paleta de rodovia à noite: neutros frios de asfalto, um verde de placa, e duas luzes quentes com papéis estritamente separados (âmbar emitido, amarelo refletido).

### Primary
- **Verde Placa Rodoviária** (green): fundo de toda placa, aba de saída, resultado de equação, item de navegação atual, linha selecionada na tabela e preset ativo. É a cor que diz "isto é um número oficial".
- **Branco Película** (green-ink): texto secundário sobre a placa verde (subtítulos, legendas de célula, rótulos das abas).

### Secondary
- **Âmbar LED** (amber): pontos acesos dos painéis de mensagem variável, barras do gráfico LED, pontos e valores projetados nos gráficos e tabelas de ajuste, cor média dos rastros de luz.
- **LED Apagado** (amber-off): pontos apagados da matriz, que mantêm a grade visível.
- **Preto Painel** (vms-black): fundo do painel de mensagem variável, mais escuro que o asfalto.

### Tertiary
- **Amarelo Refletivo** (yellow): foco e mudança. Anel de foco, borda da placa em destaque, preset ativo, polegar losango do controle deslizante, diagonal alterada no paralelogramo, célula de desenvolvimento destacada, losango de advertência, marcador central da faixa de confiança, seleção de texto.

### Neutral
- **Asfalto** (asphalt): fundo de página e cor do tema do navegador.
- **Asfalto 2 / 3 / 4** (asphalt-2, asphalt-3, asphalt-4): degraus de superfície para painéis de fórmula, botões, presets, trilhas e divisórias de tabela.
- **Branco Retrorrefletivo** (white): texto principal, borda interna das placas, números.
- **Cinza Neblina** (muted): texto corrido, rótulos de eixo, cabeçalhos de tabela, navegação inativa.
- **Cinza Distante** (faint): valores antigos riscados e sublinhado neutro de célula.
- **Branco Faixa** (lane): faixas de pista, linha de base dos gráficos, parte preenchida do controle deslizante.
- **Tinta de Poste** (sign-ink): texto e contorno sobre superfícies brancas ou amarelas (marco de km, losango, link de pular).
- **Séries de composição** (series-green-2, series-green-3, series-concrete): segmentos da barra empilhada do prêmio, em ordem do verde de placa até o concreto.
- **Rastro frio / quente** (trail-calm, trail-hot): extremos de cor dos rastros de faróis no canvas; não aparecem em UI.

### Named Rules
**The Reflective Yellow Rule.** O amarelo só aparece no que está em foco, selecionado ou alterado. Se nada mudou, nada é amarelo.

**The Emitted Amber Rule.** Âmbar é luz emitida pelo modelo: LED, projeções e valores ajustados. Nunca é cor de botão, borda ou navegação.

## Typography

**Display Font:** Overpass (com Helvetica Neue, Arial)
**Body Font:** Overpass (com Helvetica Neue, Arial)
**Label/Mono Font:** Overpass Mono (com ui-monospace, SF Mono, Menlo)

**Character:** Overpass é a tipografia de rodovia: larga, aberta e legível a distância. Pesos pesados (800–900) para todo número; o corpo fica em 400–600 e em cinza. Números sempre tabulares e alinhados (`tnum`, `lnum`), definidos no corpo da página.

### Hierarchy
- **Display** (900, 10rem, 0.95): o número-resposta numa placa gigante (abertura e fechamento; 7.4rem no fechamento, 5–5.2rem no celular).
- **Headline** (800, 3.1rem, 1.08, máx. 22ch): a pergunta ou afirmação de cada estação; 2.1rem no celular.
- **Title** (900, 2.9rem, 1): valor dentro de uma placa; 2.2rem em placas pequenas e no celular. Valores de lista e legenda seguem a mesma lógica entre 1.9rem e 2.6rem.
- **Body** (400, 1.3rem, 1.5, máx. 52ch, cor muted): texto de apoio sob o título. Parágrafos de contexto ficam em 1.05–1.25rem com 58–90ch.
- **Label** (800, 1.15rem, 0.02em, maiúsculas): legenda da placa. Rótulos menores em maiúsculas (cabeçalho de tabela, aba de saída, controle) usam 0.85–1.05rem com 0.03–0.05em.
- **Caption Mono** (400, 1rem): nome da aba e célula da planilha ("LR Indication · L24"), sempre entre réguas ou sob o valor.

### Named Rules
**The Cell Caption Rule.** Todo número oficial carrega, em Overpass Mono, o nome da aba e da célula que o produziu. O mono não serve para mais nada além de células e código.

**The Heavy Numbers Rule.** Número é 900, texto é 400–800. Nenhum valor aparece em peso leve; o único peso leve (300) é o operador da equação.

## Layout

No modo apresentação (largura ≥ 900px e proporção paisagem) a página é uma estrada horizontal: uma pista de estações, cada uma com 100vw por 100dvh, sem rolagem. A tipografia escala como slide: a raiz vale `min(1.111vw, 1.778vh)`, ou seja 16px em 1440×900, e todas as medidas são em rem. Cada estação reserva a moldura fixa no topo (station-top) e a pista embaixo (station-bottom), com margens laterais de station-x e conteúdo limitado a 84rem.

Composições recorrentes: placa ou gráfico à esquerda com texto à direita (colunas de 30rem + 1fr, ou 46fr / 38fr na abertura), fileiras de 4 ou 5 placas iguais, e pilhas verticais com espaçamento gap-md. Os espaçamentos observados são gap-xs, gap-sm, gap-md e gap-lg, com passos intermediários de 1.4rem, 1.6rem e 3.2rem.

Em celular e tablet em pé (abaixo de 900px ou proporção retrato) a estrada vira vertical: raiz em 15px, rolagem normal, moldura fixa com fundo translúcido e desfoque, abas de saída sem o rótulo "Saída", pista, marco de km e botões somem, cada estação é separada por uma faixa tracejada de 0.3rem. Grades caem para uma coluna (fileiras de placas para duas), a ponte em SVG vira lista de placas e o gráfico LED vira tabela.

**The Station Rule.** Uma estação, uma ideia, uma tela. Se não cabe em 1440×900 sem rolar, é duas estações.

## Elevation & Depth

Profundidade vem de três fontes: sombra de objeto físico, paralaxe por camadas e uma única fonte de luz. Placas, painéis e postes são objetos sobre o asfalto e projetam uma sombra longa e difusa para baixo; as bordas de placa são desenhadas com sombras internas, não com `border`. Na viagem e com o ponteiro, cada filho direto de uma estação recebe uma profundidade (texto mais longe a 0.3–0.45, placas e controles mais perto a 0.8–1.25) e se desloca proporcionalmente. O canvas de rastros fica atrás de tudo com máscara vertical e vinheta.

### Shadow Vocabulary
- **Lançamento de placa** (`0 1.4rem 2.6rem -1.2rem rgba(0,0,0,0.85), 0 0.3rem 0.6rem rgba(0,0,0,0.35)`): placas, painéis LED, resultado de equação e barra empilhada.
- **Borda de película** (`inset 0 0 0 0.24rem var(--green), inset 0 0 0 0.42rem var(--white)`): borda branca interna da placa; a versão em foco troca o branco por amarelo. Abas e lista-ponte usam 0.2rem / 0.32–0.34rem.
- **Moldura de painel** (`inset 0 0 0 0.2rem #1d2226, inset 0 0 0 0.32rem #0b0d0f`): bisel do painel de mensagem variável.
- **Anel de controle** (`inset 0 0 0 0.1rem var(--asphalt-4)`): botões de navegação, presets e painel de fórmula.
- **Sombra de losango** (`drop-shadow(0 0.5rem 0.8rem rgba(0,0,0,0.5))`): placa de advertência em SVG.

### Named Rules
**The One Light Source Rule.** Todas as placas refletem a mesma luz: o brilho da película segue o ponteiro e o reflexo de chegada varre da esquerda para a direita. Nenhuma placa tem luz própria; só o LED emite.

## Shapes

Formas de sinalização viária: retângulos com cantos arredondados proporcionais ao tamanho do objeto (placa plate, aba tab, painel panel, controle control, marco post), círculos só nos botões de navegação e nos pontos de passo, e o losango a 45° como forma de advertência e de marcador (placa amarela de atenção, polegar do controle deslizante, centro da faixa de confiança). Trilhas e réguas usam a ponta arredondada track. A placa de abertura mostra quatro parafusos nos cantos. Bordas são sempre duplas e internas (cor da placa, depois branco); nunca há contorno externo.

## Components

### Placa (Sign)
Objeto oficial do sistema: guarda um número auditado.
- **Forma:** cantos de placa (plate), borda branca interna dupla, sombra de lançamento.
- **Conteúdo:** legenda em maiúsculas (label), valor em title, subtítulo em green-ink, legenda de célula em mono.
- **Variantes:** pequena (padding 0.8rem, valor 2.2rem); gigante de abertura e fechamento com parafusos e inclinação 3D que segue o ponteiro; em destaque (`is-hot`) com borda amarela e valor em creme.
- **Comportamento:** ao chegar, sobe de 90% de escala com opacidade 0.35 até 1 (0.9s, expo.out, escalonado 0.05s) e recebe a varredura de reflexo (1.2s).

### Painel de mensagem variável (VMS)
O veredito do modelo, em LED.
- **Forma:** painel preto (vms-black) com bisel duplo, cantos panel.
- **Matriz:** canvas com glifos 5×7 desenhados ponto a ponto; pontos acesos em amber, apagados em amber-off. Troca de texto embaralha os caracteres antes de assentar.
- **Uso:** título da abertura, resultado da ponte, resultado e faixa de robustez do simulador.

### Navegação (abas de saída, escudo, marco, botões)
- **Escudo:** "EAC0465 · FEA-USP" com contorno branco interno de 0.12rem, volta ao KM 0.
- **Abas de saída:** rótulo "Saída N" em maiúsculas com seta diagonal em SVG, nome abaixo; inativa em muted, hover em white (200ms), atual em placa verde com contorno branco.
- **Marco de km:** poste branco com borda dupla escura, "KM", número 2rem 900 e "/11".
- **Botões de direção:** círculos de 3rem em asphalt-3, hover asphalt-4, pressionado 94%, desabilitado 35% de opacidade; pontos de passo de 0.45rem entre eles.

### Presets (Buttons)
- **Forma:** cantos control, fundo asphalt-3 com anel asphalt-4, texto 700 1rem.
- **Hover:** fundo asphalt-4 (180ms).
- **Ativo:** placa verde com borda interna amarela.

### Controle deslizante (Inputs)
- **Trilha:** 0.42rem, parte preenchida em lane, restante em asphalt-4, ponta track.
- **Polegar:** losango amarelo de 1.7rem; cresce 115% ao arrastar.
- **Foco:** contorno amarelo de 0.18rem com afastamento de 0.2rem.
- **Rótulo:** nome em maiúsculas 800 à esquerda, valor 1.9rem 900 à direita, célula em mono abaixo.

### Legenda com régua (Caption)
Texto mono em muted entre duas linhas de 1px em asphalt-4; a régua da esquerda é curta (1.5rem). Na placa gigante a régua é branca e o texto green-ink.

### Tabelas
Números alinhados à direita, cabeçalho em maiúsculas muted, divisórias de 1px em asphalt-3/4. Linha selecionada vira faixa verde com cantos panel nas pontas; valores projetados em amber; valor alterado sublinhado e, após a revelação, amarelo.

### Losango de advertência
Placa SVG amarela com contorno interno e ponto de exclamação em sign-ink; acompanha avisos.

### Movimento de viagem
Navegação entre estações desliza a pista inteira (expo.inOut, 0.95s mais 0.12s por estação pulada, até 1.5s); as camadas entram com deslocamento proporcional à profundidade, a faixa tracejada corre e os rastros aceleram e depois assentam. Passos dentro de uma estação aparecem com opacidade, 0.8rem de subida e desfoque de 4px (420–520ms, `--ease-out`). Com movimento reduzido, tudo é instantâneo e os rastros param.

## Do's and Don'ts

### Do:
- **Do** colocar todo número oficial numa placa verde com borda branca interna, com a célula de origem em Overpass Mono.
- **Do** usar o painel LED âmbar para o resultado que o modelo calcula ao vivo.
- **Do** reservar o amarelo para foco, seleção e o que mudou (borda, polegar, diagonal, anel de foco).
- **Do** escrever medidas em rem para que a estação escale como slide na base 1440×900.
- **Do** atribuir profundidade a cada bloco de estação: texto longe (0.3–0.45), placas e controles perto (0.8–1.25).
- **Do** manter números em 900 com algarismos tabulares.

### Don't:
- **Don't** criar superfícies claras de página ou cards brancos; a única peça branca é o marco de quilômetro.
- **Don't** usar âmbar em botões, bordas ou navegação; âmbar é só luz emitida.
- **Don't** desenhar bordas de placa com `border` externo; a borda é interna e dupla.
- **Don't** usar outra família tipográfica além de Overpass e Overpass Mono.
- **Don't** usar logo ou identidade visual da Allianz.
- **Don't** montar a estação como slide corporativo de título, gráfico e logo.
