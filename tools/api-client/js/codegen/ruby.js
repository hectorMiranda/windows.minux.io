// Ruby (net/http) code generator
export function gen(r) {
  let s = `require 'net/http'\nrequire 'uri'\n\nuri = URI(${JSON.stringify(r.url)})\nreq = Net::HTTP::${r.method[0]}${r.method.slice(1).toLowerCase()}.new(uri)\n`;
  for (const [k, v] of Object.entries(r.headers)) s += `req[${JSON.stringify(k)}] = ${JSON.stringify(v)}\n`;
  if (r.hasBody) s += `req.body = ${JSON.stringify(r.body)}\n`;
  s += `res = Net::HTTP.start(uri.hostname, uri.port, use_ssl: uri.scheme == 'https') { |h| h.request(req) }\nputs res.body`;
  return s;
}
