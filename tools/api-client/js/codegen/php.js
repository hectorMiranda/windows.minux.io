// PHP (cURL) code generator
export function gen(r) {
  let s = `<?php\n$ch = curl_init();\ncurl_setopt($ch, CURLOPT_URL, ${JSON.stringify(r.url)});\ncurl_setopt($ch, CURLOPT_RETURNTRANSFER, true);\ncurl_setopt($ch, CURLOPT_CUSTOMREQUEST, ${JSON.stringify(r.method)});\n`;
  const h = Object.entries(r.headers).map(([k, v]) => `${JSON.stringify(`${k}: ${v}`)}`).join(', ');
  s += `curl_setopt($ch, CURLOPT_HTTPHEADER, [${h}]);\n`;
  if (r.hasBody) s += `curl_setopt($ch, CURLOPT_POSTFIELDS, ${JSON.stringify(r.body)});\n`;
  s += `$response = curl_exec($ch);\ncurl_close($ch);\necho $response;`;
  return s;
}
