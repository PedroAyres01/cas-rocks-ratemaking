# CAS Rocks · Reajuste 2017

Site de apresentação do estudo de caso de tarifação de seguro auto (danos materiais) da Casualty Actuarial Society, disciplina EAC0465 Matemática Atuarial Não Vida I, FEA-USP.

A tarifação é contada como uma rodovia noturna: cada ajuste atuarial é uma saída sinalizada, e o reajuste aparece num painel de LED. O simulador (KM 9) recalcula a indicação ao vivo.

## Como apresentar

- Setas, espaço ou Page Up/Down avançam; cada estação revela seus elementos antes de seguir para o próximo KM.
- `Home` volta ao início, `End` vai ao fim, números `0`–`9` saltam para o KM.
- `F` alterna tela cheia.
- Abaixo de 900 px de largura (ou em retrato), o site vira uma página de rolagem vertical.

## Números

Todo número exibido sai de `src/engine.js`, uma porta em JavaScript de `tools/model.py`, que replica a planilha do caso. `tests/engine.test.mjs` confere o motor contra `src/data/referencia.json` (120 conferências).

```bash
npm install
npm run dev
node tests/engine.test.mjs
npm run build
```

`tools/model.py` lê a planilha original do caso (não versionada) e regenera `src/data/caso.json` e `src/data/referencia.json`.

## Créditos

Estudo de caso "Automobile Insurance" (CAS), de Coleianne, Havens Walch e Priven. Rastros de luz adaptados do componente DataRain (21st.dev).
