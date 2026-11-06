// Conteúdo das estações (KM 0 a 11). Todo número vem do motor (run), nunca digitado.
import { run, BASE, FINAL, caso } from './engine.js';
import { pct, num, usd, fac, pp } from './fmt.js';

export const base = run(BASE);
export const fin = run(FINAL);

const clone = (o) => structuredClone(o);

// Ponte: correções aplicadas em sequência, na ordem do Guia
export function bridgeSteps() {
  const p = clone(BASE);
  const out = [{ label: 'Base do professor', note: 'slide', p: clone(p) }];
  p.gen_exp = FINAL.gen_exp; p.exp_sel.gen = FINAL.exp_sel.gen;
  out.push({ label: 'Despesas gerais', note: '+US$ 10 mi/ano', p: clone(p) });
  p.exp_sel.acq = FINAL.exp_sel.acq;
  out.push({ label: 'Aquisição', note: 'queda até 2017', p: clone(p) });
  p.exp_sel.tax = FINAL.exp_sel.tax;
  out.push({ label: 'Impostos', note: 'alíquota dobra', p: clone(p) });
  p.rate_changes = FINAL.rate_changes; p.prem_trend = FINAL.prem_trend;
  out.push({ label: 'Nível tarifário', note: 'reajustes corrigidos', p: clone(p) });
  p.ldf_sel = FINAL.ldf_sel;
  out.push({ label: 'Desenvolvimento', note: 'fatores do grupo', p: clone(p) });
  p.sev = FINAL.sev;
  out.push({ label: 'Severidade', note: '2,0% projetada', p: clone(p) });
  return out.map((s) => ({ ...s, v: run(s.p).cw }));
}

const DIAMOND = `<svg class="diamond" viewBox="0 0 100 100" aria-hidden="true"><rect x="17" y="17" width="66" height="66" rx="6" transform="rotate(45 50 50)" class="dm-face"/><rect x="21.5" y="21.5" width="57" height="57" rx="4" transform="rotate(45 50 50)" class="dm-line"/><rect x="46" y="28" width="8" height="30" rx="3" class="dm-mark"/><circle cx="50" cy="69" r="5" class="dm-mark"/></svg>`;
const cap = (t) => `<p class="cap"><span>${t}</span></p>`;
const sign = (legend, value, extra = '', cls = '') =>
  `<div class="sign ${cls}"><span class="sign-legend">${legend}</span><strong class="sign-value">${value}</strong>${extra}</div>`;

const ARROW = (x, y, s = 14) => `<path class="b-arr" d="M${x} ${y + s} L${x + s} ${y} M${x + s * 0.3} ${y} H${x + s} V${y + s * 0.7}"/>`;

// ---------- KM 0 ----------
function km0() {
  return `
  <div class="km0">
    <h1 class="sr-only">CAS Rocks Insurance: indicação de taxa para 2017, seguro auto de danos materiais</h1>
    <div class="hero-sign sign sign-xl" data-enter="approach">
      <span class="sign-legend">Reajuste indicado</span>
      <strong class="hero-value" data-num>${pct(fin.cw)}</strong>
      <span class="hero-rule"><span>LR Indication · L24</span></span>
      <span class="hero-sub">Prêmio médio por veículo-ano</span>
      <span class="hero-prem">${usd(fin.avgPremProj)} <i aria-hidden="true">→</i> ${usd(fin.avgPremNew)}</span>
    </div>
    <div class="hero-side" data-enter="approach-late">
      <div class="vms vms-hero"><canvas id="led-hero"></canvas></div>
      ${DIAMOND}
    </div>
    <p class="km0-line">Estudo de caso da Casualty Actuarial Society · Responsabilidade civil de danos materiais, automóvel de passeio · vigência 01/01/2017</p>
  </div>`;
}

