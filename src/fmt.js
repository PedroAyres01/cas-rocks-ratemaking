// Formatação pt-BR com sinal de menos tipográfico (−).
const MINUS = '−';

export function pct(x, d = 1, { sign = false } = {}) {
  const v = x * 100;
  const s = Math.abs(v).toFixed(d).replace('.', ',');
  if (v < 0 && Number(s.replace(',', '.')) !== 0) return MINUS + s + '%';
  return (sign && v > 0 ? '+' : '') + s + '%';
}

export function num(x, d = 0) {
  const [i, f] = Math.abs(x).toFixed(d).split('.');
  const g = i.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return (x < 0 ? MINUS : '') + g + (f ? ',' + f : '');
}

export const usd = (x) => 'US$ ' + num(x, 2);
export const fac = (x, d = 4) => num(x, d);
export const pp = (a, b) => {
  const v = (b - a) * 100;
  return (v < 0 ? MINUS : '+') + Math.abs(v).toFixed(1).replace('.', ',') + ' p.p.';
};
