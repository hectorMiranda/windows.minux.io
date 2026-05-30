import { uuid } from '../util/uuid.js';
// An environment is a named bag of variables. 'globals' is the implicit base.
export function newEnvironment(name = 'New Environment') {
  return { id: uuid(), name, values: [] }; // values: [{enabled,key,value,secret}]
}
export function envScope(env) {
  const scope = {};
  for (const v of env?.values || []) {
    if (v.enabled === false || !v.key) continue;
    scope[v.key] = v.value;
  }
  return scope;
}
export function mergeScopes(...envs) {
  return Object.assign({}, ...envs.map(envScope));
}
