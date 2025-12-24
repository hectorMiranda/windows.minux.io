import { test, eq, ok } from './harness.mjs';
import { importPostman } from '../js/io/import-postman.js';
const c = importPostman({ info: { name: 'P' }, item: [{ name: 'r', request: { method: 'GET', url: 'https://x/y' } }] });
test('name', () => eq(c.name, 'P'));
test('child', () => eq(c.children[0].method, 'GET'));
