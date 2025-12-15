import { test, eq, ok } from './harness.mjs';
import { tryParse, pretty, isJsonContentType } from '../js/util/json.js';
test('parse ok', () => ok(tryParse('{\"a\":1}').ok));
test('parse fail', () => ok(!tryParse('{').ok));
test('pretty', () => eq(pretty({ a: 1 }), '{\n  \"a\": 1\n}'));
test('json ct', () => ok(isJsonContentType('application/json; charset=utf-8')));
