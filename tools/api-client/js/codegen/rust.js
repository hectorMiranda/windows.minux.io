// Rust (reqwest) code generator
export function gen(r) {
  let s = `let client = reqwest::Client::new();\nlet res = client.request(reqwest::Method::${r.method}, ${JSON.stringify(r.url)})\n`;
  for (const [k, v] of Object.entries(r.headers)) s += `    .header(${JSON.stringify(k)}, ${JSON.stringify(v)})\n`;
  if (r.hasBody) s += `    .body(${JSON.stringify(r.body)})\n`;
  s += `    .send().await?;\nprintln!(\"{}\", res.text().await?);`;
  return s;
}