// ---------- KM 1 ----------
function km1() {
  const exits = [
    ['1', 'Prêmio', 'Trazer 2011 a 2015 para a tarifa de hoje', 'reajustes de nível de prêmio', 2],
    ['2', 'Sinistros', 'Projetar cada ano até o valor final', 'desenvolvimento de sinistros', 4],
    ['3', 'Tendências', 'Levar o custo até 2017', 'tendências', 5],
    ['4', 'Despesas', 'Separar o que é fixo do que acompanha o prêmio', 'papel das despesas', 6],
    ['5', 'Indicação', 'Juntar tudo numa taxa e num preço', 'fatores que influenciam a tarifa', 7],
  ];
  return `
  <div class="km1">
    <div class="lede">
      <h2>Quanto a CAS Rocks deve cobrar a partir de 01/01/2017?</h2>
      <p>Seguro de responsabilidade civil por danos materiais causados por automóveis de passeio, em um estado americano. Experiência de 2011 a 2015, sinistros avaliados em 31/03/2016. A resposta passa por cinco saídas, uma para cada objetivo do caso.</p>
    </div>
    <ol class="exit-list">
      ${exits.map(([n, t, d, obj, km], i) => `
      <li data-step="${i + 1}">
        <a class="exit-tab" href="#km-${km}" data-go="${km}"><span>Saída ${n}</span><b>${t}</b></a>
        <span class="exit-desc">${d}</span>
        <span class="exit-obj">Objetivo do caso: ${obj}</span>
      </li>`).join('')}
    </ol>
    <p class="formula-preview" data-step="6">Reajuste = (Sinistralidade + Despesa fixa) ÷ (1 − Despesa variável − Lucro) − 1</p>
  </div>`;
}

// ---------- KM 2: paralelogramo ----------
function parallelogram() {
  const X0 = 2010, X1 = 2017.2, W = 1200, H = 320, L = 40, R = 20, T = 84, B = 44;
  const x = (y) => L + ((y - X0) / (X1 - X0)) * (W - L - R);
  const dates = caso.rateDates.map((d) => { const [y, m] = d.split('-').map(Number); return y + (m - 1) / 12; });
  const orig = BASE.rate_changes, cor = FINAL.rate_changes;
  let s = `<svg class="para" viewBox="0 0 ${W} ${H}" role="img" aria-label="Linha do tempo das alterações de tarifa de 2011 a 2016 e a exposição de cada ano">`;
  for (let y = 2011; y <= 2015; y++) {
    s += `<rect class="para-year" x="${x(y)}" y="${T}" width="${x(y + 1) - x(y)}" height="${H - T - B}"/>`;
    s += `<text class="para-yl" x="${(x(y) + x(y + 1)) / 2}" y="${H - 12}">${y}</text>`;
  }
  dates.forEach((d, i) => {
    const changed = orig[i] !== cor[i];
    s += `<line class="para-diag ${changed ? 'is-changed' : ''}" x1="${x(d)}" y1="${H - B}" x2="${x(d + 1)}" y2="${T}"/>`;
    const near = (j) => j >= 0 && j < dates.length && Math.abs(dates[j] - d) < 0.5;
    const anc = near(i + 1) ? 'end' : near(i - 1) ? 'start' : 'middle';
    const lx = x(d) + (anc === 'end' ? -6 : anc === 'start' ? 6 : 0);
    s += `<text class="para-rc ${changed ? 'is-changed' : ''}" text-anchor="${anc}" x="${lx}" y="${T - 44}">${pct(cor[i], 0, { sign: true })}</text>`;
    if (changed) s += `<text class="para-old" text-anchor="${anc}" x="${lx}" y="${T - 12}">era ${pct(orig[i], 0, { sign: true })}</text>`;
  });
  s += `<line class="para-base" x1="${L}" y1="${H - B}" x2="${W - R}" y2="${H - B}"/></svg>`;
  return s;
}
function km2() {
  return `
  <div class="km2">
    <div class="lede">
      <h2>O prêmio antigo foi cobrado com outras tarifas</h2>
      <p>Cada diagonal é uma alteração de tarifa espalhando-se pelas apólices anuais. O paralelogramo mede quanto de cada ano foi ganho em cada nível e traz tudo para a tarifa atual.</p>
    </div>
    <div class="para-wrap" data-step="1">${parallelogram()}</div>
    <div class="crl-row" data-step="2">
      ${caso.years.map((y, i) => sign(String(y), fac(fin.crl[i]), '', 'sign-sm')).join('')}
    </div>
    <div class="note-row" data-step="3">
      <p class="warn"><b>Correção do Guia.</b> O estagiário usou reajustes de outro estado. Três datas mudam (em amarelo) e os fatores sobem: 2011 passa de ${fac(base.crl[0])} para ${fac(fin.crl[0])}.</p>
      ${cap('Current Rate Level − 1 · C9:C14 → Current Rate Level − 2 · K9:K13')}
    </div>
  </div>`;
}

