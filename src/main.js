import '@fontsource/overpass/latin-400.css';
import '@fontsource/overpass/latin-600.css';
import '@fontsource/overpass/latin-700.css';
import '@fontsource/overpass/latin-800.css';
import '@fontsource/overpass/latin-900.css';
import '@fontsource/overpass-mono/latin-400.css';
import './style.css';
import { gsap } from 'gsap';
import { STATIONS, SIM_CONTROLS, SIM_PRESETS, bridgeSteps, fin } from './stations.js';
import { run, FINAL } from './engine.js';
import { LedBoard } from './led.js';
import { createTrails } from './trails.js';
import { pct, num, usd } from './fmt.js';

const root = document.documentElement;
gsap.config({ nullTargetWarn: false });
const deckQuery = matchMedia('(min-width: 900px) and (min-aspect-ratio: 1/1)');
const deck = deckQuery.matches;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
root.classList.toggle('deck', deck);
deckQuery.addEventListener('change', () => location.reload());

// ---------- montar estações ----------
const track = document.querySelector('.track');
track.style.setProperty('--n', STATIONS.length);
track.innerHTML = STATIONS.map((s) => `
  <section class="station" id="km${s.km}" data-km="${s.km}" aria-label="KM ${s.km} de ${STATIONS.length - 1}: ${s.title}">
    <div class="st-in">${s.html()}</div>
  </section>`).join('');
const sections = [...track.querySelectorAll('.station')];

// camadas de profundidade: o texto fica mais longe, placas e gráficos mais perto
const DEPTH = { lede: 0.35, 'hero-side': 1.25, gantry: 0.5, 'sim-controls': 1.1, presets: 1.1, debate: 0.45, 'km0-line': 0.3 };
sections.forEach((sec) => [...sec.firstElementChild.firstElementChild.children].forEach((el) => {
  if (el.classList.contains('sr-only')) return;
  const key = Object.keys(DEPTH).find((k) => el.classList.contains(k));
  el.dataset.depth = key ? DEPTH[key] : 0.8;
  el.style.setProperty('--d', el.dataset.depth);
}));

const allLayers = [...track.querySelectorAll('[data-depth]')];
const trails = createTrails(document.querySelector('.trails'));
const LAST = sections.length - 1;

// ---------- painéis de LED ----------
const ledHero = new LedBoard(document.getElementById('led-hero'), { cols: 14, lines: 2 });
ledHero.set(['CAS ROCKS ·', 'AUTO PD · 2017'], { instant: true });

const steps = bridgeSteps();
const ledBridge = new LedBoard(document.getElementById('led-bridge'), { cols: 7, lines: 1 });
ledBridge.set(pct(steps[0].v), { instant: true });

const ledSim = new LedBoard(document.getElementById('led-sim'), { cols: 18, lines: 2 });
const simText = (o) => [`REAJUSTE ${pct(o.cw)}`, `PREMIO US$ ${num(o.avgPremNew, 2)}`];
ledSim.set(simText(fin), { instant: true });

// ---------- fragmentos (passos dentro de uma estação) ----------
const stepGroups = sections.map((sec) => {
  const els = [...sec.querySelectorAll('[data-step]')];
  const ns = [...new Set(els.map((e) => Number(e.dataset.step)))].sort((a, b) => a - b);
  return ns.map((n) => els.filter((e) => Number(e.dataset.step) === n));
});
const shown = sections.map(() => 0);

function showSteps(i, count) {
  shown[i] = count;
  stepGroups[i].forEach((g, k) => g.forEach((el) => el.classList.toggle('is-in', k < count)));
  if (i === 8) syncBridge();
  renderStepDots();
}

function syncBridge() {
  const lastShown = deck ? shown[8] : steps.length - 1;
  const v = steps[lastShown].v;
  ledBridge.set(pct(v));
  document.querySelectorAll('.b-sign').forEach((g) => g.classList.toggle('is-last', Number(g.dataset.bstep) === lastShown));
}

// ---------- navegação pela estrada ----------
let cur = 0;
let busy = null;
const kmN = document.getElementById('km-n');
const kmLive = document.getElementById('km-live');
const exitLinks = [...document.querySelectorAll('.exits a')];
const dash = document.querySelector('.lane-dash');
const stepDots = document.querySelector('.drive-steps');
const [btnPrev, btnNext] = document.querySelectorAll('.drive-btn');

function renderStepDots() {
  const total = stepGroups[cur].length;
  stepDots.innerHTML = total ? Array.from({ length: total }, (_, k) => `<i class="${k < shown[cur] ? 'on' : ''}"></i>`).join('') : '';
  btnPrev.disabled = cur === 0 && shown[cur] === 0;
  btnNext.disabled = cur === LAST && shown[cur] === total;
}

