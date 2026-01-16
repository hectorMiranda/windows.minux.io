# Security notes

Requests run from the page, subject to browser CORS. Scripts execute in the
page context — do not paste untrusted scripts. Secrets stored in environments
live in `localStorage`; mark them `secret` to mask in the UI, but treat the
machine as the trust boundary.
