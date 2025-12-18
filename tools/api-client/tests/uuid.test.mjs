import { test, ok } from './harness.mjs';
import { uuid, shortId } from '../js/util/uuid.js';
test('uuid v4 shape', () => ok(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}/.test(uuid())));
test('shortId length', () => ok(shortId(6).length === 6));
