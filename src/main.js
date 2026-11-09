import '@fontsource/source-serif-4/latin-400.css';
import '@fontsource/source-serif-4/latin-600.css';
import '@fontsource-variable/inter';
import './style.css';
import { run, BASE, FINAL, caso } from './engine.js';
import { pct, num, usd, fac } from './fmt.js';
import { initHero } from './hero.js';
import { waterfall, sensitivity, lossRatios, composition, SEG, ppTxt } from './charts.js';

const clone = (o) => structuredClone(o);
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const near = (a, b) => Math.abs(a - b) < 1e-9;

// ---------- fatores de desenvolvimento a partir do triângulo ----------
const ATA = caso.tri.slice(0, 6).map((row) => row.slice(0, 4).map((v, c) => (row[c + 1] != null ? row[c + 1] / v : null)));
const colVals = (c) => ATA.map((r) => r[c]).filter((v) => v != null);
const avg = (a) => a.reduce((x, y) => x + y, 0) / a.length;
const LDF_METHODS = {
  todos: { label: 'Todos os anos', f: (c) => avg(colVals(c)) },
  tres: { label: '3 anos', f: (c) => avg(colVals(c).slice(-3)) },
  quatro: { label: '4 anos', f: (c) => { const v = colVals(c); return avg(v.length >= 4 ? v.slice(-4) : v); } },
  extremos: { label: 'Sem extremos', f: (c) => { const v = colVals(c); return v.length > 2 ? (v.reduce((a, b) => a + b, 0) - Math.min(...v) - Math.max(...v)) / (v.length - 2) : avg(v); } },
  geo: { label: 'Geométrica', f: (c) => { const v = colVals(c); return v.reduce((a, b) => a * b, 1) ** (1 / v.length); } },
};
const ldfBy = (k) => [0, 1, 2, 3].map(LDF_METHODS[k].f).concat(1);

// ---------- cenários prontos ----------
const base = run(BASE);
const grp = run(FINAL);
function solveSev(target) {
  let a = -0.06, b = 0.08;
  for (let i = 0; i < 60; i++) {
    const mid = (a + b) / 2;
    const v = run({ ...clone(FINAL), sev: [FINAL.sev[0], mid] }).cw;
    if (v > target) b = mid; else a = mid;
  }
  return (a + b) / 2;
}
const genR = grp.expRatios.gen.anos;
const genProj = genR[2] ** 2 / genR[0];
const with_ = (f) => () => { const p = clone(FINAL); f(p); return p; };
const PRESETS = [
  { id: 'grupo', group: 'Cenários', label: 'Grupo · recomendação', p: () => clone(FINAL) },
  { id: 'original', group: 'Cenários', label: 'Planilha original', p: () => clone(BASE) },
  { id: 'sev25', group: 'Perguntas do Guia', label: 'Severidade 2,5%', p: with_((p) => { p.sev[1] = 0.025; }) },
  { id: 'sev15', group: 'Perguntas do Guia', label: 'Severidade 1,5%', p: with_((p) => { p.sev[1] = 0.015; }) },
  { id: 'c500', group: 'Perguntas do Guia', label: '500 sinistros', p: with_((p) => { p.n_claims = 500; }) },
  { id: 'ldf3', group: 'Perguntas do Guia', label: 'LDF: média de 3 anos', p: with_((p) => { p.ldf_sel = ldfBy('tres'); }) },
  { id: 'prem2', group: 'Perguntas do Guia', label: 'Tendência de prêmio 2%', p: with_((p) => { p.prem_trend = 0.02; }) },
  { id: 'data', group: 'Perguntas do Guia', label: 'Erro de data (2,73 anos)', p: with_((p) => { p.proj_period = 2.7333333333; }) },
  { id: 'gen', group: 'Perguntas do Guia', label: 'Despesa geral projetada', p: with_((p) => { p.exp_sel.gen = genProj; }) },
  { id: 'tax1', group: 'Perguntas do Guia', label: 'Impostos sem dobrar', p: with_((p) => { p.exp_sel.tax = BASE.exp_sel.tax; }) },
  { id: 'need', group: 'Teste de estresse', label: 'O que seria preciso para −6,2%', p: with_((p) => { p.sev[1] = solveSev(base.cw); }) },
];

