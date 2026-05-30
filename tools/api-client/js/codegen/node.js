// Node (https) code generator
export function gen(r) {
  const u = new URL(r.url);
  return `const https = require('https');\nconst opts = ${JSON.stringify({ method: r.method, headers: r.headers }, null, 2)};\nconst req = https.request(${JSON.stringify(r.url)}, opts, (res) => { let d=''; res.on('data',c=>d+=c); res.on('end',()=>console.log(d)); });\n${r.hasBody ? `req.write(${JSON.stringify(r.body)});\n` : ''}req.end();`;
}
