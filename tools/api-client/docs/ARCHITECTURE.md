# Architecture

Minux API Studio is a dependency-free ES-module web app. No build step.

```
index.html
  css/        design tokens, layout, components, themes
  js/
    util/     pure helpers (dom, uuid, interpolate, format, json, dynamic-vars)
    model/    request, collection, environment, history, schema
    http/     headers, body, auth, client (the send engine)
    scripting/ sandbox + 'mx' API + assertions
    codegen/  per-language generators + registry
    io/       import/export (curl, postman, openapi, har)
    runner/   collection runner
    ui/       all rendering (sidebar, editor, viewer, palette, modals)
    i18n/     locales
    state.js  observable store
    storage.js localStorage persistence
    app.js    bootstrap + wiring
```

Layers depend downward only: `ui` → `model`/`http`/`codegen` → `util`. The
`http` layer never touches the DOM, which is why most of it is unit-tested.