// ---------- controles ----------
const sgn1 = (v) => pct(v, 1, { sign: true });
const sgn2 = (v) => pct(v, 2, { sign: true });
const QLAB = ['abr/2011', 'jul/2012', 'out/2013', 'jul/2014', 'out/2015', 'jan/2016'];
const fitsOf = (o, key) => {
  if (key === 'prem') return Object.entries(o.premFits).map(([n, v]) => ({ n, v }));
  const i = { freq: 0, sev: 1 }[key];
  return Object.entries(o.lossFits).map(([n, v]) => ({ n, v: v[i] }));
};
const GROUPS = [
  { id: 'premio', n: '01', title: 'Prêmio', who: 'P1', hint: 'Reajustes históricos e tendência que levam o prêmio de 2011 a 2015 à tarifa e ao nível de 2017.', controls: [
    ...QLAB.map((q, i) => ({ id: `rc${i}`, label: `Reajuste de ${q}`, min: -0.1, max: 0.15, step: 0.005, fmt: sgn1, get: (p) => p.rate_changes[i], set: (p, v) => { p.rate_changes[i] = v; } })),
    { id: 'prem', label: 'Tendência de prêmio ao ano', min: 0, max: 0.03, step: 0.0005, fmt: sgn2, fits: 'prem', get: (p) => p.prem_trend, set: (p, v) => { p.prem_trend = v; } },
  ] },
  { id: 'dev', n: '02', title: 'Desenvolvimento', who: 'P2', hint: 'Fatores idade a idade selecionados e carregamento de despesas de regulação (ULAE).', ldf: true, controls: [
    ...['15 → 27 meses', '27 → 39 meses', '39 → 51 meses', '51 → 63 meses'].map((lab, i) => ({ id: `ldf${i}`, label: `Fator ${lab}`, min: 0.95, max: 1.15, step: 0.0005, fmt: (v) => fac(v), get: (p) => p.ldf_sel[i], set: (p, v) => { p.ldf_sel[i] = v; } })),
    { id: 'ulae', label: 'ULAE sobre sinistros', min: 0.1, max: 0.18, step: 0.0005, fmt: (v) => pct(v, 2), get: (p) => p.ulae_sel, set: (p, v) => { p.ulae_sel = v; } },
  ] },
  { id: 'tend', n: '03', title: 'Tendência de sinistros', who: 'P3', hint: 'Frequência e severidade: tendência corrente (até 2015) e projetada (até 2017).', period: true, controls: [
    { id: 'freq0', label: 'Frequência corrente', min: -0.04, max: 0.02, step: 0.001, fmt: sgn1, get: (p) => p.freq[0], set: (p, v) => { p.freq[0] = v; } },
    { id: 'freq1', label: 'Frequência projetada', min: -0.04, max: 0.02, step: 0.001, fmt: sgn1, fits: 'freq', get: (p) => p.freq[1], set: (p, v) => { p.freq[1] = v; } },
    { id: 'sev0', label: 'Severidade corrente', min: -0.02, max: 0.05, step: 0.001, fmt: sgn1, get: (p) => p.sev[0], set: (p, v) => { p.sev[0] = v; } },
    { id: 'sev1', label: 'Severidade projetada', min: -0.02, max: 0.05, step: 0.001, fmt: sgn1, fits: 'sev', get: (p) => p.sev[1], set: (p, v) => { p.sev[1] = v; } },
  ] },
  { id: 'desp', n: '04', title: 'Despesas e lucro', who: 'P4', hint: 'Índices selecionados sobre o prêmio. Gerais e outras aquisições são 75% fixas; licenças, 100%.', controls: [
    { id: 'gen', label: 'Despesas gerais', min: 0.04, max: 0.11, step: 0.0005, fmt: (v) => pct(v, 2), get: (p) => p.exp_sel.gen, set: (p, v) => { p.exp_sel.gen = v; } },
    { id: 'acq', label: 'Outras aquisições', min: 0.06, max: 0.11, step: 0.0005, fmt: (v) => pct(v, 2), get: (p) => p.exp_sel.acq, set: (p, v) => { p.exp_sel.acq = v; } },
    { id: 'lic', label: 'Licenças e taxas', min: 0, max: 0.01, step: 0.0001, fmt: (v) => pct(v, 2), get: (p) => p.exp_sel.lic, set: (p, v) => { p.exp_sel.lic = v; } },
    { id: 'com', label: 'Comissões', min: 0.08, max: 0.15, step: 0.0005, fmt: (v) => pct(v, 2), get: (p) => p.exp_sel.com, set: (p, v) => { p.exp_sel.com = v; } },
    { id: 'tax', label: 'Impostos', min: 0.01, max: 0.06, step: 0.0005, fmt: (v) => pct(v, 2), get: (p) => p.exp_sel.tax, set: (p, v) => { p.exp_sel.tax = v; } },
    { id: 'profit', label: 'Margem de lucro alvo', min: 0, max: 0.1, step: 0.0025, fmt: (v) => pct(v, 2), get: (p) => p.profit, set: (p, v) => { p.profit = v; } },
  ] },
  { id: 'cred', n: '05', title: 'Credibilidade', who: 'P5', hint: `Z = √(sinistros ÷ ${num(FINAL.full_cred)}), limitado a 100%. O complemento é a tendência da última indicação.`, controls: [
    { id: 'claims', label: 'Sinistros na experiência', min: 100, max: 4000, step: 1, fmt: (v) => num(v), get: (p) => p.n_claims, set: (p, v) => { p.n_claims = v; } },
    { id: 'latest', label: 'Última indicação (complemento)', min: 0, max: 0.25, step: 0.001, fmt: sgn1, get: (p) => p.latest_indication, set: (p, v) => { p.latest_indication = v; } },
  ] },
];
const CONTROLS = GROUPS.flatMap((g) => g.controls);
const BLOCKS = [
  { id: 'premio', label: 'Prêmio', short: 'Prêm.', note: 'reajustes e tendência de prêmio', keys: ['rate_changes', 'prem_trend'] },
  { id: 'dev', label: 'Desenvolvi-\nmento', short: 'Desenv.', note: 'fatores de desenvolvimento e ULAE', keys: ['ldf_sel', 'ulae_sel'] },
  { id: 'tend', label: 'Tendência', short: 'Tend.', note: 'frequência, severidade e período', keys: ['freq', 'sev', 'proj_period'] },
  { id: 'desp', label: 'Despesas\ne lucro', short: 'Desp.', note: 'índices de despesa e margem de lucro', keys: ['exp_sel', 'profit', 'gen_exp'] },
  { id: 'cred', label: 'Credibi-\nlidade', short: 'Cred.', note: 'credibilidade e complemento', keys: ['n_claims', 'full_cred', 'latest_indication'] },
];

