import { test, ok, eq } from './harness.mjs';
import { runScript } from '../js/scripting/sandbox.js';
const out = runScript('mx.test(\"ok\", () => mx.expect(1).toBe(1)); mx.env.set(\"k\", 2);', { request: {}, response: { body: '{}' }, env: {} });
test('test recorded', () => ok(out.results[0].passed));
test('no error', () => eq(out.error, null));
