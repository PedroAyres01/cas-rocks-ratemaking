---
name: CAS Rocks · Simulador de cenários 2017
description: Extensão interativa da apresentação do grupo. Mesma linguagem do deck — papel quente, tinta azul-marinho, acento laranja queimado, serifa editorial — com abertura cinematográfica e simulador de premissas.
colors:
  paper: "#F5F2EC"
  paper-2: "#EAE5DB"
  card: "#FFFDF8"
  ink: "#1B2433"
  navy: "#111C2E"
  night: "#0E1828"
  night-2: "#1D3253"
  muted: "#4A5361"
  line: "#D8D2C6"
  accent: "#B0471F"
  accent-soft: "#F0A36B"
  series: ["#2B6CA3", "#C8562B", "#8A5AB5", "#1A9A7F"]
fonts:
  display: Source Serif 4 (400, 600)
  text: Inter Variable
---

# Design

## Mundo visual
O site continua o deck do grupo (artifact Slides "CAS Rocks · Tarifação 2017"): fundo papel #F5F2EC, títulos em Source Serif 4 azul-marinho, texto em Inter, acento laranja queimado. Os blocos de resultado usam o azul-noite do slide de recomendação. Nada de identidade da Allianz (é a plateia, não a empresa do caso).

## Estrutura
1. **Abertura (100svh, escura).** Título "A tarifa já está no preço certo." e a ponte de −6,2% a −0,05% que se monta barra a barra enquanto o número conta. Fundo: linhas finas ondulando devagar (canvas), uma delas em laranja. Ao rolar, o conteúdo recua (translate + opacidade). Botão "Rever a ponte".
2. **Simulador.** Cenários prontos (grupo, planilha original, perguntas do Guia, teste de estresse) em chips; painel de premissas à esquerda (fixo no desktop, sanfonas por bloco P1–P5); indicadores em faixa escura; quatro gráficos.
3. **Rodapé de método** com as premissas a confirmar (veículo-ano; faixa de erro só do número de sinistros).

## Controles
- Cada premissa é um slider com: valor atual (laranja quando difere do grupo), marca vertical na escolha do grupo, triângulos roxos nos ajustes exponenciais da série (tendências), e "Voltar ao grupo".
- LDF: atalhos por método (todos os anos, 3, 4, sem extremos, geométrica) calculados do triângulo.
- O cenário fica no endereço (`#c=`), para compartilhar.

## Gráficos (SVG à mão, no tamanho real)
- Paleta de séries validada pelo validador do skill dataviz (daltonismo e contraste ≥ 3:1 sobre o cartão).
- Ponte em cascata (laranja aumenta, azul reduz, totais em marinho/acento), curva de sensibilidade à severidade com faixa de erro e clique para aplicar, sinistralidade por ano (pontos, sem eixo truncado em barras) com tabela, composição do prêmio em três decisões.
- Dica flutuante única, valor em destaque e rótulo secundário; foco por teclado mostra a mesma dica.

## Movimento
- Abertura: título e número sobem (900 ms), barras crescem a partir da linha anterior (520 ms, intervalo de 420 ms).
- Cartões entram uma vez ao aparecer (600 ms); gráficos se desenham na primeira vez (barras crescem, curva traça, pontos aparecem).
- Mexer em premissa não anima os gráficos (resposta imediata); só os números grandes fazem transição de 220 ms.
- `prefers-reduced-motion` desliga tudo e mostra o estado final.