function markChrome() {
  kmN.textContent = cur;
  const exit = STATIONS[cur].exit;
  exitLinks.forEach((a) => (Number(a.dataset.exit) === exit ? a.setAttribute('aria-current', 'step') : a.removeAttribute('aria-current')));
  kmLive.textContent = `KM ${cur}: ${STATIONS[cur].title}`;
  history.replaceState(null, '', `#km-${cur}`);
}

function go(target, { reveal = 'none', instant = false } = {}) {
  target = Math.max(0, Math.min(LAST, target));
  if (!deck) {
    sections[target].scrollIntoView({ behavior: reduced || instant ? 'auto' : 'smooth', block: 'start' });
    return;
  }
  const from = cur;
  cur = target;
  sections.forEach((s, k) => (s.inert = k !== cur));
  showSteps(cur, reveal === 'all' ? stepGroups[cur].length : 0);
  markChrome();
  root.style.setProperty('--tr-o', [0, 8, 9, 12].includes(cur) ? 1 : 0.5);

  const xp = -(cur / sections.length) * 100;
  if (busy) busy.kill();
  gsap.set(allLayers, { '--tx': '0px' });
  if (instant || reduced || from === cur) {
    gsap.set(track, { xPercent: xp });
    trails.flow = 1;
    return;
  }
  // o momento autoral: a viagem. A pista corre, a estação seguinte chega da direita.
  const dir = Math.sign(cur - from);
  const hops = Math.abs(cur - from);
  const dur = Math.min(0.95 + 0.12 * (hops - 1), 1.5);
  const signs = [...sections[cur].querySelectorAll('.sign, .vms, .exit-tab, .eq-res, .diamond, .stack-bar')].filter((el) => !el.hasAttribute('data-depth'));
  const vw = innerWidth * 0.32;
  const layersIn = [...sections[cur].querySelectorAll('[data-depth]')];
  const layersOut = [...sections[from].querySelectorAll('[data-depth]')];
  busy = gsap.timeline({ onComplete: () => layersOut.length && gsap.set(layersOut, { '--tx': '0px' }) })
    .to(track, { xPercent: xp, duration: dur, ease: 'expo.inOut' }, 0)
    .fromTo(layersIn, { '--tx': (i, el) => `${dir * el.dataset.depth * vw}px` }, { '--tx': '0px', duration: dur, ease: 'expo.inOut' }, 0)
    .to(layersOut, { '--tx': (i, el) => `${-dir * el.dataset.depth * vw}px`, duration: dur, ease: 'expo.inOut' }, 0)
    .to(trails, { flow: dir * 9, duration: dur * 0.45, ease: 'power2.in' }, 0)
    .to(trails, { flow: 1, duration: dur * 1.1, ease: 'power3.out' }, dur * 0.45)
    .to(dash, { backgroundPositionX: `${dir > 0 ? '-=' : '+='}${innerWidth * 0.9 * Math.min(hops, 3)}px`, duration: dur, ease: 'expo.inOut' }, 0)
    .fromTo(signs, { scale: 0.9, y: '1.2rem', opacity: 0.35 }, { scale: 1, y: 0, opacity: 1, duration: 0.9, ease: 'expo.out', stagger: 0.05, clearProps: 'transform,opacity' }, dur * 0.42);
}

function next() {
  if (shown[cur] < stepGroups[cur].length) showSteps(cur, shown[cur] + 1);
  else if (cur < LAST) go(cur + 1);
}
function prev() {
  if (shown[cur] > 0) showSteps(cur, shown[cur] - 1);
  else if (cur > 0) go(cur - 1, { reveal: 'all' });
}

const parseHash = () => {
  const m = location.hash.match(/^#km-(\d+)$/);
  return m ? Number(m[1]) : null;
};

if (deck) {
  btnNext.addEventListener('click', next);
  btnPrev.addEventListener('click', prev);

  addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target;
    const inRange = t instanceof HTMLInputElement && t.type === 'range';
    const onControl = t.closest?.('button, a');
    const k = e.key;
    if (inRange && !['PageDown', 'PageUp'].includes(k)) return;
    if (onControl && (k === ' ' || k === 'Enter')) return;
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(k)) { e.preventDefault(); next(); }
    else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(k)) { e.preventDefault(); prev(); }
    else if (k === 'Home') { e.preventDefault(); go(0); }
    else if (k === 'End') { e.preventDefault(); go(LAST, { reveal: 'all' }); }
    else if (/^[0-9]$/.test(k)) go(Number(k), { reveal: 'all' });
    else if (k === 'f' || k === 'F') {
      if (document.fullscreenElement) document.exitFullscreen();
      else root.requestFullscreen?.().catch(() => {});
    }
  });

  let tx = null;
  addEventListener('touchstart', (e) => { tx = e.target.closest('.sim-controls, .tri-wrap, .bridge-wrap') ? null : e.touches[0].clientX; }, { passive: true });
  addEventListener('touchend', (e) => {
    if (tx == null) return;
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 60) (dx < 0 ? next : prev)();
    tx = null;
  });

  addEventListener('hashchange', () => { const n = parseHash(); if (n != null && n !== cur) go(n, { reveal: 'all' }); });
  addEventListener('resize', () => gsap.set(track, { xPercent: -(cur / sections.length) * 100 }));
} else {
  sections.forEach((_, i) => showSteps(i, stepGroups[i].length));
  syncBridge();
}

