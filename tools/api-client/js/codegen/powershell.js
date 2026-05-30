// PowerShell code generator
export function gen(r) {
  const h = Object.entries(r.headers).map(([k, v]) => `  ${JSON.stringify(k)} = ${JSON.stringify(v)}`).join('\n');
  const body = r.hasBody ? ` -Body ${JSON.stringify(r.body)}` : '';
  return `$headers = @{\n${h}\n}\nInvoke-RestMethod -Uri ${JSON.stringify(r.url)} -Method ${r.method} -Headers $headers${body}`;
}
