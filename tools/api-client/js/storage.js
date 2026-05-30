// localStorage-backed persistence with an in-memory fallback.
const PREFIX = 'minux.apistudio.';
const mem = new Map();
const backing = (() => {
  try { const k = PREFIX + '__t'; localStorage.setItem(k, '1'); localStorage.removeItem(k); return localStorage; }
  catch { return null; }
})();
export function save(key, value) {
  const s = JSON.stringify(value);
  if (backing) backing.setItem(PREFIX + key, s); else mem.set(key, s);
}
export function load(key, fallback = null) {
  const raw = backing ? backing.getItem(PREFIX + key) : mem.get(key);
  if (raw == null) return fallback;
  try { return JSON.parse(raw); } catch { return fallback; }
}
export function remove(key) { if (backing) backing.removeItem(PREFIX + key); else mem.delete(key); }
export function keys() {
  if (backing) return Object.keys(backing).filter((k) => k.startsWith(PREFIX)).map((k) => k.slice(PREFIX.length));
  return [...mem.keys()];
}
