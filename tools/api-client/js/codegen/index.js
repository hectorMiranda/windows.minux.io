import { resolve } from './model.js';
import { gen as curl } from './curl.js';
import { gen as httpie } from './httpie.js';
import { gen as wget } from './wget.js';
import { gen as fetch } from './fetch.js';
import { gen as axios } from './axios.js';
import { gen as xhr } from './xhr.js';
import { gen as node } from './node.js';
import { gen as python } from './python.js';
import { gen as go } from './go.js';
import { gen as ruby } from './ruby.js';
import { gen as php } from './php.js';
import { gen as csharp } from './csharp.js';
import { gen as java } from './java.js';
import { gen as powershell } from './powershell.js';
import { gen as rust } from './rust.js';
export const GENERATORS = {
  curl: { label: 'cURL', gen: curl },
  httpie: { label: 'HTTPie', gen: httpie },
  wget: { label: 'wget', gen: wget },
  fetch: { label: 'JavaScript fetch', gen: fetch },
  axios: { label: 'Axios', gen: axios },
  xhr: { label: 'XMLHttpRequest', gen: xhr },
  node: { label: 'Node (https)', gen: node },
  python: { label: 'Python requests', gen: python },
  go: { label: 'Go (net/http)', gen: go },
  ruby: { label: 'Ruby (net/http)', gen: ruby },
  php: { label: 'PHP (cURL)', gen: php },
  csharp: { label: 'C# (HttpClient)', gen: csharp },
  java: { label: 'Java (HttpClient)', gen: java },
  powershell: { label: 'PowerShell', gen: powershell },
  rust: { label: 'Rust (reqwest)', gen: rust }
};
export function generate(lang, req, scope) {
  const g = GENERATORS[lang]; if (!g) throw new Error('unknown generator: ' + lang);
  return g.gen(resolve(req, scope));
}
export function languages() { return Object.entries(GENERATORS).map(([id, g]) => ({ id, label: g.label })); }
