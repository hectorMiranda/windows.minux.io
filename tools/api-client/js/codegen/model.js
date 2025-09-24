import { buildUrl } from '../http/client.js';
import { buildHeaders } from '../http/headers.js';
import { buildBody } from '../http/body.js';
import { applyAuth } from '../http/auth.js';
import { interpolate } from '../util/interpolate.js';
// Resolve a request into a flat, language-agnostic shape for generators.
export function resolve(req, scope = {}) {
  const url = buildUrl(req, scope);
  const headers = buildHeaders(req, scope, interpolate);
  const { body, headers: bodyHeaders } = buildBody(req, scope);
  Object.assign(headers, bodyHeaders, headers);
  applyAuth(req.auth, headers, url, scope);
  let bodyText = '';
  if (typeof body === 'string') bodyText = body;
  else if (body instanceof URLSearchParams) bodyText = body.toString();
  return { method: req.method, url: url.toString(), headers, body: bodyText, hasBody: !!bodyText };
}