// ---------- estado ----------
let P = clone(FINAL);
let wfFrom = 'original';
try {
  const m = location.hash.match(/^#c=(.+)$/);
  if (m) {
    const q = JSON.parse(decodeURIComponent(atob(m[1])));
    if (q && typeof q === 'object') P = { ...clone(FINAL), ...q };
  }
} catch { P = clone(FINAL); }

// ---------- montar painel ----------
const pos = (c, v) => ((v - c.min) / (c.max - c.min)) * 100;
function ctlHTML(c) {
  const v = c.get(FINAL);
  return `
  <div class="ctl" data-id="${c.id}">
    <div class="ctl-top">
      <label for="in-${c.id}">${c.label}</label>
      <output id="out-${c.id}" for="in-${c.id}"></output>
    </div>
    <div class="ctl-track">
      <input type="range" id="in-${c.id}" min="${c.min}" max="${c.max}" step="${c.step}" aria-describedby="ref-${c.id}">
      <span class="ref-mark" style="left:${pos(c, v)}%" aria-hidden="true"></span>
      ${c.fits ? `<span class="fits" aria-hidden="true"></span>` : ''}
    </div>
    <div class="ctl-foot">
      <span id="ref-${c.id}" class="ref">Grupo: ${c.fmt(v)}</span>
      <button type="button" class="undo" data-undo="${c.id}" hidden>Voltar ao grupo</button>
    </div>
  </div>`;
}
$('#panel').innerHTML = GROUPS.map((g, i) => `
  <details class="grp" id="g-${g.id}" ${i < 1 || matchMedia('(min-width: 1100px)').matches ? 'open' : ''}>
    <summary><span class="grp-n">${g.n}</span><span class="grp-t">${g.title}</span><span class="grp-who">${g.who}</span><span class="grp-dot" hidden aria-label="alterado"></span></summary>
    <p class="grp-hint">${g.hint}</p>
    ${g.ldf ? `<div class="seg-ctl" role="group" aria-label="Método de seleção dos fatores">${Object.entries(LDF_METHODS).map(([k, m]) => `<button type="button" data-ldf="${k}">${m.label}</button>`).join('')}</div>` : ''}
    ${g.period ? `<div class="ctl"><div class="ctl-top"><span class="lab">Período de projeção</span></div><div class="seg-ctl" role="group" aria-label="Período de projeção"><button type="button" data-period="2.25">2,25 anos · correto</button><button type="button" data-period="2.7333333333">2,73 · erro de data</button></div></div>` : ''}
    ${g.controls.map(ctlHTML).join('')}
  </details>`).join('');

$('#presets').innerHTML = ['Cenários', 'Perguntas do Guia', 'Teste de estresse'].map((grpName) => `
  <div class="pre-grp"><span class="pre-lab">${grpName}</span><div class="pre-row">${PRESETS.filter((x) => x.group === grpName).map((x) => `<button type="button" class="chip" data-preset="${x.id}" aria-pressed="false">${x.label}</button>`).join('')}</div></div>`).join('');

// ---------- interação ----------
let raf = 0;
const schedule = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; render(); }); };

