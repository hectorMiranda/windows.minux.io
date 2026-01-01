# Document schema

Collections and environments are plain JSON with a stable shape.

A **request** node:
```json
{ "id":"…","type":"request","name":"…","method":"GET","url":"…",
  "params":[],"headers":[],"body":{"mode":"none"},"auth":{"type":"none"} }
```
A **collection** is a tree: every node has `id`, `type` (`collection`/`folder`/`request`)
and an ordered `children` array. Unlike Postman, ids are stable and the tree is
uniform, so folders and requests are addressed the same way.
