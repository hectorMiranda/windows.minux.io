# Testing

Pure modules (util, model, http, codegen, io, scripting) are unit-tested with
a tiny zero-dependency harness:
```bash
node tests/run.mjs
```
The harness shims the few browser globals the modules touch (`crypto`, `btoa`,
`location`, `Blob`, `performance`).
