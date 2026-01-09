# Authentication

Per-request auth schemes: `none`, `bearer`, `basic`, `apikey` (header or
query), and raw `header`. Auth is applied after header building, so an explicit
`Authorization` header you set yourself always wins.
