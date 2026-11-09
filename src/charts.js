// Gráficos em SVG desenhados à mão, no tamanho real do contêiner (o texto não escala).
// Todos os rótulos vêm do próprio código (dados internos), nunca de entrada externa.
import { pct, usd, num } from './fmt.js';

const tip = document.createElement('div');
tip.className = 'tip';
tip.setAttribute('aria-hidden', 'true');
tip.hidden = true;
document.body.append(tip);

export function showTip(x, y, html) {
  tip.innerHTML = html;
  tip.hidden = false;
  const r = tip.getBoundingClientRect();
  const left = Math.min(Math.max(8, x + 14), innerWidth - r.width - 8);
  const top = y - r.height - 14 < 8 ? y + 18 : y - r.height - 14;
  tip.style.transform = `translate(${left}px, ${top}px)`;
}
export const hideTip = () => { tip.hidden = true; };

const ppTxt = (d) => {
  const v = d * 100;
  if (Math.abs(v) < 0.005) return '0 p.p.';
  const dec = Math.abs(v) < 0.095 ? 2 : 1;
  return (v < -0.0005 ? '−' : '+') + Math.abs(v).toFixed(dec).replace('.', ',') + ' p.p.';
};
export { ppTxt };

function niceStep(span, target) {
  const raw = span / target;
  const p = 10 ** Math.floor(Math.log10(raw));
  return [1, 2, 2.5, 5, 10].map((k) => k * p).find((s) => s >= raw);
}

const plain = (h) => h.replace(/<span class="muted">clique para aplicar<\/span>/, '').replace(/<[^>]+>/g, '. ').replace(/(\.\s*)+/g, '. ').replace(/^\. |\. $/g, '');
function bindHover(root, sel, html) {
  const els = [...root.querySelectorAll(sel)];
  // uma parada de Tab por gráfico; setas, Home e End andam entre os elementos
  els.forEach((el, i) => {
    el.setAttribute('tabindex', i ? '-1' : '0');
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label', plain(html(el)));
    el.addEventListener('keydown', (e) => {
      const k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      let j = k ? i + k : e.key === 'Home' ? 0 : e.key === 'End' ? els.length - 1 : null;
      if (j === null) return;
      e.preventDefault();
      j = (j + els.length) % els.length;
      el.setAttribute('tabindex', '-1');
      els[j].setAttribute('tabindex', '0');
      els[j].focus();
    });
  });
  els.forEach((el) => {
    const show = (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX ?? r.left + r.width / 2;
      const y = e.clientY ?? r.top;
      showTip(x, y, html(el));
      el.classList.add('is-hot');
    };
    el.addEventListener('pointermove', show);
    el.addEventListener('focus', show);
    el.addEventListener('pointerleave', () => { hideTip(); el.classList.remove('is-hot'); });
    el.addEventListener('blur', () => { hideTip(); el.classList.remove('is-hot'); });
  });
}

