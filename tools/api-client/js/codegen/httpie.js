// HTTPie code generator
export function gen(r) {
  const h = Object.entries(r.headers).map(([k, v]) => `'${k}:${v}'`).join(' ');
  const body = r.hasBody ? ` <<< '${r.body}'` : '';
  return `http ${r.method} '${r.url}' ${h}${body}`.trim();
}
