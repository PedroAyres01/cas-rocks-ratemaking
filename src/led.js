// Painel de mensagem variável: matriz de LEDs 5x7 desenhada em canvas.
// Ao trocar o texto, só os caracteres que mudaram embaralham antes de assentar.

const G = {
  ' ': ['00000', '00000', '00000', '00000', '00000', '00000', '00000'],
  '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
  '3': ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
  '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  '5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
  '6': ['00110', '01000', '10000', '11110', '10001', '10001', '01110'],
  '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  '9': ['01110', '10001', '10001', '01111', '00001', '00010', '01100'],
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  C: ['01110', '10001', '10000', '10000', '10000', '10001', '01110'],
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
  G: ['01110', '10001', '10000', '10111', '10001', '10001', '01111'],
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  I: ['01110', '00100', '00100', '00100', '00100', '00100', '01110'],
  J: ['00111', '00010', '00010', '00010', '00010', '10010', '01100'],
  K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
  N: ['10001', '10001', '11001', '10101', '10011', '10001', '10001'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
  Q: ['01110', '10001', '10001', '10001', '10101', '10010', '01101'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
  V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
  W: ['10001', '10001', '10001', '10101', '10101', '10101', '01010'],
  X: ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
  Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
  Z: ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
  '%': ['11000', '11001', '00010', '00100', '01000', '10011', '00011'],
  '−': ['00000', '00000', '00000', '11111', '00000', '00000', '00000'],
  '-': ['00000', '00000', '00000', '11111', '00000', '00000', '00000'],
  '+': ['00000', '00100', '00100', '11111', '00100', '00100', '00000'],
  ',': ['00000', '00000', '00000', '00000', '01100', '00100', '01000'],
  '.': ['00000', '00000', '00000', '00000', '00000', '01100', '01100'],
  '·': ['00000', '00000', '00000', '01100', '01100', '00000', '00000'],
  '$': ['00100', '01111', '10100', '01110', '00101', '11110', '00100'],
  '/': ['00000', '00001', '00010', '00100', '01000', '10000', '00000'],
  ':': ['00000', '01100', '01100', '00000', '01100', '01100', '00000'],
  '>': ['01000', '00100', '00010', '00001', '00010', '00100', '01000'],
  '=': ['00000', '00000', '11111', '00000', '11111', '00000', '00000'],
};
const SCRAMBLE = '0123456789ABCDEFGHJKLMNPRSTUVXYZ%$+';
const glyph = (ch) => G[ch] || G[ch.toUpperCase()] || G[' '];

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export class LedBoard {
  // lines: número de linhas de texto; cols: caracteres por linha
  constructor(canvas, { cols = 14, lines = 1, gap = 1, label = '' } = {}) {
    this.c = canvas;
    this.ctx = canvas.getContext('2d');
    this.cols = cols;
    this.lines = lines;
    this.gap = gap; // colunas de LED entre caracteres
    this.text = Array(lines).fill('');
    this.shown = Array.from({ length: lines }, () => Array(cols).fill(' '));
    this.on = getComputedStyle(document.documentElement).getPropertyValue('--amber').trim() || '#ffb000';
    this.off = getComputedStyle(document.documentElement).getPropertyValue('--amber-off').trim() || '#2b1f06';
    this.c.setAttribute('role', 'img');
    if (label) this.c.setAttribute('aria-label', label);
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(this.c);
    this.resize();
  }

  get dotsX() { return this.cols * (5 + this.gap) - this.gap; }
  get dotsY() { return this.lines * 7 + (this.lines - 1) * 2; }

  resize() {
    const r = this.c.getBoundingClientRect();
    if (!r.width) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    this.pitch = Math.min(r.width / this.dotsX, r.height / this.dotsY);
    this.c.width = Math.round(r.width * dpr);
    this.c.height = Math.round(r.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.w = r.width; this.h = r.height;
    this.draw();
  }

  draw() {
    const { ctx, pitch } = this;
    if (!pitch) return;
    ctx.clearRect(0, 0, this.w, this.h);
    const ox = (this.w - pitch * this.dotsX) / 2;
    const oy = (this.h - pitch * this.dotsY) / 2;
    const rad = pitch * 0.36;
    for (let L = 0; L < this.lines; L++) {
      for (let ci = 0; ci < this.cols; ci++) {
        const g = glyph(this.shown[L][ci]);
        for (let y = 0; y < 7; y++) {
          for (let x = 0; x < 5; x++) {
            const lit = g[y][x] === '1';
            ctx.fillStyle = lit ? this.on : this.off;
            ctx.beginPath();
            ctx.arc(ox + (ci * (5 + this.gap) + x + 0.5) * pitch, oy + (L * 9 + y + 0.5) * pitch, rad, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }
  }

  // align: 'left' | 'center' | 'right'
  set(lines, { align = 'center', instant = false } = {}) {
    const arr = Array.isArray(lines) ? lines : [lines];
    const target = arr.map((s) => {
      const t = String(s).toUpperCase().slice(0, this.cols);
      const pad = this.cols - t.length;
      const left = align === 'left' ? 0 : align === 'right' ? pad : Math.floor(pad / 2);
      return (' '.repeat(left) + t + ' '.repeat(pad - left)).split('');
    });
    while (target.length < this.lines) target.push(Array(this.cols).fill(' '));
    this.c.setAttribute('aria-label', arr.join(' '));
    cancelAnimationFrame(this.raf);
    if (instant || reduced()) {
      this.shown = target;
      this.draw();
      return;
    }
    // cada caractere alterado embaralha por um tempo escalonado da esquerda para a direita
    const t0 = performance.now();
    const changes = [];
    target.forEach((row, L) => row.forEach((ch, i) => {
      if (this.shown[L][i] !== ch) changes.push({ L, i, ch, end: 120 + i * 22 + L * 60 });
    }));
    const tick = (now) => {
      const el = now - t0;
      let pending = 0;
      for (const c of changes) {
        if (el >= c.end) this.shown[c.L][c.i] = c.ch;
        else {
          pending++;
          if (c.ch !== ' ' || el < c.end * 0.6) this.shown[c.L][c.i] = SCRAMBLE[(Math.random() * SCRAMBLE.length) | 0];
        }
      }
      this.draw();
      if (pending) this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }
}