// ---------- KM 3: tendência de prêmio ----------
function premFitsChart() {
  const ns = ['20', '16', '12', '8', '6', '4'];
  const W = 1000, H = 360, step = 13, dot = 5.2, groupW = W / ns.length;
  const y = (k) => H - 60 - k * step;
  let s = `<svg class="ledchart" viewBox="0 0 ${W + 150} ${H}" role="img" aria-label="Ajustes exponenciais da tendência de prêmio, antes e depois da correção">`;
  ns.forEach((n, gi) => {
    const cx = gi * groupW + groupW / 2;
    const vb = Math.round(base.premFits[n] * 1000), vf = Math.round(fin.premFits[n] * 1000);
    for (let k = 0; k < 22; k++) {
      for (const dx of [-33, -20]) s += `<circle class="${k < vb ? 'd-old' : 'd-off'}" cx="${cx + dx}" cy="${y(k)}" r="${dot}"/>`;
      for (const dx of [7, 20, 33]) s += `<circle class="${k < vf ? 'd-on' : 'd-off'}" cx="${cx + dx}" cy="${y(k)}" r="${dot}"/>`;
    }
    s += `<text class="lc-v" x="${cx}" y="${H - 30}">${pct(fin.premFits[n], 2)}</text>`;
    s += `<text class="lc-n" x="${cx}" y="${H - 8}">${n} pontos</text>`;
  });
  const ys = y(0) + step / 2 - FINAL.prem_trend * 1000 * step;
  s += `<line class="lc-sel" x1="0" x2="${W + 10}" y1="${ys}" y2="${ys}"/>`;
  s += `<text class="lc-sel-t" x="${W + 20}" y="${ys - 4}">seleção</text><text class="lc-sel-t" x="${W + 20}" y="${ys + 22}">${pct(FINAL.prem_trend, 2)}</text>`;
  return s + '</svg>';
}
function km3() {
  return `
  <div class="km3 split">
    <div class="lede">
      <h2>O prêmio médio cresce ${pct(FINAL.prem_trend, 2)} ao ano</h2>
      <p>Ajustes exponenciais sobre o prêmio médio já trazido à tarifa atual, de 20 a 4 trimestres. Com os reajustes corrigidos, todos ficam abaixo de 2%; selecionamos a média dos seis.</p>
      <div class="legend"><span class="lg lg-old">antes da correção</span><span class="lg lg-on">corrigido</span></div>
      <div data-step="1">${sign('Tendência selecionada', pct(FINAL.prem_trend, 2), `<span class="sign-sub">antes ${pct(BASE.prem_trend)}</span>`, 'sign-md')}</div>
      ${cap('Premium Trend − 1 · H39')}
    </div>
    <div class="chart-wrap">${premFitsChart()}</div>
    <table class="pf-table">
      <caption class="sr-only">Tendência anual do prêmio médio por ajuste</caption>
      <thead><tr><th scope="col">Ajuste</th><th scope="col">Antes</th><th scope="col">Corrigido</th></tr></thead>
      <tbody>${['20', '16', '12', '8', '6', '4'].map((n) => `<tr><th scope="row">${n} pontos</th><td>${pct(base.premFits[n], 2)}</td><td>${pct(fin.premFits[n], 2)}</td></tr>`).join('')}</tbody>
    </table>
  </div>`;
}

