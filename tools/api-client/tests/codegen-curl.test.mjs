import { test, ok } from './harness.mjs';
import { generate } from '../js/codegen/index.js';
import { newRequest } from '../js/model/request.js';
const r = newRequest({ method: 'POST', url: 'https://api.test/x', headers: [{ enabled: true, key: 'X', value: '1' }], body: { mode: 'raw', raw: '{}', rawType: 'json' } });
test('curl includes method', () => ok(generate('curl', r, {}).includes('-X POST')));
test('python includes requests', () => ok(generate('python', r, {}).includes('import requests')));
test('go includes net/http', () => ok(generate('go', r, {}).includes('net/http')));