for (const c of CONTROLS) {
  const inp = $(`#in-${c.id}`);
  inp.addEventListener('input', () => { c.set(P, Number(inp.value)); schedule(); });
}
$('#panel').addEventListener('click', (e) => {
  const u = e.target.closest('[data-undo]');
  if (u) { const c = CONTROLS.find((x) => x.id === u.dataset.undo); c.set(P, c.get(FINAL)); render(); $(`#in-${c.id}`).focus(); return; }
  const l = e.target.closest('[data-ldf]');
  if (l) { P.ldf_sel = ldfBy(l.dataset.ldf); render(); return; }
  const pe = e.target.closest('[data-period]');
  if (pe) { P.proj_period = Number(pe.dataset.period); render(); }
});
$('#presets').addEventListener('click', (e) => {
  const b = e.target.closest('[data-preset]');
  if (!b) return;
  P = PRESETS.find((x) => x.id === b.dataset.preset).p();
  render();
});
$('#wf-from').addEventListener('click', (e) => {
  const b = e.target.closest('[data-from]');
  if (!b) return;
  wfFrom = b.dataset.from;
  render();
});
$('#reset').addEventListener('click', () => { P = clone(FINAL); render(); });
$('#share').addEventListener('click', async () => {
  const note = $('#share-note');
  try { await navigator.clipboard.writeText(location.href); note.textContent = 'Link do cenário copiado.'; }
  catch { note.textContent = 'Copie o endereço da barra do navegador: ele guarda o cenário.'; }
  clearTimeout(note._t); note._t = setTimeout(() => { note.textContent = ''; }, 3200);
});

