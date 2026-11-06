// Motor da indicação de taxa: porta fiel de tools/model.py (mesmas fórmulas da planilha).
// Testado contra src/data/referencia.json por tests/engine.test.mjs.
import caso from './data/caso.json';

const YEARS = caso.years;
const prod = (a) => a.reduce((x, y) => x * y, 1);
const sum = (a) => a.reduce((x, y) => x + y, 0);
const round4 = (x) => Math.round(x * 1e4) / 1e4;

// LOGEST anual: ajuste exponencial trimestral (x = 1..n) elevado a 4
function logestAnnual(y) {
  const n = y.length;
  const xs = y.map((_, i) => i + 1);
  const ly = y.map(Math.log);
  const mx = sum(xs) / n, my = sum(ly) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) { num += (xs[i] - mx) * (ly[i] - my); den += (xs[i] - mx) ** 2; }
  return Math.exp(num / den) ** 4 - 1;
}

// YEARFRAC base 0 (30/360) para datas de dia 1
const yearfrac30 = (d1, d2) => ((d2[0] - d1[0]) * 360 + (d2[1] - d1[1]) * 30 + (d2[2] - d1[2])) / 360;

export const BASE = caso.base;
export const FINAL = caso.final;

export function run(p) {
  const o = {};
  // nível de tarifa (paralelogramo)
  const idx = [1];
  for (const rc of p.rate_changes) idx.push(idx[idx.length - 1] * (1 + rc));
  const cur = idx[idx.length - 1];
  const avgE = caso.earnedW.map((row) => sum(row.map((w, i) => w * idx[i])));
  o.crl = avgE.map((a) => round4(cur / a));
  const crlW = caso.writtenW.map((row) => cur / sum(row.map((w, i) => w * idx[i])));
  o.cumIndex = idx;
  // tendência de prêmio
  const G = caso.WP.map((wp, i) => (wp * crlW[i + 1]) / caso.WEXP[i]);
  o.premFits = {};
  for (const [n, s] of [[20, 3], [16, 7], [12, 11], [8, 15], [6, 17], [4, 19]]) o.premFits[n] = logestAnnual(G.slice(s));
  o.avgPremCrl = G;
  const t = p.prem_trend;
  o.ptf = YEARS.map((y) => round4((1 + t) ** yearfrac30([y, 4, 1], [2017, 7, 1])));
  o.projEP = caso.EP.map((e, i) => e * o.crl[i] * o.ptf[i]);
  // desenvolvimento
  const ata = [0, 1, 2, 3, 4].map((i) => prod(p.ldf_sel.slice(i)));
  o.ataUlt = ata;
  o.ldf = [ata[4], ata[3], ata[2], ata[1], ata[0]].map(round4);
  // tendência de sinistros
  const F = caso.CLM.map((c, i) => c / caso.EEXP[i]);
  const S = caso.PAID.map((pd, i) => pd / caso.CLM[i]);
  const PP = caso.PAID.map((pd, i) => pd / caso.EEXP[i]);
  o.lossFits = {};
  for (const [n, s] of [[20, 0], [16, 4], [12, 8], [8, 12], [6, 14], [4, 16]])
    o.lossFits[n] = [logestAnnual(F.slice(s)), logestAnnual(S.slice(s)), logestAnnual(PP.slice(s))];
  o.freqQ = F; o.sevQ = S; o.ppQ = PP;
  o.ppCur = (1 + p.freq[0]) * (1 + p.sev[0]) - 1;
  o.ppProj = (1 + p.freq[1]) * (1 + p.sev[1]) - 1;
  o.ltf = YEARS.map((y) => round4((1 + o.ppCur) ** (2015 - y) * (1 + o.ppProj) ** p.proj_period));
  // ULAE
  o.ulaeRatios = [...caso.ulaeCW.map((u, i) => u / caso.ulaePaid[i]), sum(caso.ulaeCW) / sum(caso.ulaePaid)];
  const ulf = 1 + p.ulae_sel;
  o.projLoss = caso.REP.map((r, i) => r * o.ldf[i] * o.ltf[i] * ulf);
  o.lrByYear = o.projLoss.map((u, i) => u / o.projEP[i]);
  o.LR = sum(o.projLoss) / sum(o.projEP);
  // despesas
  o.expRatios = {};
  for (const [k, v] of Object.entries(caso.exp)) {
    const a = k === 'gen' && p.gen_exp ? p.gen_exp : v.a;
    o.expRatios[k] = { anos: a.map((x, i) => x / v.b[i]), media: sum(a) / sum(v.b) };
  }
  const fp = caso.fixedPct;
  o.fixed = sum(Object.keys(fp).map((k) => p.exp_sel[k] * fp[k]));
  o.var = sum(Object.keys(fp).map((k) => p.exp_sel[k] * (1 - fp[k])));
  o.vplr = 1 - o.var - p.profit;
  o.ind = (o.LR + o.fixed) / o.vplr - 1;
  // credibilidade
  o.Z = Math.min(Math.sqrt(p.n_claims / p.full_cred), 1);
  const last = p.rate_changes[p.rate_changes.length - 1];
  const resid = (1 + p.latest_indication) / (1 + last) - 1;
  const net = (1 + o.ppProj) / (1 + t) - 1;
  o.tpr = (1 + resid) * (1 + net) - 1;
  o.cw = o.ind * o.Z + o.tpr * (1 - o.Z);
  // prêmio médio por veículo (ano encerrado em 2015T4, projetado até 01/07/2017)
  o.avgPremProj = G[G.length - 1] * (1 + t) ** 2;
  o.avgPremNew = o.avgPremProj * (1 + o.cw);
  // decomposição do prêmio novo
  o.premParts = {
    sinistros: o.avgPremNew * (1 - o.var - p.profit) - o.avgPremProj * o.fixed,
    fixa: o.avgPremProj * o.fixed,
    variavel: o.avgPremNew * o.var,
    lucro: o.avgPremNew * p.profit,
  };
  return o;
}

export const params = (over = {}) => ({ ...structuredClone(FINAL), ...over });
export { caso };
