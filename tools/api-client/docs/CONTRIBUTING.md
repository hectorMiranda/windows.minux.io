# Contributing

1. Keep modules small and layered (ui → model/http → util).
2. Pure logic goes in a testable module with a `*.test.mjs`.
3. No runtime dependencies, no build step.
4. Run `node tests/run.mjs` before committing.
