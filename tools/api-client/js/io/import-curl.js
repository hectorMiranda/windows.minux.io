import { newRequest } from '../model/request.js';
// Parse a 'curl' command line into a request model.
export function importCurl(text) {
  const req = newRequest({ name: 'Imported from cURL' });
  const tokens = tokenize(text.replace(/\\\n/g, ' '));
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t === '-X' || t === '--request') req.method = tokens[++i]?.toUpperCase() || 'GET';
    else if (t === '-H' || t === '--header') { const [k, ...v] = tokens[++i].split(':'); req.headers.push({ enabled: true, key: k.trim(), value: v.join(':').trim() }); }
    else if (t === '-d' || t === '--data' || t === '--data-raw') { req.body = { mode: 'raw', raw: tokens[++i], rawType: 'json' }; if (req.method === 'GET') req.method = 'POST'; }
    else if (t === '-u' || t === '--user') { const [u, p] = tokens[++i].split(':'); req.auth = { type: 'basic', username: u, password: p }; }
    else if (!t.startsWith('-') && t !== 'curl') req.url = t.replace(/^['"]|['"]$/g, '');
  }
  return req;
}
function tokenize(s) {
  const out = []; const re = /'([^']*)'|"([^"]*)"|(\S+)/g; let m;
  while ((m = re.exec(s))) out.push(m[1] ?? m[2] ?? m[3]);
  return out;
}
