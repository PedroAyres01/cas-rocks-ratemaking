// Rastros de luz em longa exposição: o tráfego noturno passando pela estrada.
// Adaptado do componente DataRain (21st.dev) para JS puro e para o mundo da rodovia:
// o fluxo corre na horizontal, o cursor é um obstáculo (escoamento potencial em torno
// de um cilindro + vórtices de Kármán ao mover), e a viagem entre estações acelera o fluxo.

const MAX = 2600;
const L = 19;
const STEP = 1 / 60;
const PUFFS = 24;
const TAU = Math.PI * 2;
const AGE_BUCKETS = 6;
const SEGS = 3;

const K_RELAX = 1 - Math.exp(-STEP / 0.12);
const K_Q = 1 - Math.exp(-STEP * 8);
const K_CURSOR = 1 - Math.exp(-STEP * 18);
const K_VEL = 1 - Math.exp(-STEP * 10);
const K_IN = 1 - Math.exp(-STEP / 0.06);
const K_OUT = 1 - Math.exp(-STEP / 0.2);
const FIRE_P = 0.03 * STEP;
const FIRE_DECAY = Math.exp(-STEP / 0.45);
const PUFF_DECAY = Math.exp(-STEP / 1.1);

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hex = (s, fb) => {
  s = (s || '').trim().replace(/^#/, '');
  if (!/^[0-9a-fA-F]{6}$/.test(s)) return fb;
  const n = parseInt(s, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
function wave(lambda, angle, omega, phase, amp) {
  const k = TAU / lambda;
  return { kx: k * Math.cos(angle), ky: k * Math.sin(angle), om: omega, ph: phase, au: amp * Math.sin(angle), av: -amp * Math.cos(angle) };
}
const W0 = wave(380, 1.9, 0.18, 0.7, 12);
const W1 = wave(620, 0.4, 0.27, 2.1, 10);
const W2 = wave(900, 2.6, 0.35, 4.2, 8);

export function createTrails(root, { obstacleRadius = 70 } = {}) {
  const main = root.querySelector('.tr-main');
  const bloom = root.querySelector('.tr-bloom');
  const ctx = main.getContext('2d');
  const bctx = bloom.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rand = mulberry32(11);

  let w = 0, h = 0, dpr = 1, bw = 1, bh = 1, offX = 0, offY = 0;
  let flow = 1; // sinal = sentido do tráfego; módulo = velocidade
  const px = new Float32Array(MAX), py = new Float32Array(MAX), vx = new Float32Array(MAX), vy = new Float32Array(MAX);
  const pz = new Float32Array(MAX), v0 = new Float32Array(MAX), qv = new Float32Array(MAX), fire = new Float32Array(MAX);
  const len = new Uint8Array(MAX);
  const hx = new Float32Array(MAX * L), hy = new Float32Array(MAX * L);
  let head = 0;
  const groups = Array.from({ length: 6 }, () => new Int32Array(MAX));
  const gCount = new Int32Array(6);
  const strokeStyles = new Array(6 * AGE_BUCKETS).fill('');
  const strokeWidths = new Float32Array(6 * AGE_BUCKETS);
  const headStyles = ['', ''];

  const pX = new Float32Array(PUFFS), pY = new Float32Array(PUFFS), pG = new Float32Array(PUFFS), pAge = new Float32Array(PUFFS), pAlive = new Uint8Array(PUFFS);
  const aX = new Float32Array(PUFFS), aY = new Float32Array(PUFFS), aG = new Float32Array(PUFFS), aC2 = new Float32Array(PUFFS), aR2 = new Float32Array(PUFFS);
  let aCount = 0, puffCursor = 0, shedSign = 1, shedAcc = 0;

  let simTime = 0, active = 0;
  let pointerActive = false, pointerX = 0, pointerY = 0;
  let tgtX = 0, tgtY = 0, cx = 0, cy = 0, pcx = 0, pcy = 0, vcx = 0, vcy = 0, influence = 0, curA = obstacleRadius, prevSrc = 0;
  let raf = 0, last = 0, acc = 0, live = false;

  function buildStyles() {
    const cs = getComputedStyle(document.documentElement);
    const calm = hex(cs.getPropertyValue('--tr-calm'), [120, 132, 138]);
    const mid = hex(cs.getPropertyValue('--amber'), [255, 176, 0]);
    const hot = hex(cs.getPropertyValue('--tr-hot'), [255, 243, 207]);
    const cols = [calm, mid, hot];
    const baseA = [0.3, 0.55, 0.9], baseW = [1.0, 1.4, 1.9];
    for (let g = 0; g < 6; g++) {
      const depth = g < 3 ? 0 : 1, b = g % 3, c = cols[b];
      for (let ab = 0; ab < AGE_BUCKETS; ab++) {
        const fall = Math.pow(1 - (ab + 0.5) / AGE_BUCKETS, 1.5);
        const a = Math.min(0.9, baseA[b] * (depth ? 1 : 0.55) * fall * 1.3);
        strokeStyles[g * AGE_BUCKETS + ab] = `rgba(${c[0]},${c[1]},${c[2]},${a.toFixed(3)})`;
        strokeWidths[g * AGE_BUCKETS + ab] = clamp(baseW[b] * (depth ? 1 : 0.7) * (1 - (0.45 * ab) / AGE_BUCKETS), 0.6, 2);
      }
    }
    headStyles[0] = `rgba(${hot[0]},${hot[1]},${hot[2]},0.5)`;
    headStyles[1] = `rgba(${hot[0]},${hot[1]},${hot[2]},0.9)`;
  }

  function seed(i, uniform) {
    const fromLeft = flow < 0;
    const x = uniform ? rand() * w : fromLeft ? -40 - rand() * 120 : w + 40 + rand() * 120;
    const y = rand() * h;
    const z = 0.35 + 0.65 * rand();
    pz[i] = z;
    v0[i] = 150 + 280 * z * z;
    len[i] = 9 + Math.floor(rand() * 11);
    px[i] = x; py[i] = y; vx[i] = -v0[i] * flow; vy[i] = 0; qv[i] = 1; fire[i] = 0;
    const b = i * L;
    for (let k = 0; k < L; k++) { hx[b + k] = x; hy[b + k] = y; }
  }
  function applyCount(uniform) {
    const n = clamp(Math.round((w * h) / 620), 600, MAX);
    for (let i = active; i < n; i++) seed(i, uniform);
    active = n;
  }

  function spawnPuff(a, speed) {
    const dxn = vcx / speed, dyn = vcy / speed, s = shedSign;
    shedSign = -shedSign;
    const j = puffCursor;
    puffCursor = (puffCursor + 1) % PUFFS;
    pX[j] = cx - dxn * 0.6 * a - dyn * s * 0.7 * a;
    pY[j] = cy - dyn * 0.6 * a + dxn * s * 0.7 * a;
    pG[j] = clamp(s * Math.min(speed, 1200) * a * 1.5, -105000, 105000);
    pAge[j] = 0;
    pAlive[j] = 1;
  }

  function simulate() {
    const f = Math.sign(flow || 1) * clamp(Math.abs(flow), 0.05, 12);
    head = (head + 1) % L;
    simTime += STEP;
    const src = pointerActive ? 2 : 0;
    if (src) { tgtX = pointerX; tgtY = pointerY; }
    const snap = src && !prevSrc && influence < 0.05;
    prevSrc = src;
    if (snap) { cx = pcx = tgtX; cy = pcy = tgtY; vcx = vcy = 0; }
    else {
      pcx = cx; pcy = cy;
      cx += (tgtX - cx) * K_CURSOR; cy += (tgtY - cy) * K_CURSOR;
      vcx += ((cx - pcx) / STEP - vcx) * K_VEL; vcy += ((cy - pcy) / STEP - vcy) * K_VEL;
    }
    influence += ((src ? 1 : 0) - influence) * (src ? K_IN : K_OUT);
    const infl = influence;
    const vcMag = Math.hypot(vcx, vcy);
    const a = obstacleRadius + Math.min(vcMag * 0.025, 36);
    curA = a;

    if (infl > 0.3 && vcMag > 60) {
      shedAcc += Math.hypot(cx - pcx, cy - pcy);
      let guard = 0;
      while (shedAcc >= 28 && guard++ < 4) { shedAcc -= 28; spawnPuff(a, vcMag); }
      if (shedAcc >= 28) shedAcc = 0;
    } else shedAcc = 0;

    aCount = 0;
    const drift = 0.5 * 115 * f * STEP;
    for (let j = 0; j < PUFFS; j++) {
      if (!pAlive[j]) continue;
      const age = pAge[j] + STEP;
      if (age > 2.4) { pAlive[j] = 0; continue; }
      pAge[j] = age;
      pG[j] *= PUFF_DECAY;
      pX[j] -= drift;
      const c2 = 676 + 90 * age;
      aX[aCount] = pX[j]; aY[aCount] = pY[j]; aG[aCount] = pG[j] / TAU; aC2[aCount] = c2; aR2[aCount] = 36 * c2;
      aCount++;
    }

    const ph0 = W0.om * simTime + W0.ph, ph1 = W1.om * simTime + W1.ph, ph2 = W2.om * simTime + W2.ph;
    const obsOn = infl > 0.002, projOn = infl > 0.05, projScale = Math.min(1, infl * 1.5);

    for (let i = 0; i < active; i++) {
      const x0 = px[i], y0 = py[i], z = pz[i];
      const v0e = v0[i] * f;
      const c0 = Math.cos(W0.kx * x0 + W0.ky * y0 + ph0);
      const c1 = Math.cos(W1.kx * x0 + W1.ky * y0 + ph1);
      const c2 = Math.cos(W2.kx * x0 + W2.ky * y0 + ph2);
      let tx = -v0e + (W0.au * c0 + W1.au * c1 + W2.au * c2) * z;
      let ty = (W0.av * c0 + W1.av * c1 + W2.av * c2) * z;
      const zf = 0.55 + 0.45 * z;
      const aE = a * zf;
      const rx = x0 - cx, ry = y0 - cy;
      let pertX = 0, pertY = 0, deficit = 0;

      if (obsOn) {
        const d2 = rx * rx + ry * ry;
        let Ux = -v0e - vcx, Uy = -vcy;
        let U = Math.hypot(Ux, Uy);
        if (U > 1e-3) {
          if (U > 900) { const sc = 900 / U; Ux *= sc; Uy *= sc; U = 900; }
          const ex = Ux / U, ey = Uy / U;
          const s = rx * ex + ry * ey, n = -rx * ey + ry * ex;
          if (s > 0 && s < 12 * aE) {
            const wd = 0.9 * aE + 0.2 * s, nn = n / wd;
            deficit = 0.55 * Math.exp(-s / (3 * aE)) * Math.exp(-nn * nn);
          }
          const near = 9 * aE;
          if (d2 < near * near) {
            const rho2 = Math.max(s * s + n * n, aE * aE * 0.64);
            const k = (aE * aE) / (rho2 * rho2);
            const ds = -U * k * (s * s - n * n), dn = -U * k * 2 * s * n;
            let win = 1;
            const inner = 5 * aE;
            if (d2 > inner * inner) { const t = (Math.sqrt(d2) - inner) / (4 * aE); win = 1 - t * t * (3 - 2 * t); }
            pertX = (ds * ex - dn * ey) * win;
            pertY = (ds * ey + dn * ex) * win;
          }
        }
      }

      let vorX = 0, vorY = 0;
      for (let j = 0; j < aCount; j++) {
        const dx = x0 - aX[j], dy = y0 - aY[j];
        const d2p = dx * dx + dy * dy + 1e-3;
        if (d2p < aR2[j]) {
          const ff = (aG[j] * (1 - Math.exp(-d2p / aC2[j]))) / d2p;
          const wnd = 1 - d2p / aR2[j];
          const fw = ff * wnd * wnd * zf;
          vorX += -dy * fw; vorY += dx * fw;
        }
      }

      const keep = 1 - deficit * infl;
      tx = tx * keep + pertX * infl + vorX;
      ty = ty * keep + pertY * infl + vorY;
      let ux = vx[i] + (tx - vx[i]) * K_RELAX;
      let uy = vy[i] + (ty - vy[i]) * K_RELAX;
      const sp2 = ux * ux + uy * uy;
      const cap = 900 * Math.max(1, Math.abs(f) / 2);
      if (sp2 > cap * cap) { const sc = cap / Math.sqrt(sp2); ux *= sc; uy *= sc; }
      let x = x0 + ux * STEP, y = y0 + uy * STEP;

      if (projOn) {
        const aP = aE * projScale, qx = x - cx, qy = y - cy, q2 = qx * qx + qy * qy, lim = 0.98 * aP;
        if (q2 < lim * lim) {
          const rr = Math.sqrt(q2);
          const nx = rr < 1e-3 ? 1 : qx / rr, ny = rr < 1e-3 ? 0 : qy / rr;
          x = cx + nx * aP; y = cy + ny * aP;
          const vn = (ux - vcx) * nx + (uy - vcy) * ny;
          if (vn < 0) { ux -= vn * nx; uy -= vn * ny; }
        }
      }
      vx[i] = ux; vy[i] = uy; px[i] = x; py[i] = y;

      if (x < -160 || x > w + 160 || y < -200 || y > h + 200) { seed(i, false); continue; }
      qv[i] += (Math.hypot(ux, uy) / Math.abs(v0e || 1) - qv[i]) * K_Q;
      if (rand() < FIRE_P) fire[i] = 1;
      else { const fr = fire[i] * FIRE_DECAY; fire[i] = fr < 0.01 ? 0 : fr; }
      const slot = i * L + head;
      hx[slot] = x; hy[slot] = y;
    }
  }

  function render() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    gCount.fill(0);
    for (let i = 0; i < active; i++) {
      const q = qv[i];
      let b = q < 1.25 ? 0 : q < 1.85 ? 1 : 2;
      if (fire[i] > 0.35 && b < 2) b++;
      const g = (pz[i] < 0.62 ? 0 : 3) + b;
      groups[g][gCount[g]++] = i;
    }
    for (let g = 0; g < 6; g++) {
      const cnt = gCount[g];
      if (!cnt) continue;
      const list = groups[g];
      for (let ab = 0; ab < AGE_BUCKETS; ab++) {
        const k0 = ab * SEGS, k1 = k0 + SEGS;
        ctx.strokeStyle = strokeStyles[g * AGE_BUCKETS + ab];
        ctx.lineWidth = strokeWidths[g * AGE_BUCKETS + ab];
        ctx.beginPath();
        for (let j = 0; j < cnt; j++) {
          const i = list[j], segs = len[i] - 1;
          if (k0 >= segs) continue;
          const base = i * L, kEnd = Math.min(k1, segs);
          let idx = (head - k0 + L) % L;
          ctx.moveTo(hx[base + idx], hy[base + idx]);
          for (let k = k0; k < kEnd; k++) { idx = idx === 0 ? L - 1 : idx - 1; ctx.lineTo(hx[base + idx], hy[base + idx]); }
        }
        ctx.stroke();
      }
    }
    const ph = head === 0 ? L - 1 : head - 1;
    ctx.lineWidth = 1.5;
    for (let depth = 0; depth < 2; depth++) {
      ctx.strokeStyle = headStyles[depth];
      ctx.beginPath();
      for (let b = 1; b < 3; b++) {
        const g = depth * 3 + b, list = groups[g];
        for (let j = 0; j < gCount[g]; j++) {
          const i = list[j];
          if (b === 1 && fire[i] <= 0.5) continue;
          const base = i * L;
          ctx.moveTo(hx[base + head], hy[base + head]);
          ctx.lineTo(hx[base + ph], hy[base + ph]);
        }
      }
      ctx.stroke();
    }
    bctx.clearRect(0, 0, bw, bh);
    bctx.drawImage(main, 0, 0, bw, bh);
  }

  function resize() {
    const r = root.getBoundingClientRect();
    const nw = Math.max(1, r.width), nh = Math.max(1, r.height);
    let d = Math.min(devicePixelRatio || 1, 2);
    if (nw * nh * d * d > 4.5e6) d = Math.sqrt(4.5e6 / (nw * nh));
    offX = r.left; offY = r.top;
    if (nw === w && nh === h && d === dpr) return;
    w = nw; h = nh; dpr = d;
    main.width = Math.round(w * dpr); main.height = Math.round(h * dpr);
    bw = Math.ceil(w / 4); bh = Math.ceil(h / 4);
    bloom.width = bw; bloom.height = bh;
    applyCount(true);
    if (!live) { presim(reduced ? 3 : 0.5); render(); }
  }
  const presim = (sec) => { for (let s = 0, n = Math.round(sec / STEP); s < n; s++) simulate(); };

  function frame(now) {
    const dt = Math.max(0, now - last);
    last = now;
    acc += Math.min(0.05, dt / 1000);
    let n = 0;
    while (acc >= STEP && n < 3) { simulate(); acc -= STEP; n++; }
    if (n === 3) acc = 0;
    if (n) render();
    raf = requestAnimationFrame(frame);
  }
  function start() { cancelAnimationFrame(raf); last = performance.now(); acc = 0; raf = requestAnimationFrame(frame); }

  buildStyles();
  resize();
  new ResizeObserver(resize).observe(root);
  presim(2.5);
  render();

  if (!reduced) {
    live = true;
    const onMove = (e) => { pointerX = e.clientX - offX; pointerY = e.clientY - offY; pointerActive = true; };
    const onLeave = () => { pointerActive = false; };
    addEventListener('pointermove', onMove, { passive: true });
    addEventListener('pointerdown', onMove, { passive: true });
    addEventListener('pointerup', (e) => { if (e.pointerType !== 'mouse') onLeave(); }, { passive: true });
    addEventListener('blur', onLeave);
    document.documentElement.addEventListener('pointerleave', onLeave);
    document.addEventListener('visibilitychange', () => { if (document.hidden) cancelAnimationFrame(raf); else start(); });
    start();
  }

  // a viagem entre estações empurra o fluxo; o sinal define o sentido
  return {
    get flow() { return flow; },
    set flow(v) { flow = v; },
  };
}
