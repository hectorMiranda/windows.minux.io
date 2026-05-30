import { expect } from './assertions.js';
// The 'mx' object exposed to pre-request and test scripts.
export function makeApi({ request, response, env, results }) {
  return {
    request, response,
    env: {
      get: (k) => env[k],
      set: (k, v) => { env[k] = v; },
      all: () => ({ ...env }),
    },
    expect,
    test: (name, fn) => {
      try { fn(); results.push({ name, passed: true }); }
      catch (e) { results.push({ name, passed: false, error: e.message }); }
    },
    response_json: () => { try { return JSON.parse(response?.body || 'null'); } catch { return null; } },
  };
}
