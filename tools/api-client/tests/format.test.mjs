import { test, eq } from './harness.mjs';
import { bytes, ms } from '../js/util/format.js';
test('bytes B', () => eq(bytes(512), '512 B'));
test('bytes KB', () => eq(bytes(2048), '2.00 KB'));
test('ms', () => eq(ms(250), '250 ms'));
test('s', () => eq(ms(1500), '1.50 s'));
