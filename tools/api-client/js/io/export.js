// Export collections to disk-friendly formats.
export function toMinuxJson(collection) {
  return JSON.stringify({ schemaVersion: 1, ...collection }, null, 2);
}
export function download(filename, text, type = 'application/json') {
  const blob = new Blob([text], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
export function toHar(history) {
  return JSON.stringify({ log: { version: '1.2', creator: { name: 'Minux API Studio', version: '0.1' },
    entries: history.map((h) => ({ startedDateTime: new Date(h.at).toISOString(),
      time: h.durationMs, request: { method: h.method, url: h.url },
      response: { status: h.status }, })) } }, null, 2);
}