// ---------- números com transição curta ----------
const shown = new Map();
function tween(el, to, fmt) {
  const from = shown.get(el) ?? to;
  shown.set(el, to);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || from === to) { el.textContent = fmt(to); return; }
  const t0 = performance.now(), d = 220;
  setTimeout(() => { if (shown.get(el) === to) el.textContent = fmt(to); }, d + 40);
  const step = (t) => {
    const k = Math.min(1, (t - t0) / d), e = 1 - (1 - k) ** 3;
    el.textContent = fmt(from + (to - from) * e);
    if (k < 1 && shown.get(el) === to) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const bandOf = (o, p) => (1.645 / Math.sqrt(p.n_claims)) * (o.LR / o.vplr) * o.Z;

function render() {
  const o = run(P);
  // painel
  for (const c of CONTROLS) {
    const v = c.get(P), inp = $(`#in-${c.id}`);
    if (Number(inp.value) !== v) inp.value = v;
    $(`#out-${c.id}`).textContent = c.fmt(v);
    const changed = !near(v, c.get(FINAL));
    const box = inp.closest('.ctl');
    box.classList.toggle('is-changed', changed);
    $('[data-undo]', box).hidden = !changed;
    inp.style.setProperty('--fill', `${pos(c, Math.min(c.max, Math.max(c.min, v)))}%`);
    if (c.fits) {
      $('.fits', box).innerHTML = fitsOf(o, c.fits).filter((f) => f.v >= c.min && f.v <= c.max)
        .map((f) => `<i style="left:${pos(c, f.v)}%" title="Ajuste de ${f.n} pontos: ${c.fmt(f.v)}"></i>`).join('');
    }
  }
  for (const g of GROUPS) {
    const ch = g.controls.some((c) => !near(c.get(P), c.get(FINAL))) || (g.period && !near(P.proj_period, FINAL.proj_period));
    $(`#g-${g.id} .grp-dot`).hidden = !ch;
  }
  $$('[data-ldf]').forEach((b) => b.setAttribute('aria-pressed', String(ldfBy(b.dataset.ldf).every((v, i) => near(v, P.ldf_sel[i])))));
  $$('[data-period]').forEach((b) => b.setAttribute('aria-pressed', String(near(Number(b.dataset.period), P.proj_period))));
  const act = PRESETS.find((x) => same(x.p(), P));
  $$('[data-preset]').forEach((b) => b.setAttribute('aria-pressed', String(act?.id === b.dataset.preset)));
  $('#scen-name').textContent = act ? act.label : 'Cenário personalizado';
  const isGroup = same(P, FINAL);
  $('#reset').disabled = isGroup;

  // indicadores
  const band = bandOf(o, P);
  tween($('#k-cw'), o.cw, (v) => pct(v, 2, { sign: true }));
  $('#k-cw-d').textContent = isGroup ? `indicação pura ${pct(o.ind, 2)} · credibilidade ${pct(o.Z, 0)}` : `${ppTxt(o.cw - grp.cw)} vs grupo (${pct(grp.cw, 2)})`;
  tween($('#k-p0'), o.avgPremProj, usd);
  tween($('#k-p1'), o.avgPremNew, usd);
  $('#k-p-d').textContent = `prêmio médio de 2015 levado a 2017 · ${usd(o.avgPremNew - o.avgPremProj).replace('US$ −', '−US$ ')} por veículo`;
  const keepM = 1 - o.LR - o.fixed - o.var;
  tween($('#k-m'), keepM, (v) => pct(v, 2));
  $('#k-m-d').textContent = `lucro de ${usd(o.avgPremProj * keepM)} por veículo · alvo ${pct(P.profit, 1)}`;
  $('#k-b').textContent = `±${(band * 100).toFixed(1).replace('.', ',')} p.p.`;
  const inside = Math.abs(o.cw) <= band;
  const v = $('#verdict');
  v.dataset.state = inside ? 'in' : o.cw > 0 ? 'up' : 'down';
  $('#verdict-t').textContent = inside ? '0% está dentro da faixa: manter a tarifa é defensável' : o.cw > 0 ? 'Acima da faixa de erro: o cenário pede aumento' : 'Abaixo da faixa de erro: o cenário permite redução';
  $('#k-b-d').textContent = `faixa da indicação: ${pct(o.cw - band, 1)} a ${pct(o.cw + band, 1)}`;
  $('#d-cw').textContent = pct(o.cw, 2, { sign: true });
  $('#d-p').textContent = `${usd(o.avgPremNew)} por veículo`;
  $('#live').textContent =`Reajuste ${pct(o.cw, 2)}. Prêmio por veículo ${usd(o.avgPremNew)}. ${$('#verdict-t').textContent}.`;

  // gráficos
  const startP = wfFrom === 'original' ? clone(BASE) : clone(FINAL);
  const steps = [{ label: wfFrom === 'original' ? 'Planilha\noriginal' : 'Grupo', short: wfFrom === 'original' ? 'Orig.' : 'Grupo', v: run(startP).cw }];
  const cur = clone(startP);
  for (const b of BLOCKS) { for (const k of b.keys) cur[k] = clone(P[k]); steps.push({ ...b, v: run(cur).cw }); }
  steps.push({ label: 'Cenário', short: 'Cen.', v: o.cw });
  $$('#wf-from [data-from]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.from === wfFrom)));
  waterfall($('#c-wf'), steps);

  const pts = [];
  for (let i = -20; i <= 50; i++) { const x = i / 1000; pts.push({ x, y: run({ ...P, sev: [P.sev[0], x] }).cw }); }
  sensitivity($('#c-sens'), {
    pts, cur: { x: P.sev[1], y: o.cw }, band,
    fits: fitsOf(o, 'sev'),
    onPick: (x) => { P.sev[1] = Math.round(x * 1000) / 1000; render(); },
  });

  const even = o.vplr - o.fixed;
  lossRatios($('#c-lr'), { years: caso.years, lr: o.lrByYear, avg: o.LR, even, prem: o.projEP, loss: o.projLoss });
  $('#lr-table tbody').innerHTML = caso.years.map((y, i) => `<tr><td>${y}</td><td>${num(o.projEP[i])}</td><td>${num(o.projLoss[i])}</td><td>${pct(o.lrByYear[i], 1)}</td></tr>`).join('')
    + `<tr class="tot"><td>Total</td><td>${num(o.projEP.reduce((a, b) => a + b))}</td><td>${num(o.projLoss.reduce((a, b) => a + b))}</td><td>${pct(o.LR, 2)}</td></tr>`;

  const P0 = o.avgPremProj;
  const opt = (label, r, hl) => {
    const prem = P0 * (1 + r);
    const sin = P0 * o.LR, fix = P0 * o.fixed, vv = prem * o.var;
    return { label, prem, sin, fix, var: vv, luc: prem - sin - fix - vv, hl };
  };
  composition($('#c-comp'), [
    opt('Manter a tarifa · 0%', 0, true),
    opt(`Aplicar a indicação · ${pct(o.cw, 2)}`, o.cw),
    opt("Reduzir 6,2% como a planilha original", -0.062),
  ]);

  // estado no endereço
  const hash = isGroup ? '' : '#c=' + btoa(encodeURIComponent(JSON.stringify(P)));
  if (location.hash !== hash && (hash || location.hash.startsWith('#c='))) history.replaceState(null, '', hash || location.pathname + location.search);
}

$('#comp-legend').innerHTML = SEG.map(([k, n]) => `<li><i class="sw seg-${k}"></i>${n}</li>`).join('');
render();
initHero();
let rw = 0;
new ResizeObserver(() => { cancelAnimationFrame(rw); rw = requestAnimationFrame(render); }).observe($('.app'));

// entrada dos cartões: cada gráfico se desenha uma vez quando aparece na tela
const io = new IntersectionObserver((es) => es.forEach((e) => {
  if (!e.isIntersecting) return;
  io.unobserve(e.target);
  e.target.classList.add('is-in');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  $$('.chart', e.target).forEach((c) => { c.classList.add('intro'); setTimeout(() => c.classList.remove('intro'), 2200); });
}), { threshold: 0.2 });
$$('.card, .kpis').forEach((c) => { c.classList.add('reveal'); io.observe(c); });
