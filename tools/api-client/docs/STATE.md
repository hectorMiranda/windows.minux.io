# State & persistence

`state.js` holds collections, environments, history, active environment and
theme. Any mutation goes through `update(fn)`, which persists to `localStorage`
and notifies subscribers. History is capped at 200 entries.
