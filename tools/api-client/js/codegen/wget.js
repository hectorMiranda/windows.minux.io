// wget code generator
export function gen(r) {
  const h = Object.entries(r.headers).map(([k, v]) => `--header='${k}: ${v}'`).join(' ');
  const body = r.hasBody ? ` --body-data='${r.body}'` : '';
  return `wget --method=${r.method} ${h}${body} '${r.url}'`;
}
