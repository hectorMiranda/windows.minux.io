import { test, eq, ok } from './harness.mjs';
import { newRequest, METHODS, enabledPairs } from '../js/model/request.js';
test('defaults', () => eq(newRequest().method, 'GET'));
test('methods', () => ok(METHODS.includes('PATCH')));
test('enabled filter', () => eq(enabledPairs([{ enabled: false, key: 'a' }, { key: 'b', value: 1 }]).length, 1));
