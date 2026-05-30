# Minux Tools

First-class tools that ship inside the Minux platform. Each tool is a
self-contained module that can run standalone (served as a static web app)
and be embedded in the Minux desktop control center via WebView2.

| Tool | Path | Status |
|------|------|--------|
| API Studio | `api-client/` | in development |

API Studio is a Postman-class HTTP/API workbench: build any request, organize
work into collections, switch environments, script tests, and generate client
code. It is designed to be faster, more transparent, and more hackable than
the tools it replaces — plain files on disk, an open schema, no lock-in.