// ---------- KM 4: triângulo ----------
function km4() {
  const ages = ['15–27', '27–39', '39–51', '51–63'];
  const rows = caso.tri.slice(0, 6).map((r, i) => ({
    ay: 2009 + i,
    f: [0, 1, 2, 3].map((j) => (r[j + 1] != null && r[j] != null ? r[j + 1] / r[j] : null)),
  }));
  const cell = (v, j) => (v == null ? '<td class="t-empty"></td>' : `<td class="${v < 1 ? 't-down' : ''} ${j === 3 ? 't-last' : ''}">${fac(v, 3)}</td>`);
  return `
  <div class="km4 split">
    <div class="lede">
      <h2>Sinistros abertos ainda crescem até se encerrar</h2>
      <p>Fatores idade a idade dos sinistros incorridos mais ALAE, por ano de ocorrência. A linha selecionada projeta cada ano até o valor final.</p>
      <p class="warn" data-step="2"><b>Fator menor que 1 entre 51 e 63 meses.</b> Os valores caíram: reservas abertas maiores que o necessário, salvados e ressarcimentos, sinistros encerrados sem pagamento.</p>
      <div class="ulae-row" data-step="3">${sign('ULAE', pct(FINAL.ulae_sel), `<span class="sign-sub">despesa de regulação não alocada sobre sinistros + ALAE pagos</span>`, 'sign-md')}</div>
    </div>
    <div class="tri-wrap">
      <table class="tri">
        <caption class="sr-only">Fatores idade a idade, anos de ocorrência 2009 a 2014</caption>
        <thead><tr><th scope="col">Ano</th>${ages.map((a) => `<th scope="col">${a}</th>`).join('')}</tr></thead>
        <tbody>${rows.map((r) => `<tr><th scope="row">${r.ay}</th>${r.f.map(cell).join('')}</tr>`).join('')}</tbody>
        <tfoot>
          <tr class="t-sel" data-step="1"><th scope="row">Seleção</th>${FINAL.ldf_sel.slice(0, 4).map((v, j) => `<td class="${v < 1 ? 't-down' : ''}">${fac(v)}</td>`).join('')}</tr>
          <tr class="t-ult" data-step="1"><th scope="row">Até o final</th>${fin.ataUlt.slice(0, 4).map((v) => `<td>${fac(v)}</td>`).join('')}</tr>
        </tfoot>
      </table>
      ${cap('Loss Development · D32:H32 · ULAE · D15')}
    </div>
  </div>`;
}

// ---------- KM 5: frequência × severidade ----------
function series(vals, { w = 560, h = 260, fmtY, label, hot = 6 }) {
  const min = Math.min(...vals), max = Math.max(...vals), pad = (max - min) * 0.18;
  const X = (i) => 30 + (i / (vals.length - 1)) * (w - 60);
  const Y = (v) => h - 70 - ((v - (min - pad)) / (max - min + 2 * pad)) * (h - 120);
  const pts = vals.map((v, i) => `${X(i)},${Y(v)}`).join(' ');
  let s = `<svg class="series" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}"><polyline class="s-line" points="${pts}"/>`;
  vals.forEach((v, i) => { s += `<circle class="${i >= vals.length - hot ? 's-hot' : 's-dot'}" cx="${X(i)}" cy="${Y(v)}" r="5"/>`; });
  const below = vals[1] < vals[0];
  s += `<text class="s-y" x="30" y="${below ? Y(vals[0]) - 14 : Y(vals[0]) + 30}">${fmtY(vals[0])}</text>`;
  s += `<text class="s-y s-end" x="${X(vals.length - 1)}" y="${Y(vals.at(-1)) - 14}">${fmtY(vals.at(-1))}</text>`;
  s += `<text class="s-x" x="30" y="${h - 6}">2011 T1</text><text class="s-x s-end" x="${w - 30}" y="${h - 6}">2015 T4</text></svg>`;
  return s;
}
function km5() {
  const f = fin.lossFits;
  const rowsFit = ['20', '12', '6', '4'];
  return `
  <div class="km5">
    <div class="lede">
      <h2>Menos acidentes, sinistros mais caros</h2>
      <p>A frequência cai cerca de 1% ao ano. A severidade, quase parada no longo prazo, acelera nos trimestres recentes (em âmbar). Projetamos ${pct(FINAL.sev[1])}: entre os ajustes longos e os curtos.</p>
    </div>
    <div class="fs-grid">
      <figure><figcaption>Frequência <small>sinistros por exposição</small></figcaption>${series(fin.freqQ, { fmtY: (v) => num(v * 100, 2) + '%', label: 'Frequência trimestral 2011 a 2015' })}</figure>
      <figure><figcaption>Severidade <small>US$ por sinistro</small></figcaption>${series(fin.sevQ, { fmtY: (v) => usd(v).replace(',00', ''), label: 'Severidade trimestral 2011 a 2015' })}</figure>
      <table class="fits" data-step="1">
        <caption class="sr-only">Ajustes exponenciais anuais</caption>
        <thead><tr><th scope="col">Ajuste</th><th scope="col">Frequência</th><th scope="col">Severidade</th></tr></thead>
        <tbody>${rowsFit.map((n) => `<tr><th scope="row">${n} pontos</th><td>${pct(f[n][0], 1, { sign: true })}</td><td class="${Number(n) <= 6 ? 'hot' : ''}">${pct(f[n][1], 1, { sign: true })}</td></tr>`).join('')}</tbody>
        <tfoot><tr><th scope="row">Seleção projetada</th><td>${pct(FINAL.freq[1], 1, { sign: true })}</td><td class="hot">${pct(FINAL.sev[1], 1, { sign: true })}</td></tr></tfoot>
      </table>
    </div>
    <p class="period" data-step="2">Período projetado: de 01/07/2015 até 01/10/2017, meio da vigência das novas apólices = <b>${num(FINAL.proj_period, 2)} anos</b>. ${cap('Loss Trend − 1 · F39:G40 · Loss Trend − 5 · F14')}</p>
  </div>`;
}

