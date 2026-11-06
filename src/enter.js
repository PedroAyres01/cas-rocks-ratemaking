// Coreografia de entrada: o que acontece quando o carro chega numa estação
// ou quando um passo é revelado. Placas balançam presas ao pórtico, números
// contam, linhas se desenham, pontos acendem. Nunca anima transform em quem
// tem [data-depth] (a paralaxe usa `translate`) nem em quem é [data-step]
// (o CSS cuida da revelação dele).
import { gsap } from 'gsap';

const NUM = /\d{1,3}(?:\.\d{3})+(?:,\d+)?|\d+(?:,\d+)?/g;
const counting = new Map();

const free = (el) => !el.hasAttribute('data-depth') && !el.hasAttribute('data-step');
const visible = (el) => !el.closest('[data-step]:not(.is-in)');

function pick(scopes, sel, { self = true, movable = true } = {}) {
  const out = new Set();
  for (const s of scopes) {
    if (self && s.matches(sel)) out.add(s);
    s.querySelectorAll(sel).forEach((el) => out.add(el));
  }
  return [...out].filter((el) => visible(el) && (!movable || free(el)));
}

export function stopCounts() {
  counting.forEach(([tw, tpl], el) => { tw.kill(); el.textContent = tpl; });
  counting.clear();
}

function countUp(el, delay) {
  if (el.children.length) return;
  if (counting.has(el)) { const [tw, tpl] = counting.get(el); tw.kill(); el.textContent = tpl; }
  const tpl = el.textContent;
  const parts = [...tpl.matchAll(NUM)].map(([s]) => {
    const dec = s.includes(',') ? s.split(',')[1].length : 0;
    return { v: parseFloat(s.replace(/\./g, '').replace(',', '.')), dec, group: s.includes('.') };
  });
  if (!parts.length) return;
  const o = { p: 0 };
  const tw = gsap.to(o, {
    p: 1, duration: 1.3, delay, ease: 'power3.out',
    onUpdate() {
      let i = 0;
      el.textContent = tpl.replace(NUM, () => {
        const { v, dec, group } = parts[i++];
        return (v * o.p).toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec, useGrouping: group });
      });
    },
    onComplete() { el.textContent = tpl; counting.delete(el); },
  });
  counting.set(el, [tw, tpl]);
}

export function enter(scope, delay = 0) {
  const scopes = Array.isArray(scope) ? scope : [scope];
  const at = (t) => delay + t;

  // placas penduradas: giram no eixo X a partir da borda de cima e assentam
  const signs = pick(scopes, '.sign');
  if (signs.length) gsap.fromTo(signs,
    { rotationX: -82, transformPerspective: 900, transformOrigin: '50% 0%', opacity: 0 },
    { rotationX: 0, opacity: 1, duration: 1.15, ease: 'back.out(2.4)', stagger: 0.11, delay: at(0), clearProps: 'transform,opacity' });

  const beams = pick(scopes, '.gantry-beam');
  if (beams.length) gsap.fromTo(beams, { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: 'expo.out', delay: at(0), clearProps: 'transform' });

  const diamonds = pick(scopes, '.diamond');
  if (diamonds.length) gsap.fromTo(diamonds,
    { rotation: -200, scale: 0 },
    { rotation: 0, scale: 1, duration: 1.1, ease: 'back.out(2)', delay: at(0.35), clearProps: 'transform' });

  // números contam até o valor
  pick(scopes, '.hero-value, .sign-value, .b-v, .exp-val b, .stack-legend b, .eq-term b, .lc-v, .sim-prem b', { movable: false })
    .forEach((el, i) => countUp(el, at(0.15 + i * 0.06)));

  // linhas se desenham
  pick(scopes, '.s-line, .para-diag, .para-base, .b-road-edge, .b-road, .b-gantry line', { movable: false }).forEach((el, i) => {
    const len = el.getTotalLength?.();
    if (!len) return;
    gsap.fromTo(el, { strokeDasharray: len, strokeDashoffset: len },
      { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut', delay: at(0.1 + Math.min(i, 8) * 0.07), clearProps: 'strokeDasharray,strokeDashoffset' });
  });
  const lanes = pick(scopes, '.b-lane', { movable: false });
  if (lanes.length) gsap.fromTo(lanes, { opacity: 0 }, { opacity: 0.75, duration: 0.6, delay: at(1.2), clearProps: 'opacity' });
  const sel = pick(scopes, '.lc-sel, .lc-sel-t');
  if (sel.length) gsap.fromTo(sel, { scaleX: 0, transformOrigin: '0% 50%', opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.9, ease: 'expo.out', delay: at(0.9), clearProps: 'transform,opacity' });

  // pontos da série piscam em sequência, acompanhando a linha
  const dots = pick(scopes, '.s-dot, .s-hot');
  if (dots.length) gsap.fromTo(dots, { scale: 0, transformOrigin: '50% 50%' },
    { scale: 1, duration: 0.5, ease: 'back.out(3)', stagger: 1.2 / dots.length, delay: at(0.2), clearProps: 'transform' });

  // painel de LED: acende de baixo para cima
  const leds = pick(scopes, '.ledchart .d-on, .ledchart .d-old', { movable: false });
  if (leds.length) gsap.fromTo(leds, { opacity: 0.06 },
    { opacity: 1, duration: 0.25, ease: 'none', delay: (i, el) => at(0.1 + (300 - Number(el.getAttribute('cy'))) * 0.004 + Math.random() * 0.05), clearProps: 'opacity' });

  // faixas de ano do paralelogramo sobem da base
  const years = pick(scopes, '.para-year');
  if (years.length) gsap.fromTo(years, { scaleY: 0, transformOrigin: '50% 100%' }, { scaleY: 1, duration: 0.8, ease: 'expo.out', stagger: 0.08, delay: at(0), clearProps: 'transform' });

  // triângulo: cascata na diagonal
  const cells = pick(scopes, '.tri th, .tri td');
  if (cells.length) gsap.fromTo(cells, { opacity: 0, y: 14 }, {
    opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', clearProps: 'transform,opacity',
    delay: (i, el) => at(0.1 + (el.parentElement.rowIndex + el.cellIndex) * 0.045),
  });

  // listas e tabelas de apoio deslizam em sequência
  const rows = pick(scopes, '.exp-list > li, .fits tr, .bridge-list li, .pf-table tr, .stack-legend li');
  if (rows.length) gsap.fromTo(rows, { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.7, ease: 'expo.out', stagger: 0.07, delay: at(0.15), clearProps: 'transform,opacity' });

  // faixa de robustez se abre
  const range = pick(scopes, '.range span', { movable: false });
  if (range.length) gsap.fromTo(range, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1.2, ease: 'expo.out', delay: at(0.5), clearProps: 'clipPath' });
}
