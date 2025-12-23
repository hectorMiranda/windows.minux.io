import { test, eq, ok } from './harness.mjs';
import { importCurl } from '../js/io/import-curl.js';
const r = importCurl("curl -X POST 'https://api.test/v1' -H 'Accept: application/json' -d '{}'");
test('method', () => eq(r.method, 'POST'));
test('url', () => eq(r.url, 'https://api.test/v1'));
test('header parsed', () => ok(r.headers.some((h) => h.key === 'Accept')));