// ---------- KM 6: despesas ----------
function km6() {
  const rows = [
    ['gen', 'Gerais', 'Dado subestimado em US$ 10 milhões por ano', 'I12'],
    ['acq', 'Outras aquisições', 'Em queda contínua até 2017', 'I20'],
    ['lic', 'Licenças e taxas', '', 'I28'],
    ['com', 'Comissões', '', 'I36'],
    ['tax', 'Impostos', 'Alíquota estadual vai dobrar', 'I44'],
  ];
  const fp = caso.fixedPct;
  return `
  <div class="km6 split">
    <div class="lede">
      <h2>Despesas levam ${pct(fin.fixed + fin.var, 0)} do prêmio</h2>
      <p>Despesas fixas (por apólice) entram somadas à sinistralidade; as variáveis (proporcionais ao prêmio) reduzem o que sobra para pagar sinistros. Três correções do Guia mudam as seleções.</p>
      <div class="fv" data-step="2">
        ${sign('Despesa fixa', pct(fin.fixed), `<span class="sign-sub">antes ${pct(base.fixed)}</span>`, 'sign-md')}
        ${sign('Despesa variável', pct(fin.var), `<span class="sign-sub">antes ${pct(base.var)}</span>`, 'sign-md')}
      </div>
      ${cap('Expense · I50, I51')}
    </div>
    <ul class="exp-list">
      ${rows.map(([k, t, why, cell], i) => {
        const a = BASE.exp_sel[k], b = FINAL.exp_sel[k], ch = a !== b;
        return `<li class="${ch ? 'is-changed' : ''}" ${ch ? `data-step="1"` : ''}>
          <span class="exp-name">${t}<small>${fp[k] === 1 ? '100% fixa' : fp[k] === 0 ? '100% variável' : num(fp[k] * 100) + '% fixa'} · ${cell}</small></span>
          <span class="exp-why">${why}</span>
          <span class="exp-val">${ch ? `<s>${pct(a, 1)}</s>` : ''}<b>${pct(b, k === 'acq' ? 2 : 1)}</b></span>
        </li>`;
      }).join('')}
    </ul>
  </div>`;
}

// ---------- KM 7: indicação ----------
function km7() {
  const p500 = run({ ...clone(FINAL), n_claims: 500 });
  return `
  <div class="km7">
    <div class="lede">
      <h2>A conta que fecha a taxa</h2>
    </div>
    <div class="eq" aria-label="Reajuste igual a sinistralidade mais despesa fixa, dividido por um menos despesa variável menos lucro, menos um">
      <div class="eq-term" data-step="1"><span class="eq-l">Sinistralidade</span><b>${pct(fin.LR)}</b></div>
      <span class="eq-op" data-step="1">+</span>
      <div class="eq-term" data-step="1"><span class="eq-l">Despesa fixa</span><b>${pct(fin.fixed)}</b></div>
      <span class="eq-div" data-step="2">÷</span>
      <div class="eq-term" data-step="2"><span class="eq-l">1 − variável − lucro</span><b>${pct(fin.vplr)}</b></div>
      <span class="eq-op" data-step="3">− 1 =</span>
      <div class="eq-term eq-res" data-step="3"><span class="eq-l">Reajuste indicado</span><b>${pct(fin.ind)}</b></div>
    </div>
    <div class="cred" data-step="4">
      ${sign('Credibilidade', pct(fin.Z, 0), `<span class="sign-sub">${num(FINAL.n_claims)} sinistros ≥ ${num(FINAL.full_cred)} para credibilidade total</span>`, 'sign-md')}
      <p>Com credibilidade total, a indicação é a própria experiência da carteira. <b>Teste do Guia:</b> com 500 sinistros, Z cai para ${pct(p500.Z, 0)} e o resultado vai a ${pct(p500.cw, 1, { sign: true })}: sobe, porque o complemento (a última indicação levada a 2017) é ${pct(fin.tpr, 1, { sign: true })}. Menos credibilidade aproxima do complemento, não de zero.</p>
      ${cap('LR Indication · L21 · Credibility · C8 · L24')}
    </div>
  </div>`;
}

