// Abertura: a ponte de −6,2% até a indicação do grupo se monta em tela cheia.
// Os valores vêm do motor; a ordem dos passos é a mesma do slide "A ponte" do deck.
import { run, BASE, FINAL } from './engine.js';
import { pct } from './fmt.js';
import { ppTxt } from './charts.js';

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function bridgeSteps() {
  const p = structuredClone(BASE), F = FINAL;
  const out = [{ label: 'Planilha original', who: '', v: run(p).cw }];
  const step = (label, who, f) => { f(p); out.push({ label, who, v: run(p).cw }); };
  step('Despesas gerais', 'P4', (q) => { q.gen_exp = F.gen_exp; q.exp_sel.gen = F.exp_sel.gen; q.exp_sel.lic = F.exp_sel.lic; q.exp_sel.com = F.exp_sel.com; });
  step('Outras aquisições', 'P4', (q) => { q.exp_sel.acq = F.exp_sel.acq; });
  step('Impostos', 'P4', (q) => { q.exp_sel.tax = F.exp_sel.tax; });
  step('Reajustes e tendência', 'P1', (q) => { q.rate_changes = F.rate_changes; q.prem_trend = F.prem_trend; });
  step('Sinistros e ULAE', 'P2', (q) => { q.ldf_sel = F.ldf_sel; q.ulae_sel = F.ulae_sel; });
  step('Severidade 2%', 'P3', (q) => { q.sev = F.sev; });
  return out;
}

function drawBridge(el, steps) {
  const w = el.clientWidth, narrow = w < 640;
  const h = narrow ? 230 : 300;
  const m = { t: 30, b: narrow ? 46 : 54 };
  const ih = h - m.t - m.b;
  const lo = Math.min(...steps.map((s) => s.v)) * 1.12, hi = 0.012;
  const Y = (v) => m.t + ((hi - v) / (hi - lo)) * ih;
  const n = steps.length + 1, band = w / n, bw = Math.min(84, band * 0.56);
  let s = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true">`;
  s += `<line class="hb-zero" x1="0" x2="${w}" y1="${Y(0)}" y2="${Y(0)}"/><text class="hb-zl" x="0" y="${Y(0) - 10}">0% · tarifa no ponto</text>`;
  let prev = 0;
  const items = steps.map((st, i) => {
    const isFirst = i === 0;
    const y0 = isFirst ? 0 : prev, y1 = st.v;
    prev = st.v;
    return { ...st, y0, y1, d: y1 - y0, kind: isFirst ? 'total' : y1 >= y0 ? 'up' : 'down' };
  });
  const last = steps.at(-1);
  items.push({ label: 'Grupo', who: '', y0: 0, y1: last.v, d: last.v, kind: 'total end' });
  items.forEach((b, i) => {
    const cx = band * i + band / 2;
    const top = Math.min(Y(b.y0), Y(b.y1));
    const hh = Math.max(3, Math.abs(Y(b.y0) - Y(b.y1)));
    const origin = b.kind === 'up' ? 'bottom' : 'top';
    const txt = b.kind.startsWith('total') ? pct(b.y1, b.kind.includes('end') ? 2 : 1) : ppTxt(b.d).replace(' p.p.', '');
    const ty = b.kind === "up" ? top - 9 : b.kind === "total" ? top + hh - 14 : top + hh + 20;
    s += `<g class="hb ${b.kind}" style="--i:${i};--o:${origin}">
      <rect x="${cx - bw / 2}" y="${top}" width="${bw}" height="${hh}" rx="2"/>
      <text class="hb-v${b.kind === "total" ? " in" : ""}" x="${cx}" y="${b.kind.includes('end') ? top - 9 : ty}" text-anchor="middle">${txt}</text>
      <text class="hb-l" x="${cx}" y="${h - m.b + 22}" text-anchor="middle">${narrow ? (b.who || b.label.split(' ')[0]) : b.label}</text>
      ${!narrow && b.who ? `<text class="hb-w" x="${cx}" y="${h - m.b + 40}" text-anchor="middle">${b.who}</text>` : ''}
    </g>`;
  });
  s += '</svg>';
  el.innerHTML = s;
  return items;
}