// ---------- 1. Ponte (cascata) ----------
export function waterfall(el, steps) {
  const w = el.clientWidth;
  const narrow = w < 640;
  const h = narrow ? 280 : 320;
  const m = { t: 34, r: 4, b: narrow ? 44 : 52, l: 4 };
  const iw = w - m.l - m.r, ih = h - m.t - m.b;
  const bars = [];
  let acc = steps[0].v;
  bars.push({ ...steps[0], y0: 0, y1: acc, kind: 'total' });
  for (let i = 1; i < steps.length - 1; i++) {
    const d = steps[i].v - acc;
    bars.push({ ...steps[i], d, y0: acc, y1: acc + d, kind: d >= 0 ? 'up' : 'down' });
    acc += d;
  }
  const last = steps.at(-1);
  bars.push({ ...last, y0: 0, y1: last.v, kind: 'total end' });
  const vals = bars.flatMap((b) => [b.y0, b.y1]);
  let lo = Math.min(0, ...vals), hi = Math.max(0, ...vals);
  const pad = Math.max((hi - lo) * 0.12, 0.004);
  lo -= pad; hi += pad;
  const y = (v) => m.t + ((hi - v) / (hi - lo)) * ih;
  const band = iw / bars.length;
  const bw = Math.min(72, band * 0.58);
  let s = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="group" aria-label="Ponte do reajuste: ${bars.map((b) => `${b.label} ${b.kind.startsWith('total') ? pct(b.y1, 2) : ppTxt(b.d)}`).join('; ')}">`;
  s += `<line class="axis-zero" x1="${m.l}" x2="${w - m.r}" y1="${y(0)}" y2="${y(0)}"/>`;
  bars.forEach((b, i) => {
    const cx = m.l + band * i + band / 2;
    const top = Math.min(y(b.y0), y(b.y1));
    const hh = Math.max(2, Math.abs(y(b.y0) - y(b.y1)));
    if (i < bars.length - 1) {
      const nx = m.l + band * (i + 1) + band / 2 - bw / 2;
      s += `<line class="wf-link" x1="${cx + bw / 2}" x2="${nx}" y1="${y(b.y1)}" y2="${y(b.y1)}"/>`;
    }
    const txt = b.kind.startsWith("total") ? pct(b.y1, 2) : narrow ? (Math.abs(b.d) < 0.0005 ? "0" : ppTxt(b.d).replace(" p.p.", "")) : ppTxt(b.d);
    const above = b.kind.startsWith('total') ? b.y1 >= 0 : b.d >= 0;
    const ty = above ? top - 8 : top + hh + 18;
    s += `<g class="wf-bar ${b.kind} ${(b.kind.startsWith("total") ? b.y1 < 0 : b.d < 0) ? "neg" : ""}" tabindex="0" data-i="${i}" style="--i:${i}">
      <rect class="hit" x="${cx - band / 2}" y="${m.t}" width="${band}" height="${ih}"/>
      <rect class="mark" x="${cx - bw / 2}" y="${top}" width="${bw}" height="${hh}" rx="2"/>
      <text class="val${narrow ? " sm" : ""}" x="${cx}" y="${ty}" text-anchor="middle">${txt}</text>
    </g>`;
    const lab = narrow ? b.short : b.label;
    const lines = lab.split('\n');
    lines.forEach((ln, k) => {
      s += `<text class="xlab ${b.kind.startsWith('total') ? 'strong' : ''}" x="${cx}" y="${h - m.b + 20 + k * 16}" text-anchor="middle">${ln}</text>`;
    });
  });
  s += '</svg>';
  el.innerHTML = s;
  bindHover(el, '.wf-bar', (g) => {
    const b = bars[g.dataset.i];
    if (b.kind.startsWith('total')) return `<b>${pct(b.y1, 2)}</b><span>${b.label.replace('\n', ' ')}</span>`;
    return `<b>${ppTxt(b.d)}</b><span>${b.label.replace('\n', ' ')}: ${b.note}</span><span class="muted">acumulado ${pct(b.y1, 2)}</span>`;
  });
}

// ---------- 2. Sensibilidade à severidade projetada ----------
export function sensitivity(el, { pts, cur, band, fits, onPick }) {
  const w = el.clientWidth;
  const h = w < 520 ? 260 : 300;
  const m = { t: 18, r: 14, b: 58, l: 50 };
  const iw = w - m.l - m.r, ih = h - m.t - m.b;
  const x0 = pts[0].x, x1 = pts.at(-1).x;
  const ys = pts.map((p) => p.y);
  let lo = Math.min(...ys, -band, cur.y), hi = Math.max(...ys, band, cur.y);
  const pad = (hi - lo) * 0.08; lo -= pad; hi += pad;
  const X = (v) => m.l + ((v - x0) / (x1 - x0)) * iw;
  const Y = (v) => m.t + ((hi - v) / (hi - lo)) * ih;
  const st = niceStep(hi - lo, 5);
  let s = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="group" aria-label="Reajuste conforme a severidade projetada; cenário atual ${pct(cur.x, 1)} gera ${pct(cur.y, 2)}">`;
  for (let v = Math.ceil(lo / st) * st; v <= hi; v += st) {
    s += `<line class="grid" x1="${m.l}" x2="${w - m.r}" y1="${Y(v)}" y2="${Y(v)}"/><text class="ylab" x="${m.l - 8}" y="${Y(v) + 4}" text-anchor="end">${pct(v, 0, { sign: true })}</text>`;
  }
  s += `<rect class="band" x="${m.l}" y="${Y(band)}" width="${iw}" height="${Y(-band) - Y(band)}"/>`;
  s += `<text class="band-lab" x="${m.l + 8}" y="${Y(band) + 15}">0% ± erro estatístico (90%)</text>`;
  s += `<line class="axis-zero" x1="${m.l}" x2="${w - m.r}" y1="${Y(0)}" y2="${Y(0)}"/>`;
  for (let v = Math.ceil(x0 * 100) / 100; v <= x1 + 1e-9; v += 0.01) {
    s += `<text class="xlab" x="${X(v)}" y="${h - m.b + 18}" text-anchor="middle">${pct(v, 0)}</text>`;
  }
  fits.forEach((f) => {
    if (f.v < x0 || f.v > x1) return;
    s += `<g class="fit" tabindex="0" data-n="${f.n}" data-v="${f.v}"><rect class="hit" x="${X(f.v) - 9}" y="${h - m.b + 24}" width="18" height="22"/><path class="fit-mark" d="M${X(f.v)} ${h - m.b + 26} l5 8 h-10z"/></g>`;
  });
  s += `<text class="xlab note" x="${m.l}" y="${h - 4}">▲ ajustes exponenciais da série (20 a 4 pontos)</text>`;
  s += `<path class="curve" pathLength="1" d="${pts.map((p, i) => `${i ? 'L' : 'M'}${X(p.x).toFixed(1)} ${Y(p.y).toFixed(1)}`).join('')}"/>`;
  s += `<line class="cur-line" x1="${X(cur.x)}" x2="${X(cur.x)}" y1="${m.t}" y2="${m.t + ih}"/>`;
  s += `<circle class="cur-dot" cx="${X(cur.x)}" cy="${Y(cur.y)}" r="6"/>`;
  s += `<line class="xhair" x1="0" x2="0" y1="${m.t}" y2="${m.t + ih}" visibility="hidden"/><circle class="xdot" r="5" visibility="hidden"/>`;
  s += `<rect class="overlay" x="${m.l}" y="${m.t}" width="${iw}" height="${ih}"/>`;
  s += '</svg>';
  el.innerHTML = s;
  const svg = el.querySelector('svg');
  const ov = svg.querySelector('.overlay'), xh = svg.querySelector('.xhair'), xd = svg.querySelector('.xdot');
  const near = (e) => {
    const r = svg.getBoundingClientRect();
    const v = x0 + ((e.clientX - r.left - m.l) / iw) * (x1 - x0);
    return pts.reduce((a, p) => (Math.abs(p.x - v) < Math.abs(a.x - v) ? p : a));
  };
  ov.addEventListener('pointermove', (e) => {
    const p = near(e);
    xh.setAttribute('x1', X(p.x)); xh.setAttribute('x2', X(p.x)); xh.setAttribute('visibility', 'visible');
    xd.setAttribute('cx', X(p.x)); xd.setAttribute('cy', Y(p.y)); xd.setAttribute('visibility', 'visible');
    showTip(e.clientX, e.clientY, `<b>${pct(p.y, 2)}</b><span>reajuste com severidade projetada de ${pct(p.x, 1)}</span><span class="muted">clique para aplicar</span>`);
  });
  ov.addEventListener('pointerleave', () => { hideTip(); xh.setAttribute('visibility', 'hidden'); xd.setAttribute('visibility', 'hidden'); });
  ov.addEventListener('click', (e) => onPick(near(e).x));
  bindHover(el, '.fit', (g) => `<b>${pct(Number(g.dataset.v), 2, { sign: true })}</b><span>ajuste de ${g.dataset.n} pontos (severidade)</span>`);
}