// ---------- KM 8: ponte ----------
function bridgeSvg(steps) {
  const W = 1300, H = 520, L = 30, R = 230, top = 175, bot = 480;
  const vmin = -0.07, vmax = 0;
  const Y = (v) => bot - ((v - vmin) / (vmax - vmin)) * (bot - top);
  const seg = (W - L - R) / steps.length;
  let road = `M ${L} ${Y(steps[0].v)}`;
  let signs = '';
  steps.forEach((s, i) => {
    const x0 = L + i * seg, x1 = x0 + seg, y = Y(s.v);
    if (i) road += ` L ${x0} ${y}`;
    road += ` L ${x1} ${y}`;
    const sw = seg - 8, sx = x0 + seg * 0.5 - sw / 2, cxs = sx + sw / 2;
    const words = s.label.toUpperCase().replace('DESENVOLVIMENTO', 'DESENVOLV.').split(' ');
    const lines = words.length > 2 ? [words.slice(0, 2).join(' '), words.slice(2).join(' ')] : words.length === 2 && s.label.length > 10 ? words : [words.join(' ')];
    const ly = lines.length === 2 ? [y - 136, y - 116] : [y - 124];
    signs += `<g class="b-sign" data-bstep="${i}" ${i ? `data-step="${i}"` : ''}>
      <line class="b-post" x1="${cxs}" x2="${cxs}" y1="${y - 56}" y2="${y - 6}"/>
      <rect x="${sx}" y="${y - 160}" width="${sw}" height="104" rx="10"/>
      <rect class="b-inner" x="${sx + 4}" y="${y - 156}" width="${sw - 8}" height="96" rx="7"/>
      ${ARROW(sx + sw - 24, y - 150, 11)}
      <text class="b-l" x="${cxs}">${lines.map((t, k) => `<tspan x="${cxs}" y="${ly[k]}">${t}</tspan>`).join('')}</text>
      <text class="b-v" x="${cxs}" y="${y - 74}">${pct(s.v)}</text>
    </g>`;
  });
  const end = L + steps.length * seg;
  road += ` L ${W - 20} ${Y(steps.at(-1).v)}`;
  return `<svg class="bridge" viewBox="0 0 ${W} ${H}" role="img" aria-label="Ponte do reajuste de ${pct(steps[0].v)} até ${pct(steps.at(-1).v)}">
    <path class="b-road-edge" d="${road}"/>
    <path class="b-road" d="${road}"/>
    <path class="b-lane" d="${road}"/>
    ${signs}
    <g class="b-gantry"><line x1="${end + 170}" x2="${end + 170}" y1="${Y(steps.at(-1).v) - 8}" y2="90"/></g>
  </svg>`;
}
function km8() {
  const steps = bridgeSteps();
  return `
  <div class="km8">
    <div class="lede">
      <h2>Do ${pct(steps[0].v)} ao ${pct(steps.at(-1).v)}</h2>
      <p>Cada correção do Guia é uma saída na estrada. A base reproduz exatamente o slide do professor.</p>
    </div>
    <div class="bridge-wrap">${bridgeSvg(steps)}<div class="vms vms-bridge"><canvas id="led-bridge"></canvas></div></div>
    <ol class="bridge-list">${steps.map((s, i) => `<li class="${i === steps.length - 1 ? 'is-last' : ''}"><span>${s.label}</span><b>${pct(s.v)}</b><small>${s.note}</small></li>`).join('')}</ol>
  </div>`;
}

