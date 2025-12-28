import { test, eq, ok } from './harness.mjs';
import { buildBody } from '../js/http/body.js';
test('raw json', () => { const b = buildBody({ method: 'POST', body: { mode: 'raw', raw: '{}', rawType: 'json' } }, {}); eq(b.headers['Content-Type'], 'application/json'); });
test('get has no body', () => ok(buildBody({ method: 'GET', body: { mode: 'raw', raw: 'x' } }, {}).body === undefined));
