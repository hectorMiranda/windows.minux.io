// Minimal expectation library used inside test scripts.
export function expect(actual) {
  return {
    toBe: (e) => assert(actual === e, `expected ${fmt(actual)} to be ${fmt(e)}`),
    toEqual: (e) => assert(JSON.stringify(actual) === JSON.stringify(e), `expected deep equal`),
    toBeTruthy: () => assert(!!actual, `expected truthy, got ${fmt(actual)}`),
    toBeGreaterThan: (e) => assert(actual > e, `expected ${fmt(actual)} > ${fmt(e)}`),
    toContain: (e) => assert(String(actual).includes(e), `expected to contain ${fmt(e)}`),
    toMatch: (re) => assert(re.test(String(actual)), `expected to match ${re}`),
  };
}
function assert(cond, msg) { if (!cond) throw new Error(msg); }
function fmt(v) { try { return JSON.stringify(v); } catch { return String(v); } }
