// Header helpers: build a Headers object, common presets, case-insensitive get.
import { enabledPairs } from '../model/request.js';
export function buildHeaders(request, scope, interpolate) {
  const h = {};
  for (const p of enabledPairs(request.headers)) h[interpolate(p.key, scope)] = interpolate(p.value, scope);
  return h;
}
export const COMMON_HEADERS = [
  'Accept','Authorization','Cache-Control','Content-Type','Cookie','Origin',
  'User-Agent','X-Requested-With','X-API-Key','If-None-Match','Accept-Encoding',
];
export const CONTENT_TYPES = [
  'application/json','application/xml','text/plain','text/html',
  'application/x-www-form-urlencoded','multipart/form-data','application/octet-stream',
];
export function headerGet(headers, name) {
  const k = Object.keys(headers).find((x) => x.toLowerCase() === name.toLowerCase());
  return k ? headers[k] : undefined;
}
