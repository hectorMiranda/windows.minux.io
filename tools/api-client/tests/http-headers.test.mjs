import { test, eq } from './harness.mjs';
import { buildHeaders, headerGet } from '../js/http/headers.js';
import { interpolate } from '../js/util/interpolate.js';
test('build', () => eq(buildHeaders({ headers: [{ enabled: true, key: 'A', value: '{{v}}' }] }, { v: '1' }, interpolate), { A: '1' }));
test('case-insensitive get', () => eq(headerGet({ 'Content-Type': 'x' }, 'content-type'), 'x'));
