// History entries capture what was actually sent and what came back.
export function historyEntry(request, response) {
  return {
    id: response.id,
    at: Date.now(),
    method: request.method,
    url: response.url || request.url,
    status: response.status,
    ok: response.ok,
    durationMs: response.durationMs,
    size: response.size,
    snapshot: { method: request.method, url: request.url, headers: request.headers, body: request.body },
  };
}
