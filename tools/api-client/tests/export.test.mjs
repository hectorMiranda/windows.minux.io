import { test, ok } from './harness.mjs';
import { toMinuxJson, toHar } from '../js/io/export.js';
import { newCollection } from '../js/model/collection.js';
test('minux json has schema', () => ok(toMinuxJson(newCollection('c')).includes('schemaVersion')));
test('har has log', () => ok(JSON.parse(toHar([{ at: 0, durationMs: 1, method: 'GET', url: 'x', status: 200 }])).log.entries.length === 1));
