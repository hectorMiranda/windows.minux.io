// Java (HttpClient) code generator
export function gen(r) {
  let s = `HttpClient client = HttpClient.newHttpClient();\nHttpRequest request = HttpRequest.newBuilder()\n    .uri(URI.create(${JSON.stringify(r.url)}))\n`;
  for (const [k, v] of Object.entries(r.headers)) s += `    .header(${JSON.stringify(k)}, ${JSON.stringify(v)})\n`;
  const m = r.hasBody ? `method(${JSON.stringify(r.method)}, HttpRequest.BodyPublishers.ofString(${JSON.stringify(r.body)}))` : `method(${JSON.stringify(r.method)}, HttpRequest.BodyPublishers.noBody())`;
  s += `    .${m}\n    .build();\nHttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());\nSystem.out.println(response.body());`;
  return s;
}
