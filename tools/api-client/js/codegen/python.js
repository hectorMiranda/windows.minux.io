// Python requests code generator
export function gen(r) {
  const headers = JSON.stringify(r.headers, null, 4).replace(/"/g, "'");
  const body = r.hasBody ? `, data=${JSON.stringify(r.body).replace(/"/g, "'")}` : '';
  return `import requests\n\nresp = requests.request(${JSON.stringify(r.method)}, ${JSON.stringify(r.url)}, headers=${headers}${body})\nprint(resp.status_code, resp.text)`;
}
