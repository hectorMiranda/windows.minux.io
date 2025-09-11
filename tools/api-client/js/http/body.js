// Resolve a request body into a fetch-compatible payload + implied headers.
import { enabledPairs } from '../model/request.js';
import { interpolate } from '../util/interpolate.js';
export function buildBody(request, scope) {
  const b = request.body || { mode: 'none' };
  if (['GET','HEAD'].includes(request.method)) return { body: undefined, headers: {} };
  switch (b.mode) {
    case 'raw': {
      const ct = { json: 'application/json', xml: 'application/xml', text: 'text/plain', html: 'text/html' }[b.rawType] || 'text/plain';
      return { body: interpolate(b.raw || '', scope), headers: { 'Content-Type': ct } };
    }
    case 'urlencoded': {
      const p = new URLSearchParams();
      for (const kv of enabledPairs(b.urlencoded)) p.append(interpolate(kv.key, scope), interpolate(kv.value, scope));
      return { body: p.toString(), headers: { 'Content-Type': 'application/x-www-form-urlencoded' } };
    }
    case 'form': {
      const fd = new FormData();
      for (const kv of enabledPairs(b.form)) fd.append(interpolate(kv.key, scope), interpolate(kv.value, scope));
      return { body: fd, headers: {} }; // browser sets multipart boundary
    }
    default: return { body: undefined, headers: {} };
  }
}
