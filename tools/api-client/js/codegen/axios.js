// Axios code generator
export function gen(r) {
  const cfg = { method: r.method.toLowerCase(), url: r.url, headers: r.headers };
  if (r.hasBody) cfg.data = r.body;
  return `import axios from 'axios';\nconst res = await axios(${JSON.stringify(cfg, null, 2)});`;
}
