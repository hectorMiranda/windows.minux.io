import { uuid } from '../util/uuid.js';
// The canonical request shape. Open, documented, diff-friendly.
export function newRequest(partial = {}) {
  return {
    id: uuid(),
    name: 'Untitled Request',
    method: 'GET',
    url: '',
    params: [],          // [{enabled,key,value,description}]
    headers: [],         // [{enabled,key,value,description}]
    body: { mode: 'none', raw: '', rawType: 'json', form: [], urlencoded: [] },
    auth: { type: 'none' },
    preRequest: '',      // script
    tests: '',           // script
    createdAt: Date.now(),
    ...partial,
  };
}
export const METHODS = ['GET','POST','PUT','PATCH','DELETE','HEAD','OPTIONS'];
export function enabledPairs(list = []) {
  return list.filter((r) => r.enabled !== false && r.key);
}
