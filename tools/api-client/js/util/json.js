// Safe JSON parse + stable pretty-printer.
export function tryParse(text) {
  try { return { ok: true, value: JSON.parse(text) }; }
  catch (e) { return { ok: false, error: e.message }; }
}
export function pretty(value, indent = 2) {
  try { return JSON.stringify(value, null, indent); }
  catch { return String(value); }
}
export function isJsonContentType(ct = '') {
  return /\bjson\b/i.test(ct);
}
