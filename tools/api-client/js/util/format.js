// Human-friendly formatting for sizes, durations, dates.
export function bytes(n) {
  if (n == null) return '—';
  if (n < 1024) return `${n} B`;
  const u = ['KB','MB','GB','TB']; let i = -1; let v = n;
  do { v /= 1024; i++; } while (v >= 1024 && i < u.length - 1);
  return `${v.toFixed(v < 10 ? 2 : 1)} ${u[i]}`;
}
export function ms(n) {
  if (n == null) return '—';
  if (n < 1000) return `${Math.round(n)} ms`;
  return `${(n / 1000).toFixed(2)} s`;
}
export function when(ts) {
  const d = new Date(ts);
  return d.toLocaleString(undefined, { hour12: false });
}
