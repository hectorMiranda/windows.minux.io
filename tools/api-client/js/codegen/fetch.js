// JavaScript fetch code generator
export function gen(r) {
  const init = { method: r.method, headers: r.headers };
  if (r.hasBody) init.body = r.body;
  return `await fetch(${JSON.stringify(r.url)}, ${JSON.stringify(init, null, 2)});`;
}
