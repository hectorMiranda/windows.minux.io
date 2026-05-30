// {{$dynamic}} variables resolved at send-time. Deterministic-free helpers.
let counter = 0;
export const DYNAMIC = {
  $timestamp: () => Math.floor(Date.now() / 1000),
  $isoTimestamp: () => new Date().toISOString(),
  $randomInt: () => Math.floor(Math.random() * 1000),
  $guid: () => crypto.randomUUID(),
  $uuid: () => crypto.randomUUID(),
  $randomColor: () => '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0'),
  $counter: () => ++counter,
};
export function resolveDynamic(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/\{\{\s*(\$\w+)\s*\}\}/g, (m, k) => (DYNAMIC[k] ? String(DYNAMIC[k]()) : m));
}
export function dynamicNames() { return Object.keys(DYNAMIC); }
