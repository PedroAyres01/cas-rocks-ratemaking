# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Vite + JavaScript puro + GSAP (decisão de Pedro em 06/11/2026). Repositório público no GitHub (conta PedroAyres01), deploy automático na Vercel. O projeto `mari-islam-africa` é referência apenas do processo operacional de publicação, não do visual: Pedro pediu explicitamente um mundo visual novo.

## Users

- **Primário:** a plateia da apresentação ao vivo — o CEO da Allianz, o professor (João Vinícius de França Carvalho, EAC0465 Matemática Atuarial Não Vida I, FEA-USP) e a turma. Assistem a uma exposição conduzida pelo grupo no telão, cerca de 20 minutos mais debate.
- **Condutores:** os 6 integrantes do grupo, que avançam a apresentação por teclado/clique e respondem perguntas mexendo nas premissas ao vivo.
- **Depois da apresentação:** quem recebe o link (CEO, professor) explora sozinho.

## Product Purpose

Apresentar a solução do estudo de caso "Seguro de Automóveis" da Casualty Actuarial Society (CAS): a indicação de mudança de taxa de uma carteira de Responsabilidade Civil de Danos Materiais (Private Passenger Auto PD Liability) da seguradora fictícia CAS Rocks Insurance. Sucesso: a plateia entende a resposta (reajuste de −0,5%) e o raciocínio por trás dela, e percebe domínio técnico e esforço acima do esperado.

## Positioning

O grupo não só reproduz o resultado do professor (−6,2%): corrige os erros apontados no Guia, encontra dois bugs de idioma na planilha original que nenhum trabalho anterior percebeu, chega a uma taxa final defensável e deixa a plateia testar as premissas ao vivo.

## Operating Context

- Projetado em telão/projetor pelo notebook do grupo; precisa funcionar sem internet (arquivo estático) e ter PDF de reserva.
- Depois, o mesmo conteúdo fica online na Vercel para exploração individual (desktop e celular).
- O professor avalia os 5 objetivos do caso: (i) fatores que influenciam a tarifa; (ii) padrões de desenvolvimento de sinistros; (iii) tendências; (iv) reajustes de nível de prêmio; (v) papel das despesas.
- Há tutoria em que um representante do grupo pode tirar dúvidas com o professor.

## Capabilities and Constraints

- Conteúdo numérico vem exclusivamente da solução auditada (`../Solucao - Estudo de Caso Auto.xlsx` e `../Plano do Grupo e Solucao - Estudo de Caso Auto.pdf`); recalcular pelo modelo, nunca digitar números à mão.
- Recalcular a indicação ao vivo a partir das premissas (severidade, credibilidade, despesas, tendência de prêmio) usando as mesmas fórmulas da planilha.
- Idioma: português. Termos técnicos em inglês aparecem com tradução na primeira menção.
- A Allianz é a plateia, não a empresa do caso: não usar logo nem identidade visual da Allianz como se o material fosse dela.
- Em aberto: data da apresentação; unidade da exposição (veículo-ano, assumida); se o professor espera reajuste selecionado diferente do indicado.

## Brand Commitments

Caso da CAS por Christian Coleianne, Alisa Havens Walch e Mark Priven. Grupo de 6 alunos da FEA-USP. Pedro pediu: premium, animações que surpreendam, conteúdo tão forte quanto o visual.

## Evidence on Hand

- Resultados auditados: base reproduz o slide do professor (sinistralidade 61,9%, despesa fixa 11,3%, variável 17,0%, reajuste −6,2%); recomendação final (62,5%, 12,6%, 19,5%, −0,5%); prêmio médio por veículo US$ 120,15 → US$ 119,55.
- Ponte −6,2% → −0,5%, sensibilidades de cada pergunta do Guia, robustez (severidade 1,5% → −1,4%; 2,5% → +0,4%).
- Dois bugs de idioma: DATEVALUE("7/1/2015") lido como 7 de janeiro (período 2,7333 em vez de 2,25) e TEXT(...,"yyyy") exibindo "yyyy".
- Não existem: depoimentos, dados reais da Allianz, fotos do grupo. Não inventar.

## Product Principles

1. A resposta primeiro: −0,5% e o prêmio novo aparecem antes do método.
2. Todo número é rastreável até uma célula da planilha.
3. Interação serve para provar o raciocínio, não para enfeitar.
4. Leitura crítica é parte do resultado: mostrar o que estava errado e como foi corrigido.
5. Funciona ao vivo sem rede e sem surpresa técnica.

## Accessibility & Inclusion

Leitura a distância em telão (contraste alto, números grandes), navegação completa por teclado, movimento reduzido respeitado.
