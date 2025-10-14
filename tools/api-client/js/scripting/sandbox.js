import { makeApi } from './mx-api.js';
// Run user scripts with a constrained 'mx' API. Not a security boundary —
// scripts run in the page; this only narrows the convenient surface.
export function runScript(code, ctx) {
  const results = [];
  const mx = makeApi({ ...ctx, results });
  if (!code || !code.trim()) return { results, error: null };
  try {
    const fn = new Function('mx', 'console', `"use strict";\n${code}`);
    fn(mx, { log: (...a) => console.log('[script]', ...a) });
    return { results, error: null };
  } catch (e) {
    return { results, error: e.message };
  }
}
