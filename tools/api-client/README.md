# Minux API Studio

A Postman-class HTTP & API workbench for the Minux platform.

> Build any HTTP request, organize work into **Collections**, switch
> **Environments**, chain requests, write tests, and generate client code —
> all from plain, version-controllable files with an open schema.

## Why another API client?

- **Open, file-based format.** Collections and environments are plain JSON you
  can diff, review, and commit. No opaque cloud lock-in.
- **Transparent.** Every byte sent and received is visible. Timing, size, and
  redirects are reported honestly.
- **Hackable.** Small ES modules, no build step required to run.
- **Fast.** Keyboard-first. Sends with one shortcut.

## Run it

```bash
cd tools/api-client
python3 -m http.server 5173
# open http://localhost:5173
```

## Status

Under active development on the `develop` branch. See `CHANGELOG.md`.
