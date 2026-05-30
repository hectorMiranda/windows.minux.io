import { test, eq } from './harness.mjs';
import { applyAuth } from '../js/http/auth.js';
const h = {}; applyAuth({ type: 'bearer', token: 't' }, h, new URL('https://x/'), {});
test('bearer', () => eq(h['Authorization'], 'Bearer t'));
const h2 = {}; applyAuth({ type: 'basic', username: 'u', password: 'p' }, h2, new URL('https://x/'), {});
test('basic', () => eq(h2['Authorization'], 'Basic ' + btoa('u:p')));