function countTo(el, from, to, ms) {
  const t0 = performance.now();
  const f = (t) => {
    const k = Math.min(1, (t - t0) / ms), e = 1 - (1 - k) ** 3;
    el.textContent = pct(from + (to - from) * e, 2);
    if (k < 1) requestAnimationFrame(f);
  };
  requestAnimationFrame(f);
}

export function initHero() {
  const hero = document.querySelector('.hero');
  const box = document.getElementById('hero-bridge');
  const num = document.getElementById('hero-cw');
  const steps = bridgeSteps();
  let items = drawBridge(box, steps);
  const STEP = 420;

  function play() {
    hero.classList.remove('is-done');
    box.classList.remove('is-play');
    void box.offsetWidth;
    if (reduced()) { hero.classList.add('is-done'); box.classList.add('is-static'); num.textContent = pct(steps.at(-1).v, 2); return; }
    box.classList.add('is-play');
    num.textContent = pct(steps[0].v, 2);
    items.forEach((b, i) => {
      if (i === 0 || b.kind.includes('end')) return;
      setTimeout(() => countTo(num, items[i - 1].y1, b.y1, STEP), 500 + i * STEP);
    });
    setTimeout(() => hero.classList.add('is-done'), 500 + items.length * STEP);
  }

  document.getElementById('hero-replay').addEventListener('click', play);
  let rw;
  new ResizeObserver(() => {
    clearTimeout(rw);
    rw = setTimeout(() => {
      items = drawBridge(box, steps);
      if (hero.classList.contains('is-done')) box.classList.add('is-static');
    }, 120);
  }).observe(box);
  play();

  // profundidade ao rolar: o conteúdo da abertura recua enquanto o simulador sobe
  const inner = hero.querySelector('.hero-in');
  let ticking = false;
  addEventListener('scroll', () => {
    if (ticking || reduced()) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const k = Math.min(1, scrollY / (hero.offsetHeight * 0.9));
      inner.style.transform = `translateY(${k * 60}px) scale(${1 - k * 0.04})`;
      inner.style.opacity = String(1 - k * 0.85);
    });
  }, { passive: true });

  fx(hero.querySelector('.hero-fx'), hero);
}

// Fundo: linhas finas que ondulam devagar, como séries de sinistros em papel milimetrado.
function fx(cv, hero) {
  const ctx = cv.getContext('2d');
  let w = 0, h = 0, dpr = 1, on = true, raf = 0;
  const size = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    w = cv.clientWidth; h = cv.clientHeight;
    cv.width = w * dpr; cv.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  size();
  addEventListener('resize', size);
  const LINES = 22;
  const frame = (t) => {
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < LINES; i++) {
      const base = h * (0.18 + (i / LINES) * 0.8);
      const amp = 10 + (i % 5) * 6;
      const sp = 0.00006 + (i % 7) * 0.00001;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 12) {
        const y = base + Math.sin(x * 0.004 + t * sp * 6 + i) * amp + Math.sin(x * 0.011 - t * sp * 3 + i * 2) * amp * 0.35;
        x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.strokeStyle = i === 13 ? 'rgba(240,163,107,0.28)' : `rgba(169,180,198,${0.05 + (i % 4) * 0.018})`;
      ctx.lineWidth = i === 13 ? 1.4 : 1;
      ctx.stroke();
    }
    if (on && !reduced()) raf = requestAnimationFrame(frame);
  };
  new IntersectionObserver(([e]) => {
    on = e.isIntersecting;
    cancelAnimationFrame(raf);
    if (on) raf = requestAnimationFrame(frame);
  }).observe(hero);
  frame(0);
}
