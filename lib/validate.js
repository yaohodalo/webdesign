// lib/validate.js — small validation helpers

export function str(v, { min = 1, max = 500 } = {}) {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  if (t.length < min || t.length > max) return null;
  return t;
}

export function email(v) {
  const t = str(v, { max: 200 });
  if (!t) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t) ? t.toLowerCase() : null;
}

export function num(v, { min = -180, max = 180 } = {}) {
  const n = typeof v === 'number' ? v : parseFloat(v);
  if (!Number.isFinite(n)) return null;
  if (n < min || n > max) return null;
  return n;
}

export function bool(v) {
  if (typeof v === 'boolean') return v;
  if (v === 'true' || v === 'yes' || v === '1' || v === 'on') return true;
  return false;
}

export function isoDate(v) {
  const t = str(v, { max: 50 });
  if (!t) return null;
  const d = new Date(t);
  return isNaN(d.getTime()) ? null : d.toISOString();
}
