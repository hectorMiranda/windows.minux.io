// Apply auth schemes by mutating a headers/params object.
import { interpolate } from '../util/interpolate.js';
export function applyAuth(auth, headers, urlObj, scope) {
  if (!auth || auth.type === 'none') return;
  const I = (s) => interpolate(s || '', scope);
  switch (auth.type) {
    case 'bearer':
      headers['Authorization'] = `Bearer ${I(auth.token)}`; break;
    case 'basic':
      headers['Authorization'] = 'Basic ' + btoa(`${I(auth.username)}:${I(auth.password)}`); break;
    case 'apikey': {
      if (auth.in === 'query') urlObj.searchParams.set(I(auth.key), I(auth.value));
      else headers[I(auth.key) || 'X-API-Key'] = I(auth.value);
      break;
    }
    case 'header':
      headers[I(auth.key)] = I(auth.value); break;
  }
}
export const AUTH_TYPES = ['none','bearer','basic','apikey','header'];
