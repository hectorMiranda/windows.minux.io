import { test, ok } from './harness.mjs';
import { validateCollection, migrate } from '../js/model/schema.js';
import { newCollection } from '../js/model/collection.js';
test('valid', () => ok(validateCollection(newCollection('c')).ok));
test('invalid', () => ok(!validateCollection({ type: 'x' }).ok));
test('migrate adds version', () => ok(migrate({}).schemaVersion));