// ---------- 3. Sinistralidade por ano ----------
export function lossRatios(el, { years, lr, avg, even, prem, loss }) {
  const w = el.clientWidth;
  const h = w < 520 ? 260 : 300;
  const m = { t: 30, r: 16, b: 34, l: 50 };
  const iw = w - m.l - m.r, ih = h - m.t - m.b;
  const all = [...lr, avg, even];
  let lo = Math.min(...all), hi = Math.max(...all);
  const pad = Math.max((hi - lo) * 0.25, 0.01); lo -= pad; hi += pad;
  const Y = (v) => m.t + ((hi - v) / (hi - lo)) * ih;
  const band = iw / years.length;
  const st = niceStep(hi - lo, 4);
  let s = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="group" aria-label="Sinistralidade projetada por ano: ${years.map((yv, i) => `${yv} ${pct(lr[i])}`).join(', ')}; média ${pct(avg)}; ponto que zera o reajuste ${pct(even)}">`;
  for (let v = Math.ceil(lo / st) * st; v <= hi; v += st) {
    s += `<line class="grid" x1="${m.l}" x2="${w - m.r}" y1="${Y(v)}" y2="${Y(v)}"/><text class="ylab" x="${m.l - 8}" y="${Y(v) + 4}" text-anchor="end">${pct(v, 0)}</text>`;
  }
  const close = Math.abs(Y(avg) - Y(even)) < 16;
  s += `<line class="lr-even" x1="${m.l}" x2="${w - m.r}" y1="${Y(even)}" y2="${Y(even)}"/>`;
  s += `<line class="lr-avg" x1="${m.l}" x2="${w - m.r}" y1="${Y(avg)}" y2="${Y(avg)}"/>`;
  const avgUp = !close || avg >= even;
  s += `<text class="line-lab" x="${m.l + 4}" y="${avgUp ? Y(avg) - 7 : Y(avg) + 16}">Média ponderada ${pct(avg)}</text>`;
  s += `<text class="line-lab accent" x="${w - m.r - 4}" y="${avgUp && close ? Y(even) + 16 : Y(even) - 7}" text-anchor="end">Zera o reajuste ${pct(even)}</text>`;
  years.forEach((yr, i) => {
    const cx = m.l + band * i + band / 2;
    s += `<g class="lr-pt" tabindex="0" data-i="${i}" style="--i:${i}"><rect class="hit" x="${cx - band / 2}" y="${m.t}" width="${band}" height="${ih}"/>
      <line class="stem" x1="${cx}" x2="${cx}" y1="${Y(avg)}" y2="${Y(lr[i])}"/>
      <circle class="mark" cx="${cx}" cy="${Y(lr[i])}" r="6"/></g>
      <text class="xlab" x="${cx}" y="${h - 10}" text-anchor="middle">${yr}</text>`;
  });
  s += '</svg>';
  el.innerHTML = s;
  bindHover(el, '.lr-pt', (g) => {
    const i = g.dataset.i;
    return `<b>${pct(lr[i])}</b><span>${years[i]}: sinistro projetado US$ ${num(loss[i])} sobre prêmio US$ ${num(prem[i])}</span>`;
  });
}

// ---------- 4. Para onde vai o prêmio ----------
export const SEG = [
  ['sin', 'Sinistros e despesas de regulação'],
  ['fix', 'Despesa fixa'],
  ['var', 'Despesa variável'],
  ['luc', 'Lucro'],
];
export function composition(el, rows) {
  const w = el.clientWidth;
  const narrow = w < 560;
  const rowH = narrow ? 92 : 78;
  const h = rows.length * rowH + 6;
  const m = { l: 0, r: narrow ? 0 : 168 };
  const iw = w - m.l - m.r;
  const max = Math.max(...rows.map((r) => Math.max(r.prem, r.sin + r.fix + r.var))) * 1.0;
  const X = (v) => (v / max) * iw;
  let s = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="group" aria-label="${rows.map((r) => `${r.label}: prêmio ${usd(r.prem)}, lucro ${usd(r.luc)}`).join('; ')}">`;
  rows.forEach((r, i) => {
    const top = i * rowH;
    const by = top + 26, bh = 34;
    s += `<text class="row-lab ${r.hl ? 'strong' : ''}" x="0" y="${top + 16}">${r.label}</text>`;
    let x = m.l;
    SEG.forEach(([k, name]) => {
      const v = Math.max(0, r[k]);
      const ww = X(v);
      if (ww <= 0) return;
      const gap = k === 'luc' ? 0 : 2;
      s += `<g class="seg-g" tabindex="0" data-i="${i}" data-k="${k}" style="--i:${i * 4 + SEG.findIndex((z) => z[0] === k)}"><rect class="seg seg-${k}" x="${x}" y="${by}" width="${Math.max(0, ww - gap)}" height="${bh}" rx="2"/>`;
      if (ww > (narrow ? 70 : 84)) s += `<text class="seg-val" x="${x + 8}" y="${by + 22}">${usd(v)}</text>`;
      s += '</g>';
      x += ww;
    });
    if (r.luc < 0) {
      s += `<line class="prem-mark" x1="${X(r.prem)}" x2="${X(r.prem)}" y1="${by - 4}" y2="${by + bh + 4}"/>`;
    }
    const side = `lucro ${usd(r.luc)} · ${pct(r.luc / r.prem, 2)}`;
    if (narrow) s += `<text class="row-side" x="0" y="${by + bh + 20}">prêmio ${usd(r.prem)} · ${side}</text>`;
    else s += `<text class="row-side" x="${w}" y="${by + 14}" text-anchor="end">${usd(r.prem)}</text><text class="row-side muted" x="${w}" y="${by + 31}" text-anchor="end">${side}</text>`;
  });
  s += '</svg>';
  el.innerHTML = s;
  bindHover(el, '.seg-g', (g) => {
    const r = rows[g.dataset.i];
    const k = g.dataset.k;
    const name = SEG.find((x) => x[0] === k)[1];
    return `<b>${usd(r[k])}</b><span>${name} · ${pct(r[k] / r.prem, 1)} do prêmio</span><span class="muted">${r.label}</span>`;
  });
}
