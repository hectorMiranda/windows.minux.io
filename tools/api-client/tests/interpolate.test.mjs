import { test, eq, ok } from './harness.mjs';
import { interpolate, usedVars, interpObject } from '../js/util/interpolate.js';
test('substitutes vars', () => eq(interpolate('a {{x}} b', { x: 1 }), 'a 1 b'));
test('keeps unknown', () => eq(interpolate('{{y}}', {}), '{{y}}'));
test('lists used vars', () => eq(usedVars('{{a}}{{b}}'), ['a','b']));
test('deep object', () => eq(interpObject({ u: '{{x}}' }, { x: 'q' }), { u: 'q' }));
