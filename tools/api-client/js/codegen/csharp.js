// C# (HttpClient) code generator
export function gen(r) {
  let s = `using var client = new HttpClient();\nvar request = new HttpRequestMessage(new HttpMethod(${JSON.stringify(r.method)}), ${JSON.stringify(r.url)});\n`;
  for (const [k, v] of Object.entries(r.headers)) s += `request.Headers.TryAddWithoutValidation(${JSON.stringify(k)}, ${JSON.stringify(v)});\n`;
  if (r.hasBody) s += `request.Content = new StringContent(${JSON.stringify(r.body)});\n`;
  s += `var response = await client.SendAsync(request);\nConsole.WriteLine(await response.Content.ReadAsStringAsync());`;
  return s;
}
