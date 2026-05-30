// {{variable}} interpolation against a scope object.
const RE = /\{\{\s*([\w.$-]+)\s*\}\}/g;
export function interpolate(str, scope = {}) {
  if (typeof str !== 'string') return str;
  return str.replace(RE, (m, key) => {
    const v = lookup(scope, key);
    return v === undefined ? m : String(v);
  });
}
export function usedVars(str) {
  const out = new Set(); let m;
  if (typeof str !== 'string') return [];
  while ((m = RE.exec(str))) out.add(m[1]);
  RE.lastIndex = 0;
  return [...out];
}
function lookup(scope, key) {
  if (key in scope) return scope[key];
  return key.split('.').reduce((o, k) => (o == null ? o : o[k]), scope);
}
export function interpObject(obj, scope) {
  if (Array.isArray(obj)) return obj.map((v) => interpObject(v, scope));
  if (obj && typeof obj === 'object') {
    const o = {}; for (const [k, v] of Object.entries(obj)) o[interpolate(k, scope)] = interpObject(v, scope); return o;
  }
  return interpolate(obj, scope);
}
