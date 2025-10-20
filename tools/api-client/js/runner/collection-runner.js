import { send } from '../http/client.js';
import { walk } from '../model/collection.js';
import { runScript } from '../scripting/sandbox.js';
// Run every request in a collection sequentially, collecting results.
export async function runCollection(collection, scope = {}, onProgress = () => {}) {
  const requests = [];
  walk(collection, (n) => { if (n.method || n.type === 'request') requests.push(n); });
  const results = [];
  let env = { ...scope };
  for (let idx = 0; idx < requests.length; idx++) {
    const req = requests[idx];
    const res = await send(req, env);
    const test = runScript(req.tests, { request: req, response: res, env });
    results.push({ name: req.name, status: res.status, ok: res.ok, durationMs: res.durationMs, tests: test.results });
    onProgress({ idx, total: requests.length, name: req.name });
  }
  const passed = results.flatMap((r) => r.tests).filter((t) => t.passed).length;
  const total = results.flatMap((r) => r.tests).length;
  return { results, summary: { requests: results.length, passed, total } };
}
