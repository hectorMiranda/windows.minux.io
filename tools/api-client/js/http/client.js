// The send engine. Builds the final request, times it, and normalizes output.
import { enabledPairs } from '../model/request.js';
import { interpolate } from '../util/interpolate.js';
import { buildHeaders } from './headers.js';
import { buildBody } from './body.js';
import { applyAuth } from './auth.js';
import { uuid } from '../util/uuid.js';

export function buildUrl(request, scope) {
  const raw = interpolate(request.url || '', scope);
  let url;
  try { url = new URL(raw); } catch { url = new URL(raw, location.origin); }
  for (const p of enabledPairs(request.params)) url.searchParams.append(interpolate(p.key, scope), interpolate(p.value, scope));
  return url;
}

export async function send(request, scope = {}, opts = {}) {
  const url = buildUrl(request, scope);
  const headers = buildHeaders(request, scope, interpolate);
  const { body, headers: bodyHeaders } = buildBody(request, scope);
  Object.assign(headers, bodyHeaders, headers); // explicit headers win
  applyAuth(request.auth, headers, url, scope);

  const init = { method: request.method, headers, body, redirect: 'follow', signal: opts.signal };
  const started = performance.now();
  let res, err = null;
  try { res = await fetch(url.toString(), init); }
  catch (e) { err = e; }
  const durationMs = performance.now() - started;

  if (err) {
    return { id: uuid(), ok: false, networkError: true, error: String(err.message || err),
      url: url.toString(), method: request.method, durationMs, status: 0, headers: {}, body: '', size: 0 };
  }
  const text = await res.text();
  const outHeaders = {};
  res.headers.forEach((v, k) => { outHeaders[k] = v; });
  return {
    id: uuid(), ok: res.ok, status: res.status, statusText: res.statusText,
    url: res.url || url.toString(), method: request.method,
    headers: outHeaders, body: text, size: new Blob([text]).size,
    durationMs, redirected: res.redirected, type: res.type,
  };
}
