import { test, ok } from './harness.mjs';
import { importOpenApi } from '../js/io/import-openapi.js';
const c = importOpenApi({ info: { title: 'O' }, paths: { '/a': { get: { summary: 'A' } } } });
test('folder created', () => ok(c.children.length === 1));
test('request created', () => ok(c.children[0].children[0].method === 'GET'));
