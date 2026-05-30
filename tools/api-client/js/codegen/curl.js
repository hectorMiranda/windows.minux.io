// cURL code generator
export function gen(r) {
  const lines = [`curl -X ${r.method} '${r.url}'`];
  for (const [k, v] of Object.entries(r.headers)) lines.push(`  -H '${k}: ${v}'`);
  if (r.hasBody) lines.push(`  --data '${r.body.replace(/'/g, "'\\\\''")}'`);
  return lines.join(' \\\n');
}
