# Scripting

Pre-request and test scripts receive a single `mx` object.

```js
// test script
mx.test('status is 200', () => mx.expect(mx.response.status).toBe(200));
const body = mx.response_json();
mx.env.set('token', body.token);   // persist for later requests
```
Available: `mx.request`, `mx.response`, `mx.env.{get,set,all}`, `mx.expect`,
`mx.test`, `mx.response_json()`. Scripts run in the page; treat them as
convenience, not a security boundary.