// ---------- KM 9: simulador ----------
export const SIM_CONTROLS = [
  { id: 'sev', label: 'Severidade projetada', min: -0.01, max: 0.05, step: 0.001, get: (p) => p.sev[1], set: (p, v) => { p.sev = [p.sev[0], v]; }, fmt: (v) => pct(v, 1, { sign: true }), cell: 'Loss Trend − 1 · G40' },
  { id: 'freq', label: 'Frequência projetada', min: -0.04, max: 0.02, step: 0.001, get: (p) => p.freq[1], set: (p, v) => { p.freq = [p.freq[0], v]; }, fmt: (v) => pct(v, 1, { sign: true }), cell: 'Loss Trend − 1 · F40' },
  { id: 'prem', label: 'Tendência de prêmio', min: 0, max: 0.03, step: 0.0005, get: (p) => p.prem_trend, set: (p, v) => { p.prem_trend = v; }, fmt: (v) => pct(v, 2, { sign: true }), cell: 'Premium Trend − 1 · H39' },
  { id: 'tax', label: 'Impostos', min: 0.01, max: 0.06, step: 0.001, get: (p) => p.exp_sel.tax, set: (p, v) => { p.exp_sel.tax = v; }, fmt: (v) => pct(v, 1), cell: 'Expense · I44' },
  { id: 'profit', label: 'Margem de lucro', min: 0, max: 0.1, step: 0.0025, get: (p) => p.profit, set: (p, v) => { p.profit = v; }, fmt: (v) => pct(v, 1), cell: 'LR Indication · L19' },
  { id: 'claims', label: 'Sinistros na experiência', min: 100, max: 4000, step: 1, get: (p) => p.n_claims, set: (p, v) => { p.n_claims = v; }, fmt: (v) => num(v), cell: 'Credibility · C6' },
];
export const SIM_PRESETS = [
  { id: 'final', label: 'Nossa recomendação', p: () => clone(FINAL) },
  { id: 'base', label: 'Base do professor', p: () => clone(BASE) },
  { id: 'sev25', label: 'Pergunta do Guia: severidade 2,5%', p: () => ({ ...clone(FINAL), sev: [FINAL.sev[0], 0.025] }) },
  { id: 'c500', label: 'Pergunta do Guia: 500 sinistros', p: () => ({ ...clone(FINAL), n_claims: 500 }) },
];
function km9() {
  return `
  <div class="km9 sim">
    <h2 class="sr-only">Simulador: mude uma premissa e veja o reajuste</h2>
    <div class="gantry">
      <div class="gantry-beam" aria-hidden="true"></div>
      <div class="sign sign-md" id="o-lr"><span class="sign-legend">Sinistralidade</span><strong class="sign-value">${pct(fin.LR)}</strong><span class="sign-cap">LR Indication · L14</span></div>
      <div class="sign sign-md" id="o-fix"><span class="sign-legend">Despesa fixa</span><strong class="sign-value">${pct(fin.fixed)}</strong><span class="sign-cap">Expense · I50</span></div>
      <div class="sign sign-md" id="o-var"><span class="sign-legend">Despesa variável</span><strong class="sign-value">${pct(fin.var)}</strong><span class="sign-cap">Expense · I51</span></div>
      <div class="sign sign-md" id="o-z"><span class="sign-legend">Credibilidade</span><strong class="sign-value">${pct(fin.Z, 0)}</strong><span class="sign-cap">Credibility · C8</span></div>
    </div>
    <div class="vms vms-sim"><canvas id="led-sim"></canvas></div>
    <p class="sr-only" id="o-prem" aria-live="polite">Reajuste ${pct(fin.cw)}; prêmio médio por veículo de ${usd(fin.avgPremProj)} para ${usd(fin.avgPremNew)}</p>
    <div class="sim-controls">
      ${SIM_CONTROLS.map((c) => `
      <label class="post" for="c-${c.id}">
        <span class="post-label">${c.label}</span>
        <output id="v-${c.id}" for="c-${c.id}">${c.fmt(c.get(FINAL))}</output>
        <input type="range" id="c-${c.id}" data-ctl="${c.id}" min="${c.min}" max="${c.max}" step="${c.step}" value="${c.get(FINAL)}">
        <span class="post-cap">${c.cell}</span>
      </label>`).join('')}
    </div>
    <div class="presets" role="group" aria-label="Cenários prontos">
      ${SIM_PRESETS.map((s, i) => `<button type="button" class="preset ${i === 0 ? 'is-on' : ''}" data-preset="${s.id}">${s.label}</button>`).join('')}
      <p class="sim-prem" aria-hidden="true">Prêmio por veículo-ano <b id="o-prem-v">${usd(fin.avgPremProj)} → ${usd(fin.avgPremNew)}</b></p>
    </div>
  </div>`;
}

