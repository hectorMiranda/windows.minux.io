// Minimal browser-global shims so pure modules import under Node.
import { webcrypto } from 'node:crypto';
if (!globalThis.crypto) globalThis.crypto = webcrypto;
if (!globalThis.btoa) globalThis.btoa = (s) => Buffer.from(s, 'binary').toString('base64');
if (!globalThis.location) globalThis.location = { origin: 'http://localhost' };
if (!globalThis.performance) globalThis.performance = { now: () => 0 };
if (!globalThis.Blob) globalThis.Blob = class { constructor(p){ this.size = (p?.[0]?.length)||0; } };

let pass = 0, fail = 0;
export function test(name, fn) {
  try { fn(); pass++; console.log('  \u2713', name); }
  catch (e) { fail++; console.error('  \u2717', name, '—', e.message); }
}
export function eq(a, b, msg) { const A = JSON.stringify(a), B = JSON.stringify(b);
  if (A !== B) throw new Error(`${msg || ''} expected ${B} got ${A}`); }
export function ok(c, msg) { if (!c) throw new Error(msg || 'expected truthy'); }
export function summary() { console.log(`\n${pass} passed, ${fail} failed`); if (fail) process.exit(1); }
