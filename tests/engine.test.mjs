// node tests/engine.test.mjs — compara o motor JS com as saídas do modelo Python
import { readFileSync } from 'node:fs';
const caso = JSON.parse(readFileSync(new URL('../src/data/caso.json', import.meta.url)));
const ref = JSON.parse(readFileSync(new URL('../src/data/referencia.json', import.meta.url)));
const src = readFileSync(new URL('../src/engine.js', import.meta.url), 'utf8')
  .replace("import caso from './data/caso.json';", 'const caso = globalThis.__caso;');
globalThis.__caso = caso;
const { run, BASE, FINAL } = await import('data:text/javascript,' + encodeURIComponent(src));
let ok = 0, fail = 0;
const chk = (nome, a, b, tol = 1e-9) => { if (Math.abs(a - b) > tol) { fail++; console.log('FALHOU', nome, a, b); } else ok++; };
for (const [k, p] of [['base', BASE], ['final', FINAL]]) {
  const o = run(p), r = ref[k];
  for (const f of ['crl', 'ptf', 'ldf', 'ltf', 'lr_by_year']) {
    const js = { crl: o.crl, ptf: o.ptf, ldf: o.ldf, ltf: o.ltf, lr_by_year: o.lrByYear }[f];
    js.forEach((v, i) => chk(`${k}.${f}[${i}]`, v, r[f][i]));
  }
  for (const [a, b] of [['LR', 'LR'], ['fixed', 'fixed'], ['var', 'var'], ['ind', 'ind'], ['Z', 'Z'], ['tpr', 'tpr'], ['cw', 'cw'], ['avgPremProj', 'avg_prem_proj'], ['avgPremNew', 'avg_prem_new'], ['ppProj', 'pp_proj']])
    chk(`${k}.${a}`, o[a], r[b]);
  for (const n of ['20', '16', '12', '8', '6', '4']) {
    chk(`${k}.premFits${n}`, o.premFits[n], r.prem_fits[n], 1e-9);
    o.lossFits[n].forEach((v, i) => chk(`${k}.lossFits${n}.${i}`, v, r.loss_fits[n][i], 1e-9));
  }
  const parts = Object.values(o.premParts).reduce((x, y) => x + y, 0);
  chk(`${k}.premParts soma`, parts, o.avgPremNew, 1e-9);
}
console.log(`${ok} conferências OK, ${fail} falhas`);
process.exit(fail ? 1 : 0);