// ---------- KM 10: prêmio por veículo ----------
function km10() {
  const parts = [
    ['sinistros', 'Sinistros e despesas de regulação', fin.premParts.sinistros],
    ['fixa', 'Despesa fixa', fin.premParts.fixa],
    ['variavel', 'Despesa variável', fin.premParts.variavel],
    ['lucro', 'Lucro', fin.premParts.lucro],
  ];
  const tot = fin.avgPremNew;
  return `
  <div class="km10">
    <div class="lede">
      <h2>${usd(fin.avgPremProj)} hoje, ${usd(fin.avgPremNew)} em 2017</h2>
      <p>O prêmio médio de 2015 à tarifa atual, levado até 2017 pela tendência de ${pct(FINAL.prem_trend, 2)} ao ano, recebe o reajuste de ${pct(fin.cw)}. Para onde vai cada dólar:</p>
    </div>
    <div class="stack">
      <div class="stack-bar" aria-hidden="true">${parts.map(([k, , v], i) => `<span class="seg seg-${k}" data-step="${i + 1}" style="flex-basis:${(v / tot) * 100}%"></span>`).join('')}</div>
      <ul class="stack-legend">${parts.map(([k, t, v], i) => `<li class="leg-${k}" data-step="${i + 1}"><b>${usd(v)}</b><span>${t}</span><i>${pct(v / tot, 0)} do prêmio</i></li>`).join('')}</ul>
    </div>
    <p class="assume">Premissa: a exposição é contada em veículo-ano, a unidade usual do seguro auto. O caso não define a unidade explicitamente; a confirmar com o professor antes de tratar este valor como preço.</p>
  </div>`;
}

// ---------- KM 11: fechamento ----------
function km12() {
  const lo = run({ ...clone(FINAL), sev: [FINAL.sev[0], 0.015] }).cw;
  const hi = run({ ...clone(FINAL), sev: [FINAL.sev[0], 0.025] }).cw;
  return `
  <div class="km12">
    <div class="close-sign sign sign-xl">
      <span class="sign-legend">Recomendação</span>
      <strong class="hero-value">${pct(fin.cw)}</strong>
      <span class="hero-sub">Reduzir a tarifa em ${pct(-fin.cw).replace('%', '')}% a partir de 01/01/2017</span>
      <span class="range"><span style="--a:${((lo + 0.03) / 0.06) * 100}%;--b:${((hi + 0.03) / 0.06) * 100}%;--m:${((fin.cw + 0.03) / 0.06) * 100}%"></span></span>
      <span class="range-l">Faixa de robustez com severidade de 1,5% a 2,5%: ${pct(lo)} a ${pct(hi, 1, { sign: true })}</span>
    </div>
      <p class="sources">Fontes: estudo de caso “Automobile Insurance” da Casualty Actuarial Society (Coleianne, Havens Walch e Priven); planilha e Guia da disciplina EAC0465 Matemática Atuarial Não Vida I, FEA-USP, Prof. João Vinícius de França Carvalho. Todos os números saem do modelo do grupo, conferido célula a célula com a planilha.</p>
  </div>`;
}

export const STATIONS = [
  { km: 0, exit: 0, title: 'Início', html: km0 },
  { km: 1, exit: 0, title: 'A rota', html: km1 },
  { km: 2, exit: 1, title: 'Nível tarifário', html: km2 },
  { km: 3, exit: 1, title: 'Tendência de prêmio', html: km3 },
  { km: 4, exit: 2, title: 'Desenvolvimento', html: km4 },
  { km: 5, exit: 3, title: 'Frequência e severidade', html: km5 },
  { km: 6, exit: 4, title: 'Despesas', html: km6 },
  { km: 7, exit: 5, title: 'Indicação', html: km7 },
  { km: 8, exit: 5, title: 'Ponte', html: km8 },
  { km: 9, exit: 5, title: 'Simulador', html: km9 },
  { km: 10, exit: 5, title: 'Prêmio por veículo', html: km10 },
  { km: 11, exit: 0, title: 'Recomendação', html: km12 },
];
export { pp };
