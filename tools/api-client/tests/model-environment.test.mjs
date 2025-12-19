import { test, eq } from './harness.mjs';
import { newEnvironment, envScope, mergeScopes } from '../js/model/environment.js';
test('scope', () => eq(envScope({ values: [{ enabled: true, key: 'x', value: '1' }] }), { x: '1' }));
test('merge', () => eq(mergeScopes({ values: [{ key: 'a', value: 1 }] }, { values: [{ key: 'b', value: 2 }] }), { a: 1, b: 2 }));
