// XMLHttpRequest code generator
export function gen(r) {
  let s = `const xhr = new XMLHttpRequest();\nxhr.open(${JSON.stringify(r.method)}, ${JSON.stringify(r.url)});\n`;
  for (const [k, v] of Object.entries(r.headers)) s += `xhr.setRequestHeader(${JSON.stringify(k)}, ${JSON.stringify(v)});\n`;
  s += `xhr.send(${r.hasBody ? JSON.stringify(r.body) : ''});`;
  return s;
}
