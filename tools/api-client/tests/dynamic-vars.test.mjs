import { test, ok, eq } from './harness.mjs';
import { resolveDynamic, dynamicNames } from '../js/util/dynamic-vars.js';
test('timestamp numeric', () => ok(/^[0-9]+$/.test(resolveDynamic('{{$timestamp}}'))));
test('uuid shape', () => ok(/[0-9a-f-]{36}/.test(resolveDynamic('{{$uuid}}'))));
test('names include counter', () => ok(dynamicNames().includes('$counter')));