document.querySelectorAll('[data-go]').forEach((a) => a.addEventListener('click', (e) => {
  e.preventDefault();
  go(Number(a.dataset.go), { reveal: 'all' });
}));

// ---------- simulador ----------
let simP = structuredClone(FINAL);
const inputs = Object.fromEntries(SIM_CONTROLS.map((c) => [c.id, document.getElementById(`c-${c.id}`)]));
const outputs = Object.fromEntries(SIM_CONTROLS.map((c) => [c.id, document.getElementById(`v-${c.id}`)]));
const signOut = {
  lr: [document.getElementById('o-lr'), (o) => o.LR, (v) => pct(v)],
  fix: [document.getElementById('o-fix'), (o) => o.fixed, (v) => pct(v)],
  var: [document.getElementById('o-var'), (o) => o.var, (v) => pct(v)],
  z: [document.getElementById('o-z'), (o) => o.Z, (v) => pct(v, 0)],
};
const oPrem = document.getElementById('o-prem');
const presetBtns = [...document.querySelectorAll('.preset')];
let ledTimer;

function paintRange(c) {
  const el = inputs[c.id];
  const p = ((Number(el.value) - c.min) / (c.max - c.min)) * 100;
  el.style.setProperty('--p', `${p}%`);
}

function simRender() {
  const o = run(simP);
  for (const [el, get, fmt] of Object.values(signOut)) {
    const v = get(o);
    el.querySelector('.sign-value').textContent = fmt(v);
    el.classList.toggle('is-hot', fmt(v) !== fmt(get(fin)));
  }
  oPrem.textContent = `Reajuste ${pct(o.cw)}; prêmio médio por veículo de ${usd(o.avgPremProj)} para ${usd(o.avgPremNew)}`;
  clearTimeout(ledTimer);
  ledTimer = setTimeout(() => ledSim.set(simText(o)), 50);
}

function syncControls() {
  for (const c of SIM_CONTROLS) {
    inputs[c.id].value = c.get(simP);
    outputs[c.id].textContent = c.fmt(c.get(simP));
    paintRange(c);
  }
}

for (const c of SIM_CONTROLS) {
  paintRange(c);
  inputs[c.id].addEventListener('input', () => {
    const v = Number(inputs[c.id].value);
    c.set(simP, v);
    outputs[c.id].textContent = c.fmt(v);
    paintRange(c);
    presetBtns.forEach((b) => b.classList.remove('is-on'));
    simRender();
  });
}
presetBtns.forEach((b) => b.addEventListener('click', () => {
  simP = SIM_PRESETS.find((s) => s.id === b.dataset.preset).p();
  presetBtns.forEach((x) => x.classList.toggle('is-on', x === b));
  syncControls();
  simRender();
}));

// ---------- câmera que segue o ponteiro (pan suavizado, como no projeto do Isla) ----------
if (deck && !reduced) {
  let tx = 0, ty = 0, cx = 0, cy = 0, glint = 0, tg = 0;
  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    tx = (e.clientX / innerWidth - 0.5) * 2;
    ty = (e.clientY / innerHeight - 0.5) * 2;
    tg = 1;
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => { tx = ty = 0; tg = 0; });
  const loop = () => {
    cx += (tx - cx) * 0.06; cy += (ty - cy) * 0.06; glint += (tg - glint) * 0.05;
    root.style.setProperty('--pn-x', cx.toFixed(4));
    root.style.setProperty('--pn-y', cy.toFixed(4));
    root.style.setProperty('--glint', glint.toFixed(3));
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

// ---------- início ----------
if (deck) {
  const n = parseHash();
  go(n ?? 0, { reveal: n ? 'all' : 'none', instant: true });
  if (!reduced) {
    gsap.fromTo('.hero-sign, .hero-side', { '--tx': (i) => `${(i + 1) * 9}rem`, opacity: 0 }, { '--tx': '0rem', opacity: 1, duration: 1.4, ease: 'expo.out', stagger: 0.16, delay: 0.15, clearProps: 'opacity' });
    gsap.from(dash, { backgroundPositionX: `${innerWidth}px`, duration: 1.6, ease: 'expo.out' });
  }
} else {
  const n = parseHash();
  if (n) requestAnimationFrame(() => sections[n].scrollIntoView());
}
